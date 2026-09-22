export const FULLSCREEN_VERTEX = `#version 300 es
precision highp float;
out vec2 v_uv;

void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const WATER_STEP_FRAGMENT = `#version 300 es
precision highp float;
precision highp sampler2D;

in vec2 v_uv;
uniform sampler2D u_state;
uniform vec2 u_texel;
uniform float u_dt;
uniform float u_aspect;
uniform int u_impulseCount;
uniform vec4 u_impulses[16];
out vec4 outState;

void main() {
  vec4 state = texture(u_state, v_uv);
  float left = texture(u_state, v_uv - vec2(u_texel.x, 0.0)).r;
  float right = texture(u_state, v_uv + vec2(u_texel.x, 0.0)).r;
  float down = texture(u_state, v_uv - vec2(0.0, u_texel.y)).r;
  float up = texture(u_state, v_uv + vec2(0.0, u_texel.y)).r;

  float height = state.r;
  float velocity = state.g;
  float laplacian = left + right + down + up - 4.0 * height;
  velocity += laplacian * 54.0 * u_dt;
  velocity *= pow(0.972, u_dt * 60.0);
  height += velocity * u_dt;

  for (int index = 0; index < 16; index++) {
    if (index >= u_impulseCount) break;
    vec4 impulse = u_impulses[index];
    vec2 delta = (v_uv - impulse.xy) * vec2(u_aspect, 1.0);
    float distanceFromCenter = length(delta) / max(impulse.z, 0.0001);
    if (distanceFromCenter < 1.0) {
      float wave = 0.5 + 0.5 * cos(3.14159265 * distanceFromCenter);
      velocity += wave * impulse.w;
    }
  }

  float edge = min(min(v_uv.x, 1.0 - v_uv.x), min(v_uv.y, 1.0 - v_uv.y));
  float absorber = mix(0.90, 1.0, smoothstep(0.0, 0.08, edge));
  height *= absorber;
  velocity *= absorber;
  outState = vec4(clamp(height, -2.0, 2.0), clamp(velocity, -6.0, 6.0), 0.0, 1.0);
}
`;

export const POND_FRAGMENT = `#version 300 es
precision highp float;
precision highp sampler2D;

#define MAX_FISH 8

in vec2 v_uv;
uniform sampler2D u_state;
uniform vec2 u_stateTexel;
uniform vec2 u_resolution;
uniform float u_time;
uniform int u_fishCount;
uniform vec4 u_fishA[MAX_FISH];
uniform vec4 u_fishB[MAX_FISH];
out vec4 outColor;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

vec2 hash22(vec2 p) {
  float n = sin(dot(p, vec2(41.0, 289.0)));
  return fract(vec2(262144.0, 32768.0) * n);
}

float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 ease = local * local * (3.0 - 2.0 * local);
  float a = hash12(cell);
  float b = hash12(cell + vec2(1.0, 0.0));
  float c = hash12(cell + vec2(0.0, 1.0));
  float d = hash12(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, ease.x), mix(c, d, ease.x), ease.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
  for (int octave = 0; octave < 4; octave++) {
    value += valueNoise(p) * amplitude;
    p = rotation * p * 2.03 + 13.7;
    amplitude *= 0.5;
  }
  return value;
}

float voronoiRidge(vec2 p, float time) {
  vec2 base = floor(p);
  vec2 local = fract(p);
  float nearest = 10.0;
  float second = 10.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 random = hash22(base + offset);
      random = 0.5 + 0.38 * sin(time * 0.45 + 6.28318 * random);
      float distanceToPoint = length(offset + random - local);
      if (distanceToPoint < nearest) {
        second = nearest;
        nearest = distanceToPoint;
      } else if (distanceToPoint < second) {
        second = distanceToPoint;
      }
    }
  }
  return smoothstep(0.20, 0.022, second - nearest);
}

float organicCaustic(vec2 p, float time) {
  vec2 drift = vec2(time * 0.045, -time * 0.032);
  vec2 warp = vec2(
    valueNoise(p * 0.31 + drift),
    valueNoise(p * 0.31 + vec2(17.4, 9.2) - drift)
  );
  p += (warp - 0.5) * 1.85;
  float epsilon = 0.115;
  float center = valueNoise(p);
  float curvature = abs(
    valueNoise(p + vec2(epsilon, 0.0)) +
    valueNoise(p - vec2(epsilon, 0.0)) +
    valueNoise(p + vec2(0.0, epsilon)) +
    valueNoise(p - vec2(0.0, epsilon)) -
    4.0 * center
  );
  return smoothstep(0.012, 0.075, curvature);
}

float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float t = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return length(pa - ba * t);
}

float ellipseMask(vec2 p, vec2 center, vec2 radius, float feather) {
  float d = length((p - center) / radius) - 1.0;
  return smoothstep(feather, -feather, d);
}

vec3 rockLayer(vec3 color, vec2 p) {
  vec2 centers[5] = vec2[5](
    vec2(0.76, 0.74), vec2(0.82, 0.62), vec2(0.30, 0.25),
    vec2(0.17, 0.63), vec2(0.69, 0.19)
  );
  vec2 sizes[5] = vec2[5](
    vec2(45.0, 31.0), vec2(25.0, 19.0), vec2(28.0, 21.0),
    vec2(20.0, 16.0), vec2(17.0, 13.0)
  );
  for (int index = 0; index < 5; index++) {
    vec2 center = centers[index] * u_resolution;
    float shadow = ellipseMask(p, center + vec2(5.0, -7.0), sizes[index] * 1.12, 0.16);
    color = mix(color, color * 0.50, shadow * 0.65);
    float rock = ellipseMask(p, center, sizes[index], 0.08);
    float grain = fbm(p * 0.045 + float(index) * 11.0);
    vec3 stone = mix(vec3(0.20, 0.22, 0.16), vec3(0.43, 0.44, 0.32), grain);
    float highlight = smoothstep(1.0, 0.0, length((p - center - sizes[index] * 0.22) / sizes[index]));
    stone += highlight * vec3(0.13, 0.12, 0.08);
    color = mix(color, stone, rock * 0.91);
  }
  return color;
}

vec3 reedLayer(vec3 color, vec2 p) {
  vec2 anchors[10] = vec2[10](
    vec2(0.02, 0.02), vec2(0.05, 0.01), vec2(0.10, 0.02),
    vec2(0.92, 0.01), vec2(0.96, 0.02), vec2(0.99, 0.03),
    vec2(0.08, 0.98), vec2(0.14, 0.98), vec2(0.89, 0.98), vec2(0.95, 0.99)
  );
  for (int index = 0; index < 10; index++) {
    vec2 a = anchors[index] * u_resolution;
    float direction = index < 3 ? 0.72 : (index < 6 ? 2.38 : (index < 8 ? -0.88 : -2.28));
    float lengthPx = 62.0 + 18.0 * sin(float(index) * 3.1);
    float sway = sin(u_time * 0.55 + float(index) * 1.7) * 0.12;
    vec2 b = a + vec2(cos(direction + sway), sin(direction + sway)) * lengthPx;
    float blade = smoothstep(3.1, 0.2, segmentDistance(p, a, b));
    color = mix(color, vec3(0.025, 0.12, 0.075), blade * 0.82);
  }
  return color;
}

float fishBodyHalfWidth(float u) {
  float head = sqrt(max(0.0, 1.0 - pow(max(0.30 - u, 0.0) / 0.30, 2.0)));
  float taper = clamp((u - 0.30) / 0.70, 0.0, 1.0);
  return (0.05 + 0.085 * (1.0 - pow(taper, 1.4))) * head * step(0.0, u);
}

struct KoiScale {
  float radius;
  float exposed;
  float randomA;
  float randomB;
  vec2 center;
};

KoiScale koiScaleAt(vec2 q) {
  const float scaleDensity = 26.0;
  const vec2 spacing = vec2(0.78, 0.90);
  vec2 point = q * scaleDensity;
  vec2 base = floor(point / spacing);
  KoiScale result = KoiScale(1.0, 0.0, 0.0, 0.0, q);
  float nearestHead = 1e6;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 id = base + vec2(float(x), float(y));
      vec2 jitter = (hash22(id * 3.1 + 1.7) - 0.5) * vec2(0.14, 0.10);
      vec2 center = vec2(
        (id.x + mod(id.y, 2.0) * 0.5 + 0.5) * spacing.x,
        (id.y + 0.5) * spacing.y
      ) + jitter;
      vec2 delta = point - center;
      float radius = length(delta) / (0.62 * (0.94 + 0.12 * hash12(id + 9.1)));
      if (radius < 1.0 && center.x < nearestHead) {
        nearestHead = center.x;
        result = KoiScale(
          radius,
          delta.x / 0.6,
          hash12(id + 0.37),
          hash12(id * 1.91 + 5.3),
          center / scaleDensity
        );
      }
    }
  }
  return result;
}

float koiMarkings(vec2 p, float seed) {
  return valueNoise(p * vec2(6.0, 14.0) + seed * 37.0) * 0.65
    + valueNoise(p * vec2(13.0, 30.0) + seed * 11.0 + 4.1) * 0.35;
}

struct KoiSkin {
  vec3 color;
  vec3 sheen;
  float metal;
  vec3 finBase;
  vec3 finTip;
};

KoiSkin koiSkin(float kind, vec2 q, float roundness, float seed, KoiScale scaleInfo, float lengthPx) {
  float u = q.x;
  float backLight = smoothstep(0.0, 0.86, roundness);
  float scaleRegion = smoothstep(0.23, 0.30, u) * (1.0 - smoothstep(0.91, 1.0, u));
  float field = mix(koiMarkings(q, seed), koiMarkings(scaleInfo.center, seed), scaleRegion * 0.24);
  float head = 1.0 - smoothstep(0.10, 0.30, u);
  float visibleScale = scaleRegion * (0.45 + 0.55 * smoothstep(
    0.25,
    0.70,
    valueNoise(q * vec2(7.0, 18.0) + seed * 13.0)
  ));
  float aa = 26.0 / max(lengthPx, 1.0);
  float rim = smoothstep(0.40 - aa, 0.86 + aa, scaleInfo.radius)
    * smoothstep(-0.40, 0.30, scaleInfo.exposed) * visibleScale;
  float edge = smoothstep(0.80 - aa, 1.0 + aa, scaleInfo.radius)
    * smoothstep(-0.25, 0.35, scaleInfo.exposed) * visibleScale;
  float grain = valueNoise(q * vec2(60.0, 110.0) + seed * 5.0);

  KoiSkin skin;
  if (kind < 0.5) {
    vec3 vermilion = mix(vec3(0.62, 0.16, 0.035), vec3(0.96, 0.43, 0.10), backLight);
    vec3 cream = mix(vec3(0.74, 0.58, 0.46), vec3(0.95, 0.88, 0.74), backLight);
    float creamMask = smoothstep(0.67, 0.79, field + head * 0.06);
    vec3 color = mix(vermilion, cream, creamMask);
    color = mix(color, color * vec3(1.10, 1.06, 1.0), rim * 0.28);
    color *= (0.88 + grain * 0.16) * (1.0 - edge * 0.08);
    skin = KoiSkin(color, vec3(1.0, 0.72, 0.38), 0.8, vec3(0.90, 0.44, 0.22), vec3(0.98, 0.84, 0.70));
  } else if (kind < 1.5) {
    vec3 gold = mix(vec3(0.34, 0.13, 0.018), vec3(0.96, 0.58, 0.11), backLight);
    gold = mix(gold, vec3(1.0, 0.70, 0.24), head * backLight * 0.35);
    float blackField = koiMarkings(q + 5.7, seed) * 0.66 + koiMarkings(scaleInfo.center + 5.7, seed) * 0.34;
    float blackMask = smoothstep(0.53, 0.60, blackField - head * 0.11);
    vec3 color = mix(gold, vec3(0.025, 0.03, 0.025), blackMask);
    color = mix(color, color * vec3(1.18, 1.12, 1.04), rim * 0.42);
    color *= (0.92 + grain * 0.12) * (1.0 - edge * 0.12);
    skin = KoiSkin(
      color,
      mix(vec3(1.0, 0.86, 0.55), vec3(0.28, 0.31, 0.34), blackMask),
      2.1,
      vec3(0.92, 0.58, 0.18),
      vec3(1.0, 0.88, 0.66)
    );
  } else if (kind < 2.5) {
    vec3 orange = mix(vec3(0.64, 0.12, 0.035), vec3(0.95, 0.31, 0.075), backLight);
    vec3 ivory = mix(vec3(0.74, 0.68, 0.61), vec3(0.97, 0.94, 0.86), backLight);
    float orangeMask = smoothstep(0.50, 0.61, field + 0.08 * sin(u * 18.0 + seed));
    vec3 color = mix(ivory, orange, orangeMask);
    color = mix(color, color * 1.10, rim * 0.32);
    color *= (0.91 + grain * 0.14) * (1.0 - edge * 0.08);
    skin = KoiSkin(color, vec3(1.0, 0.78, 0.48), 0.7, vec3(0.92, 0.66, 0.57), vec3(1.0, 0.92, 0.84));
  } else {
    vec3 blue = mix(vec3(0.40, 0.48, 0.58), vec3(0.75, 0.81, 0.88), backLight);
    vec3 ivory = mix(vec3(0.72, 0.69, 0.66), vec3(0.96, 0.95, 0.91), backLight);
    vec3 orange = mix(vec3(0.70, 0.20, 0.05), vec3(0.97, 0.46, 0.13), backLight);
    float whiteMask = smoothstep(0.45, 0.60, koiMarkings(q + 7.3, seed));
    float orangeMask = smoothstep(0.53, 0.65, field);
    vec3 color = mix(mix(blue, ivory, whiteMask), orange, orangeMask);
    float speckles = smoothstep(0.78, 0.87, valueNoise(q * vec2(40.0, 90.0) + seed * 31.0));
    color = mix(color, vec3(0.07, 0.08, 0.10), speckles * (1.0 - orangeMask) * 0.70);
    color = mix(color, color * 1.10, rim * 0.28);
    color *= (0.92 + grain * 0.13) * (1.0 - edge * 0.10);
    skin = KoiSkin(color, vec3(0.86, 0.92, 1.0), 0.5, vec3(0.73, 0.76, 0.84), vec3(0.96, 0.94, 0.91));
  }
  return skin;
}

struct KoiFin {
  float web;
  float ray;
  float progress;
  float across;
};

float finRayLength(float across, vec3 shape, float id) {
  float edge = abs(2.0 * across - 1.0);
  float lengthValue = mix(shape.x, shape.y, across) - shape.z * (1.0 - pow(edge, 0.9));
  return lengthValue * (1.0 - 0.20 * pow(edge, 12.0)) * (0.92 + 0.12 * hash12(vec2(id, id * 0.37)));
}

KoiFin rayedKoiFin(
  vec2 q,
  vec2 base,
  float direction,
  float spread,
  float lengthValue,
  float rayCount,
  vec3 shape,
  float bend,
  float fishLength,
  float id
) {
  KoiFin fin = KoiFin(0.0, 0.0, 0.0, 0.0);
  vec2 delta = q - base;
  float radius = length(delta);
  float normalizedRadius = radius / lengthValue;
  if (normalizedRadius > 1.2 || radius < 0.00001) return fin;
  float angle = atan(delta.y, delta.x) - direction;
  angle = atan(sin(angle), cos(angle)) + bend * normalizedRadius * normalizedRadius;
  float across = angle / spread + 0.5;
  if (across < -0.06 || across > 1.06) return fin;
  float rayPosition = clamp(across, 0.0, 1.0) * (rayCount - 1.0);
  float ray0 = floor(rayPosition);
  float ray1 = min(ray0 + 1.0, rayCount - 1.0);
  float blendValue = rayPosition - ray0;
  float length0 = finRayLength(ray0 / (rayCount - 1.0), shape, id + ray0);
  float length1 = finRayLength(ray1 / (rayCount - 1.0), shape, id + ray1);
  float nearestRay = blendValue < 0.5 ? ray0 : ray1;
  float nearestLength = blendValue < 0.5 ? length0 : length1;
  float soft = 2.5 / max(lengthValue * fishLength, 1.0);
  float sideMask = smoothstep(-0.06, 0.0, across) * (1.0 - smoothstep(1.0, 1.06, across));
  float webLength = mix(length0, length1, blendValue) * (1.0 - 0.03 * sin(3.14159 * blendValue));
  fin.web = (1.0 - smoothstep(webLength - soft * 2.0, webLength + soft, normalizedRadius)) * sideMask;
  float raySpacingPx = max(radius * fishLength * spread / (rayCount - 1.0), 0.001);
  float distanceToRayPx = abs(rayPosition - nearestRay) * raySpacingPx;
  float rayWidthPx = mix(1.8, 0.9, clamp(normalizedRadius / nearestLength, 0.0, 1.0));
  float onRay = 1.0 - smoothstep(rayWidthPx * 0.5 - 0.5, rayWidthPx * 0.5 + 1.0, distanceToRayPx);
  fin.ray = onRay * (1.0 - smoothstep(nearestLength - soft, nearestLength + soft * 0.5, normalizedRadius)) * sideMask;
  fin.progress = normalizedRadius;
  fin.across = across;
  return fin;
}

KoiFin pairedKoiFin(vec2 q, int index, float fear, float phase, float fishLength, float seed) {
  float side = index % 2 == 0 ? 1.0 : -1.0;
  bool pectoral = index < 2;
  float flap = sin(phase + (pectoral ? 0.0 : 1.3) + side * 0.4);
  float u = pectoral ? 0.22 : 0.53;
  vec2 base = vec2(u, side * fishBodyHalfWidth(u) * (pectoral ? 0.78 : 0.55));
  float fold = smoothstep(0.05, 0.8, fear);
  float direction = side * (pectoral ? 0.98 + 0.14 * flap : 0.55 + 0.06 * flap)
    * (1.0 - (pectoral ? 0.55 : 0.40) * fold);
  float spread = (pectoral ? 0.84 + 0.10 * flap : 0.46) * (1.0 - 0.45 * fold);
  vec3 shape = side > 0.0 ? vec3(0.70, 1.0, 0.0) : vec3(1.0, 0.70, 0.0);
  return rayedKoiFin(
    q,
    base,
    direction,
    spread,
    pectoral ? 0.25 : 0.16,
    pectoral ? 13.0 : 9.0,
    shape,
    side * 0.30,
    fishLength,
    seed * 50.0 + float(index) * 7.0
  );
}

KoiFin koiTailFin(vec2 q, float beat, float seed, float fishLength) {
  vec2 base = vec2(0.955, 0.0);
  float normalizedRadius = length(q - base) / 0.50;
  float flutter = sin(beat * 1.6 - normalizedRadius * 4.0 + seed * 9.0) * 0.12 * normalizedRadius;
  return rayedKoiFin(q, base, flutter, 1.20, 0.50, 28.0, vec3(1.0, 1.0, 0.40), 0.0, fishLength, seed * 90.0);
}

KoiFin koiDorsalFin(vec2 q, float seed, float fishLength) {
  float lean = sin(u_time * 0.45 + seed * 12.0) * 0.80 + sin(u_time * 1.3 + seed * 3.0) * 0.20;
  float side = lean >= 0.0 ? 1.0 : -1.0;
  float front = 0.10 + 0.40 * abs(lean);
  vec3 shape = side > 0.0 ? vec3(1.0, 0.55, 0.0) : vec3(0.55, 1.0, 0.0);
  return rayedKoiFin(q, vec2(0.33, 0.0), side * (0.04 + front) * 0.5, max(front - 0.04, 0.02), 0.44, 14.0, shape, side * 0.25, fishLength, seed * 70.0);
}

vec4 shadeKoiFin(KoiSkin skin, KoiFin fin, float seed, vec3 sunColor, float opacity) {
  if (fin.web + fin.ray <= 0.0) return vec4(0.0);
  float veil = 0.88 + 0.12 * valueNoise(vec2(fin.progress * 9.0, fin.across * 14.0) + seed * 17.0);
  float alpha = fin.web * mix(0.44, 0.07, smoothstep(0.0, 1.0, fin.progress)) * veil;
  alpha += fin.ray * fin.web * 0.08 * (1.0 - fin.progress * 0.6);
  alpha = clamp(alpha, 0.0, 1.0) * opacity;
  vec3 color = mix(skin.finBase, skin.finTip, smoothstep(0.05, 1.0, fin.progress));
  color *= 0.86 + sunColor * 0.34;
  color *= 1.0 - fin.ray * 0.08;
  return vec4(color * alpha, alpha);
}

vec4 alphaOver(vec4 top, vec4 bottom) {
  return top + bottom * (1.0 - top.a);
}

vec4 fishColor(vec2 p, vec4 fishA, vec4 fishB, float waterLight) {
  vec2 center = fishA.xy * u_resolution;
  float angle = fishA.z;
  float lengthPx = fishA.w;
  vec2 direction = vec2(cos(angle), sin(angle));
  vec2 lateral = vec2(-direction.y, direction.x);
  vec2 delta = p - center;
  vec2 local = vec2(dot(delta, direction), dot(delta, lateral)) / lengthPx;
  float phase = fishB.x;
  float kind = fishB.y;
  float fear = fishB.z;
  float seed = fishB.w;

  float u = 0.50 - local.x;
  float tailAmount = smoothstep(0.34, 1.48, u);
  float beatPhase = u_time * (3.1 + fear * 4.2) + phase;
  float bend = sin(beatPhase - u * 4.8 + seed * 5.0) * 0.055 * tailAmount * tailAmount;
  float s = local.y - bend;
  vec2 q = vec2(u, s);
  float beat = beatPhase + bend * 8.0;

  // Keep the expensive scale and fin shading inside a tight fish-space box.
  if (u < -0.06 || u > 1.56 || abs(s) > 0.58) return vec4(0.0);

  float halfWidth = fishBodyHalfWidth(u);
  float sideNormal = clamp(s / max(halfWidth, 0.0001), -1.0, 1.0);
  float roundness = sqrt(max(0.0, 1.0 - sideNormal * sideNormal));
  KoiScale scaleInfo = koiScaleAt(q);
  KoiSkin skin = koiSkin(kind, q, roundness, seed, scaleInfo, lengthPx);
  vec3 sunColor = vec3(1.0, 0.91, 0.70) * mix(0.48, 1.12, clamp(waterLight, 0.0, 1.0));

  vec4 accumulated = shadeKoiFin(skin, koiTailFin(q, beat, seed, lengthPx), seed, sunColor, 1.0);
  accumulated = alphaOver(shadeKoiFin(skin, koiDorsalFin(q, seed, lengthPx), seed + 4.0, sunColor, 0.66), accumulated);
  for (int finIndex = 3; finIndex >= 0; finIndex--) {
    accumulated = alphaOver(
      shadeKoiFin(skin, pairedKoiFin(q, finIndex, fear, beat, lengthPx, seed), seed + float(finIndex), sunColor, 1.0),
      accumulated
    );
  }

  float aa = max(1.25 / lengthPx, fwidth(s));
  float eyeSide = s >= 0.0 ? 1.0 : -1.0;
  vec2 eyeCenter = vec2(0.115, eyeSide * (fishBodyHalfWidth(0.115) + 0.002));
  float eyeBulgeDistance = length(q - eyeCenter) - 0.020;
  float bodyDistance = min(max(abs(s) - halfWidth, -u), eyeBulgeDistance);
  float bodyAlpha = (1.0 - smoothstep(-aa, aa, bodyDistance)) * (1.0 - smoothstep(0.96, 1.03, u));

  if (bodyAlpha > 0.0) {
    float snout = 1.0 - smoothstep(0.0, 0.14, u);
    float tailward = smoothstep(0.50, 1.0, u);
    vec3 normal = normalize(vec3(
      lateral * sideNormal * 0.95 + direction * (snout * 0.74 - tailward * 0.13) * roundness,
      roundness + 0.12
    ));
    vec3 lightDirection = normalize(vec3(-0.42, -0.52, 0.74));
    vec3 halfVector = normalize(lightDirection + vec3(0.0, 0.0, 1.0));
    float diffuse = max(dot(normal, lightDirection), 0.0);
    float broadSheen = pow(max(dot(normal, halfVector), 0.0), 7.0);
    float tightSpecular = pow(max(dot(normal, halfVector), 0.0), 36.0);

    vec3 ambient = vec3(0.48, 0.61, 0.52);
    vec3 bodyColor = skin.color * (ambient + sunColor * (0.25 + 0.68 * diffuse));
    bodyColor *= mix(0.66, 1.0, smoothstep(0.0, 0.56, roundness));
    bodyColor += skin.color * sunColor * 0.10 * pow(1.0 - roundness, 2.0);
    bodyColor += mix(skin.color, skin.sheen, 0.62) * sunColor * broadSheen * 0.15 * max(1.0, skin.metal * 0.65);
    bodyColor += skin.sheen * sunColor * tightSpecular * 0.19;

    float actualScaleRegion = smoothstep(0.22, 0.30, u) * (1.0 - smoothstep(0.90, 1.0, u))
      * smoothstep(0.0, 0.35, roundness);
    vec2 scaleTilt = (
      direction * -(0.35 + 0.35 * scaleInfo.randomB)
      + lateral * (scaleInfo.randomA - 0.5) * 0.90
    ) * 0.55;
    float glint = pow(max(dot(normalize(normal + vec3(scaleTilt, 0.0)), halfVector), 0.0), 24.0);
    float scaleRim = smoothstep(0.50, 0.86, scaleInfo.radius) * step(0.0, scaleInfo.exposed);
    bodyColor += skin.sheen * actualScaleRegion * glint * (0.45 + 0.80 * scaleRim) * sunColor * 0.52 * skin.metal;

    float gill = exp(-pow((u - 0.265 - 0.07 * sideNormal * sideNormal) / 0.008, 2.0))
      * smoothstep(0.15, 0.62, abs(sideNormal));
    bodyColor *= 1.0 - gill * 0.20;
    float eye = 1.0 - smoothstep(0.008, 0.014, length(q - eyeCenter));
    bodyColor = mix(bodyColor, vec3(0.004, 0.006, 0.005), eye);
    float eyeGlint = 1.0 - smoothstep(0.002, 0.005, length(q - eyeCenter - vec2(-0.003, eyeSide * 0.003)));
    bodyColor = mix(bodyColor, vec3(0.88), eyeGlint * eye);

    accumulated = alphaOver(vec4(bodyColor * bodyAlpha, bodyAlpha), accumulated);
  }

  return accumulated;
}

void main() {
  vec2 stateUv = v_uv;
  vec4 water = texture(u_state, stateUv);
  float left = texture(u_state, stateUv - vec2(u_stateTexel.x, 0.0)).r;
  float right = texture(u_state, stateUv + vec2(u_stateTexel.x, 0.0)).r;
  float down = texture(u_state, stateUv - vec2(0.0, u_stateTexel.y)).r;
  float up = texture(u_state, stateUv + vec2(0.0, u_stateTexel.y)).r;
  vec2 slope = vec2(right - left, up - down);

  vec2 uv = v_uv + slope * 0.045;
  vec2 p = uv * u_resolution;
  float broad = fbm(uv * vec2(5.2, 4.0) + vec2(u_time * 0.012, -u_time * 0.009));
  float fine = fbm(uv * vec2(29.0, 21.0));
  vec3 color = mix(vec3(0.035, 0.18, 0.12), vec3(0.15, 0.32, 0.22), broad);
  color *= 0.77 + fine * 0.24;

  vec2 causticUv = uv * vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 causticGrid = causticUv * 5.4;
  vec2 causticWarp = vec2(
    valueNoise(causticGrid * 0.34 + u_time * 0.025),
    valueNoise(causticGrid * 0.34 + vec2(11.7, 4.3) - u_time * 0.02)
  );
  causticGrid += (causticWarp - 0.5) * 2.65;
  float causticA = voronoiRidge(causticGrid + slope * 5.0, u_time);
  float causticB = organicCaustic(causticUv * 9.2 - slope * 3.0 + 8.4, -u_time * 0.66);
  float caustic = pow(max(causticA, causticB * 0.28), 1.10);
  color += vec3(0.94, 1.02, 0.78) * caustic * 0.66;
  float waveLight = clamp(dot(slope, normalize(vec2(0.7, 0.55))) * 14.0, -0.18, 0.30);
  color += vec3(0.34, 0.47, 0.28) * waveLight;
  color += vec3(0.18, 0.31, 0.22) * abs(water.r) * 0.38;

  color = rockLayer(color, p);
  color = reedLayer(color, p);

  for (int index = 0; index < MAX_FISH; index++) {
    if (index >= u_fishCount) break;
    vec4 fishA = u_fishA[index];
    vec2 center = fishA.xy * u_resolution;
    vec2 direction = vec2(cos(fishA.z), sin(fishA.z));
    vec2 delta = p - center - vec2(8.0, -11.0);
    vec2 local = vec2(dot(delta, direction), dot(delta, vec2(-direction.y, direction.x)));
    float shadow = exp(-pow(local.x / (fishA.w * 0.62), 2.0) - pow(local.y / (fishA.w * 0.25), 2.0));
    color *= 1.0 - shadow * 0.34;
  }

  for (int index = 0; index < MAX_FISH; index++) {
    if (index >= u_fishCount) break;
    vec4 koi = fishColor(p, u_fishA[index], u_fishB[index], caustic);
    color = koi.rgb + color * (1.0 - koi.a);
    color += caustic * koi.a * vec3(0.13, 0.15, 0.08);
  }

  float vignette = smoothstep(0.92, 0.18, length((v_uv - 0.5) * vec2(1.08, 0.92)));
  color *= 0.76 + vignette * 0.30;
  float grain = hash12(gl_FragCoord.xy + floor(u_time * 18.0) * 19.1) - 0.5;
  color += grain * 0.060;
  color = pow(max(color, 0.0), vec3(0.92));
  outColor = vec4(color, 1.0);
}
`;
