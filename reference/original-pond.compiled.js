/**
 * Read-only reverse-engineering reference extracted from the public client bundle.
 * Source: https://www.shwn.design/_next/static/chunks/0bzbe50pjv2-3.js
 * Retrieved: 2026-09-22T01:13:06.173Z
 * SHA-256 of full chunk: 09dacaeb751fce6b723d0b4b2b7a01052c47c68aeb960ca8d9a66279d235fce1
 *
 * This file retains the original bundler wrapper and minified identifiers so the
 * port can be checked against exact shipped behavior. It is not imported by the
 * npm package or demo.
 */
const originalPondModule = (e) => {
  "use strict";
  var t = e.i(43476),
    a = e.i(32181),
    i = e.i(71645),
    n = e.i(47163);
  let s = 2 * Math.PI,
    o = [
      {
        kind: 0,
        x: 0.26,
        y: 0.32,
        heading: 0.35,
        size: 0.23,
        lift: 1,
        seed: 0.13,
      },
      {
        kind: 1,
        x: 0.74,
        y: 0.3,
        heading: 2.7,
        size: 0.22,
        lift: 1.1,
        seed: 0.91,
      },
      {
        kind: 2,
        x: 0.56,
        y: 0.76,
        heading: -0.5,
        size: 0.22,
        lift: 0.95,
        seed: 0.34,
      },
      {
        kind: 3,
        x: 0.14,
        y: 0.74,
        heading: -0.9,
        size: 0.21,
        lift: 1.05,
        seed: 0.72,
      },
    ],
    r = (e, t, a) => Math.min(a, Math.max(t, e)),
    l = (e, t, a) => {
      let i = r((a - e) / (t - e), 0, 1);
      return i * i * (3 - 2 * i);
    },
    c = (e) => Math.atan2(Math.sin(e), Math.cos(e)),
    u = (e) => -0.03 + (1.55 * e) / 63,
    f = (e) => Math.round(((e - -0.03) / 1.55) * 63),
    d = [
      {
        x: 0.77,
        y: 0.3,
        length: 42,
        width: 31,
        height: 18,
        angle: 0.35,
        seed: 0.21,
        kind: 0,
      },
      {
        x: 0.85,
        y: 0.5,
        length: 20,
        width: 15,
        height: 9,
        angle: -0.7,
        seed: 0.64,
        kind: 2,
      },
      {
        x: 0.36,
        y: 0.66,
        length: 30,
        width: 22,
        height: 13,
        angle: -0.25,
        seed: 0.47,
        kind: 1,
      },
    ],
    h = [
      {
        x: 0.05,
        y: 0.84,
        angle: -0.55,
        spread: 1.3,
        count: 9,
        root: 20,
        length: [60, 150],
        width: [4, 8],
      },
      {
        x: 0.9,
        y: 0.92,
        angle: -2.35,
        spread: 1.3,
        count: 7,
        root: 20,
        length: [60, 150],
        width: [4, 8],
      },
      {
        x: 0.33,
        y: 0.03,
        angle: 1.25,
        spread: 1.3,
        count: 6,
        root: 20,
        length: [60, 150],
        width: [4, 8],
      },
    ],
    p = 1 + Math.floor(0x7ffffffd * Math.random()),
    m = `#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
`,
    v = `#version 300 es
out vec2 v_uv;
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  v_uv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,
    x = `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec2 hash22(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xx + p3.yz) * p3.zy);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1, 0)), w.x),
             mix(hash12(i + vec2(0, 1)), hash12(i + vec2(1, 1)), w.x), w.y);
}
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
// Simplex noise (Ashima Arts / Stefan Gustavson, MIT) with its analytic gradient.
float snoiseGrad(vec3 v, out vec3 grad) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  vec4 m2 = m * m;
  vec4 m4 = m2 * m2;
  vec4 pdotx = vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3));
  vec4 temp = m2 * m * pdotx;
  grad = -8.0 * (temp.x * x0 + temp.y * x1 + temp.z * x2 + temp.w * x3);
  grad += m4.x * p0 + m4.y * p1 + m4.z * p2 + m4.w * p3;
  grad *= 105.0;
  return 105.0 * dot(m4, pdotx);
}
float snoise(vec3 v) { vec3 g; return snoiseGrad(v, g); }
`,
    g = `${m}
in vec2 v_uv;
uniform sampler2D u_state;
uniform vec2 u_size;
uniform float u_dt;
uniform float u_stiffness;
uniform vec2 u_damping;
uniform float u_smoothing;
uniform int u_dropCount;
uniform vec4 u_drops[32];
uniform int u_splashCount;
uniform vec4 u_splashes[32];
uniform int u_pushCount;
uniform vec4 u_pushes[16];
out vec4 o;
vec4 at(ivec2 c, ivec2 mx) { return texelFetch(u_state, clamp(c, ivec2(0), mx), 0); }
void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  ivec2 mx = textureSize(u_state, 0) - 1;
  vec4 st = texelFetch(u_state, c, 0);
  vec4 sum4 = at(c + ivec2(0, 1), mx) + at(c - ivec2(0, 1), mx) + at(c + ivec2(1, 0), mx) + at(c - ivec2(1, 0), mx);
  vec4 sumD = at(c + ivec2(1, 1), mx) + at(c + ivec2(-1, 1), mx) + at(c + ivec2(1, -1), mx) + at(c + ivec2(-1, -1), mx);
  vec2 lap = (4.0 * sum4.rb + sumD.rb - 20.0 * st.rb) / 6.0;
  vec2 p = vec2(v_uv.x, 1.0 - v_uv.y) * u_size;
  vec2 vel = (st.ga + u_stiffness * u_dt * lap) * u_damping;
  // pushes accelerate the big field, like a body shoving water, so moving fish leave a proper wake
  for (int i = 0; i < u_pushCount; i++) {
    float r = length(p - u_pushes[i].xy) / u_pushes[i].z;
    if (r < 1.0) vel.y += u_pushes[i].w * u_dt * (0.5 + 0.5 * cos(3.14159265 * r));
  }
  // a touch of diffusion wipes out grid-sized noise while barely touching real ripples
  vec2 h = st.rb + u_dt * vel + u_smoothing * lap;
  float edge = min(min(p.x, u_size.x - p.x), min(p.y, u_size.y - p.y));
  float absorb = mix(0.94, 1.0, smoothstep(0.0, 36.0, edge));
  h *= absorb;
  vel *= absorb;
  for (int i = 0; i < u_dropCount; i++) {
    float r = length(p - u_drops[i].xy) / u_drops[i].z;
    if (r < 1.0) h.x += u_drops[i].w * (0.5 + 0.5 * cos(3.14159265 * r));
  }
  for (int i = 0; i < u_splashCount; i++) {
    float r = length(p - u_splashes[i].xy) / u_splashes[i].z;
    if (r < 1.0) h.y += u_splashes[i].w * (0.5 + 0.5 * cos(3.14159265 * r));
  }
  o = vec4(clamp(h.x, -4.0, 4.0), vel.x, clamp(h.y, -6.0, 6.0), vel.y);
}`,
    y = `${m}${x}
in vec2 v_uv;
uniform sampler2D u_state;
uniform vec2 u_size;
uniform float u_time;
uniform float u_scale;
// x = height and curvature scale, y = how much the ripples bend the caustic grid
uniform vec2 u_fine;
uniform vec2 u_big;
out vec4 o;
void main() {
  ivec2 c = ivec2(gl_FragCoord.xy);
  ivec2 ts = textureSize(u_state, 0);
  ivec2 mx = ts - 1;
  vec2 texel = u_size / vec2(ts);
  vec4 h = texelFetch(u_state, c, 0);
  vec4 hr = texelFetch(u_state, clamp(c + ivec2(1, 0), ivec2(0), mx), 0);
  vec4 hl = texelFetch(u_state, clamp(c - ivec2(1, 0), ivec2(0), mx), 0);
  vec4 hu = texelFetch(u_state, clamp(c + ivec2(0, 1), ivec2(0), mx), 0);
  vec4 hd = texelFetch(u_state, clamp(c - ivec2(0, 1), ivec2(0), mx), 0);
  vec2 fineSlope = vec2((hr.r - hl.r) / (2.0 * texel.x), (hd.r - hu.r) / (2.0 * texel.y));
  vec2 bigSlope = vec2((hr.b - hl.b) / (2.0 * texel.x), (hd.b - hu.b) / (2.0 * texel.y));
  vec2 bigBend = bigSlope / (1.0 + length(bigSlope) * 1.5);
  vec4 lap = (hr + hl + hu + hd - 4.0 * h) / (texel.x * texel.y);

  vec2 p = vec2(v_uv.x, 1.0 - v_uv.y) * u_size;
  const float angle = 0.7;
  const float aniso = 1.06;
  float ca = cos(angle), sa = sin(angle);
  mat2 M = mat2(ca * u_scale * aniso, -sa * u_scale / aniso, sa * u_scale * aniso, ca * u_scale / aniso);
  vec2 q = M * p;
  float t = u_time;
  vec3 g;
  float swell = snoiseGrad(vec3(q + vec2(t * 0.05, t * 0.032), t * 0.3), g);
  vec2 slope = g.xy;
  swell += 0.42 * snoiseGrad(vec3(q * 1.97 + vec2(-t * 0.045, t * 0.07) + 11.3, t * 0.42), g);
  slope += 0.42 * 1.97 * g.xy;
  swell += 0.15 * snoiseGrad(vec3(q * 4.1 + vec2(t * 0.09, -t * 0.06) - 7.1, t * 0.6), g);
  slope += 0.15 * 4.1 * g.xy;
  slope = transpose(M) * slope;
  o = vec4(swell + h.r * u_fine.x + h.b * u_big.x, slope + fineSlope * u_fine.x * u_fine.y + bigBend * u_big.x * u_big.y, lap.r * u_fine.x + lap.b * u_big.x);
}`,
    b = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 a_pos;
uniform sampler2D u_surface;
uniform vec2 u_size;
uniform float u_depth;
out vec2 v_old;
out vec2 v_new;
void main() {
  vec4 s = texture(u_surface, vec2(a_pos.x / u_size.x, 1.0 - a_pos.y / u_size.y));
  vec2 np = a_pos + u_depth * s.yz;
  v_old = a_pos;
  v_new = np;
  gl_Position = vec4(np.x / u_size.x * 2.0 - 1.0, 1.0 - np.y / u_size.y * 2.0, 0.0, 1.0);
}`,
    w = `${m}
in vec2 v_old;
in vec2 v_new;
out vec4 o;
void main() {
  vec2 ox = dFdx(v_old), oy = dFdy(v_old);
  vec2 nx = dFdx(v_new), ny = dFdy(v_new);
  float oldArea = abs(ox.x * oy.y - ox.y * oy.x);
  float newArea = abs(nx.x * ny.y - nx.y * ny.x);
  float I = min(oldArea / max(newArea, 1e-6), 30.0);
  o = vec4(I, I, I, 1.0);
}`,
    _ = `${m}
in vec2 v_uv;
uniform sampler2D u_tex;
uniform vec2 u_dir;
out vec4 o;
void main() {
  vec4 s = texture(u_tex, v_uv) * 0.2270270270;
  s += texture(u_tex, v_uv + u_dir * 1.3846153846) * 0.3162162162;
  s += texture(u_tex, v_uv - u_dir * 1.3846153846) * 0.3162162162;
  s += texture(u_tex, v_uv + u_dir * 3.2307692308) * 0.0702702703;
  s += texture(u_tex, v_uv - u_dir * 3.2307692308) * 0.0702702703;
  o = s;
}`,
    k = `${m}${x}
in vec2 v_uv;
uniform vec2 u_size;
uniform float u_unit;
/** pond px per texel, for anti-aliasing */
uniform float u_pixel;
/** centre x, y in pond px, long axis angle, seed */
uniform vec4 u_stones[${d.length}];
/** half length, half width, height in pond px, kind */
uniform vec4 u_stoneSize[${d.length}];
/** 0 writes albedo plus how much sunlight reaches the bed (x1.5), 1 writes the bed height */
uniform int u_pass;
uniform float u_heightScale;
out vec4 o;

const int STONE_COUNT = ${d.length};
// Sunlight comes from the upper left, the way the fish shadows fall, drifting 0.8px sideways for every px it drops.
const vec2 SUN_DIR = vec2(-0.7914, -0.6115);
const float SUN_SLANT = 0.8;
const vec3 SUN = vec3(-0.4943, -0.3819, 0.7809);

vec3 voronoi(vec2 x) {
  vec2 n = floor(x), f = fract(x);
  float f1 = 8.0, f2 = 8.0;
  vec2 id = vec2(0.0);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 g = vec2(float(i), float(j));
    vec2 r = g + hash22(n + g) - f;
    float d = dot(r, r);
    if (d < f1) { f2 = f1; f1 = d; id = n + g; }
    else if (d < f2) { f2 = d; }
  }
  return vec3(sqrt(f1), sqrt(f2), hash12(id * 7.13));
}

vec2 stoneLocal(vec2 p, int i) {
  vec2 d = p - u_stones[i].xy;
  float a = u_stones[i].z;
  return vec2(cos(a) * d.x + sin(a) * d.y, -sin(a) * d.x + cos(a) * d.y) / u_stoneSize[i].xy;
}

float stoneReach(int i) { return max(u_stoneSize[i].x, u_stoneSize[i].y) * 1.3; }

// 0 in the middle of a stone, 1 on its outline, which wanders irregularly the way worn river stones do
float stoneRadius(vec2 q, float seed) {
  float t = atan(q.y, q.x + 1e-6);
  float wander = 1.0
    + 0.05 * cos(t + seed * 41.0)
    + 0.07 * cos(2.0 * t + seed * 73.0)
    + 0.045 * cos(3.0 * t + seed * 29.0)
    + 0.025 * cos(4.0 * t + seed * 97.0)
    + 0.012 * cos(6.0 * t + seed * 53.0);
  return length(q) / wander;
}

// a worn dome with its crown pushed a little off centre; rho comes back 0 in the middle to 1 on the outline
float stoneDome(vec2 p, int i, out float rho) {
  vec2 q = stoneLocal(p, i);
  float seed = u_stones[i].w;
  rho = stoneRadius(q, seed);
  if (rho >= 1.0) return 0.0;
  vec2 tilt = vec2(cos(seed * 61.0), sin(seed * 61.0)) * 0.2;
  return u_stoneSize[i].z * pow(1.0 - rho * rho, 0.7) * (1.0 + dot(q, tilt));
}

float bedHeight(vec2 p, int skip) {
  float h = 0.0;
  float rho;
  for (int i = 0; i < STONE_COUNT; i++) {
    if (i == skip || distance(p, u_stones[i].xy) > stoneReach(i)) continue;
    h = max(h, stoneDome(p, i, rho));
  }
  return h;
}

// how much sunlight gets past the stones to a point at height h0; the waves scatter it, so shadows are soft
float sunlight(vec2 p, float h0, int skip) {
  float blocked = -1.0;
  for (int k = 1; k <= 20; k++) {
    float d = float(k) * 1.4 * u_unit;
    blocked = max(blocked, (bedHeight(p + SUN_DIR * d, skip) - h0 - d / SUN_SLANT) / d);
  }
  return 1.0 - smoothstep(-0.4, 0.4, blocked);
}

// sand darkens gently toward the foot of each stone
float crevice(vec2 p) {
  float ao = 1.0;
  float rho;
  for (int i = 0; i < STONE_COUNT; i++) {
    if (distance(p, u_stones[i].xy) > stoneReach(i) + 30.0 * u_unit) continue;
    stoneDome(p, i, rho);
    float gap = max(rho - 1.0, 0.0) * (u_stoneSize[i].x + u_stoneSize[i].y) * 0.5;
    ao *= 1.0 - 0.35 * exp(-gap / (0.5 * u_stoneSize[i].z + u_unit));
  }
  return ao;
}

// the stone's own surface, with broad lumps and shallow dents so light doesn't slide over it like plastic
float stoneSurface(vec2 p, int i) {
  vec2 sp = p / u_unit + u_stones[i].w * 97.0;
  float rho;
  return stoneDome(p, i, rho) * (1.0 + 0.08 * snoise(vec3(sp * 0.04, 1.7)) + 0.025 * snoise(vec3(sp * 0.13, 5.3)));
}

vec3 stoneColor(vec2 p, vec3 n, int i, vec3 sand) {
  float seed = u_stones[i].w;
  float kind = u_stoneSize[i].w;
  vec2 sp = p / u_unit + seed * 97.0;
  // natural pebble colours as seen through the green water
  vec3 c = kind < 0.5 ? vec3(0.42, 0.46, 0.44) : kind < 1.5 ? vec3(0.54, 0.52, 0.39) : vec3(0.26, 0.3, 0.29);
  // broad mottling, a little warmer or cooler in places
  float patches = snoise(vec3(sp * 0.035, seed * 5.0)) * 0.6 + snoise(vec3(sp * 0.08, seed * 9.0)) * 0.3 + snoise(vec3(sp * 0.2, seed * 3.0)) * 0.12;
  float tint = snoise(vec3(sp * 0.05, seed * 13.0));
  c *= (1.0 + 0.16 * patches) * vec3(1.0 + 0.05 * tint, 1.0, 1.0 - 0.05 * tint);
  if (kind > 0.5 && kind < 1.5) {
    // iron stains on the warm stone
    c = mix(c, vec3(0.4, 0.35, 0.24), smoothstep(0.2, 0.7, snoise(vec3(sp * 0.06, seed * 17.0))) * 0.35);
  } else {
    // faint pale veins through the grey and dark stones
    float vein = abs(snoise(vec3(sp * vec2(0.03, 0.012), seed * 31.0)));
    c = mix(c, vec3(0.58, 0.62, 0.58), (1.0 - smoothstep(0.02, 0.06, vein)) * 0.25);
  }
  // faint grain and the odd tiny pit
  c *= 0.96 + 0.08 * vnoise(p * 1.3);
  vec3 g = voronoi(p / 1.6 + seed * 131.0);
  c *= 1.0 - 0.2 * step(0.93, g.z) * smoothstep(0.35, 0.05, g.x);
  // a patchy film of algae and a dusting of silt where the tops face the light
  float film = smoothstep(0.0, 0.7, snoise(vec3(sp * 0.045, seed * 23.0))) * smoothstep(0.5, 0.9, n.z);
  c = mix(c, vec3(0.3, 0.36, 0.22), film * 0.2);
  float silt = smoothstep(0.85, 0.98, n.z) * smoothstep(0.35, 0.8, vnoise(sp * 0.09 + 3.0) * 0.7 + vnoise(p * 0.8) * 0.3);
  return mix(c, sand, silt * 0.25);
}

void main() {
  vec2 p = vec2(v_uv.x, 1.0 - v_uv.y) * u_size;

  // the stone lying on top here, if any
  int top = -1;
  float topRho = 2.0;
  float topH = 0.0;
  bool near = false;
  for (int i = 0; i < STONE_COUNT; i++) {
    float reach = distance(p, u_stones[i].xy);
    if (reach > stoneReach(i) + 32.0 * u_unit) continue;
    near = true;
    if (reach > stoneReach(i)) continue;
    float rho;
    float h = stoneDome(p, i, rho);
    if (rho < 1.05 && (top < 0 || h > topH)) { top = i; topRho = rho; topH = h; }
  }
  if (u_pass == 1) {
    o = vec4(topH / u_heightScale, 0.0, 0.0, 1.0);
    return;
  }

  float big = snoise(vec3(p * 0.0032, 1.3)) * 0.6 + snoise(vec3(p * 0.0075, 7.7)) * 0.3 + snoise(vec3(p * 0.02, 2.2)) * 0.15;
  float blot = snoise(vec3(p * 0.06, 4.4)) * 0.5 + snoise(vec3(p * 0.13, 8.1)) * 0.3;
  vec3 v = voronoi(p / 3.2);
  float pebble = mix(1.0, 0.9 + 0.2 * v.z, smoothstep(0.02, 0.25, v.y - v.x));
  float grain = vnoise(p * 2.3) * 0.6 + hash12(gl_FragCoord.xy) * 0.4;
  vec3 sand = vec3(0.47, 0.59, 0.53);
  vec3 silt = vec3(0.3, 0.42, 0.38);
  vec3 c = mix(silt, sand, smoothstep(-0.55, 0.55, big));
  c *= 0.93 + 0.1 * blot;
  c *= pebble;
  c *= 0.92 + 0.16 * grain;
  // individual sand grains with darker gaps and the odd bright one, kept subtle
  vec3 sandGrain = voronoi(p / 1.4 + 57.0);
  float grains = mix(0.82, 1.12, smoothstep(0.05, 0.95, sandGrain.z)) * mix(0.72, 1.0, smoothstep(0.0, 0.3, sandGrain.y - sandGrain.x));
  grains = mix(grains, 1.35, step(0.94, sandGrain.z) * 0.5);
  c *= mix(1.0, grains, 0.5);

  vec3 col = c;
  float sun = 1.0;
  if (near) {
    col *= crevice(p);
    sun = sunlight(p, 0.0, -1);
  }
  if (top >= 0) {
    float e = 0.5;
    vec2 g = vec2(
      stoneSurface(p + vec2(e, 0.0), top) - stoneSurface(p - vec2(e, 0.0), top),
      stoneSurface(p + vec2(0.0, e), top) - stoneSurface(p - vec2(0.0, e), top)
    ) / (2.0 * e);
    g /= max(1.0, length(g) / 3.0);
    vec3 n = normalize(vec3(-g, 1.0));
    // light scattered by the waves wraps a little way round, and other stones can still shade this one
    float lambert = mix(max(dot(n, SUN), 0.0) / SUN.z, n.z, 0.2);
    float stoneSun = lambert * sunlight(p, topH, top);
    float ao = mix(0.6, 1.0, smoothstep(1.0, 0.5, topRho));
    vec3 stone = stoneColor(p, n, top, c) * ao;
    // a slightly ragged foot, so it sits down in the sand
    float lip = (vnoise(p * 0.5 / u_unit + u_stones[top].w * 9.0) - 0.5) * 1.6 * u_unit;
    float edge = (topRho - 1.0) * (u_stoneSize[top].x + u_stoneSize[top].y) * 0.5 + lip;
    float cover = 1.0 - smoothstep(-0.75 * u_pixel, 0.75 * u_pixel, edge);
    col = mix(col, stone, cover);
    sun = mix(sun, stoneSun, cover);
  }
  o = vec4(col, clamp(sun / 1.5, 0.0, 1.0));
}`,
    j = `#version 300 es
precision highp float;
in vec2 a_pos;
in vec2 a_local;
in vec2 a_tan;
in vec4 a_fish;
in vec2 a_motion;
uniform vec2 u_size;
uniform vec2 u_offset;
out vec2 v_local;
out vec2 v_tan;
out vec4 v_fish;
out vec2 v_motion;
out vec2 v_p;
void main() {
  vec2 p = a_pos + u_offset * a_fish.w;
  v_local = a_local;
  v_tan = a_tan;
  v_fish = a_fish;
  v_motion = a_motion;
  v_p = p;
  gl_Position = vec4(p.x / u_size.x * 2.0 - 1.0, 1.0 - p.y / u_size.y * 2.0, 0.0, 1.0);
}`,
    z = `
uniform float u_time;
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

// Koi build: blunt rounded head, widest just behind the gills, a long gentle taper to the tail.
float bodyHW(float u) {
  float head = sqrt(max(0.0, 1.0 - pow(max(0.3 - u, 0.0) / 0.3, 2.0)));
  float t = clamp((u - 0.3) / 0.7, 0.0, 1.0);
  return (0.05 + 0.085 * (1.0 - pow(t, 1.4))) * head * step(0.0, u);
}

struct Fin {
  float web;     // translucent webbing between rays
  float ray;     // the bony strands
  float t;       // 0 at the base .. 1 at the longest tip
  float across;  // 0..1 across the fan
};

// Ray length across a fin: x = length at across 0, y = at across 1, z = how deep the fork dips in the middle.
float rayLength(float x, vec3 shape, float id) {
  float c = abs(2.0 * x - 1.0);
  float len = mix(shape.x, shape.y, x) - shape.z * (1.0 - pow(c, 0.9));
  return len * (1.0 - 0.2 * pow(c, 12.0)) * (0.92 + 0.12 * hash11(id));
}

// A fan of fin rays growing from one point. The webbing stops short of the ray tips and dips between
// them, so the edge frays into strands. bend sweeps the rays back as they grow.
Fin rayedFin(vec2 q, vec2 base, float dir, float spread, float len, float count, vec3 shape, float bend, float L, float id) {
  Fin f = Fin(0.0, 0.0, 0.0, 0.0);
  vec2 d = q - base;
  float r = length(d);
  float rn = r / len;
  if (rn > 1.2 || r < 1e-5) return f;
  float ang = atan(d.y, d.x) - dir;
  ang = atan(sin(ang), cos(ang)) + bend * rn * rn;
  float across = ang / spread + 0.5;
  if (across < -0.06 || across > 1.06) return f;
  float k = clamp(across, 0.0, 1.0) * (count - 1.0);
  float i0 = floor(k);
  float i1 = min(i0 + 1.0, count - 1.0);
  float fk = k - i0;
  float l0 = rayLength(i0 / (count - 1.0), shape, id + i0);
  float l1 = rayLength(i1 / (count - 1.0), shape, id + i1);
  float nearest = fk < 0.5 ? i0 : i1;
  float rayLen = fk < 0.5 ? l0 : l1;
  float soft = 2.5 / (len * L);
  float sides = smoothstep(-0.06, 0.0, across) * (1.0 - smoothstep(1.0, 1.06, across));

  float webLen = mix(l0, l1, fk) * (1.0 - 0.03 * sin(3.14159 * fk));
  f.web = (1.0 - smoothstep(webLen - soft * 2.0, webLen + soft, rn)) * sides;

  float gapPx = max(r * L * spread / (count - 1.0), 1e-3);
  float distPx = abs(k - nearest) * gapPx;
  float widthPx = mix(2.0, 1.1, clamp(rn / rayLen, 0.0, 1.0)) * clamp(L / 110.0, 0.8, 1.6);
  float onRay = 1.0 - smoothstep(widthPx * 0.5 - 0.6, widthPx * 0.5 + 1.2, distPx);
  f.ray = onRay * (1.0 - smoothstep(rayLen - soft, rayLen + soft * 0.5, rn)) * sides;
  f.t = rn;
  f.across = across;
  return f;
}

// i: 0/1 pectorals, 2/3 pelvics; even = the +s side. Pectorals fold back against the body when darting.
Fin pairedFin(vec2 q, int i, float fold, float phase, float L, float seed) {
  float sg = (i % 2 == 0) ? 1.0 : -1.0;
  bool pect = i < 2;
  float flap = sin(phase + (pect ? 0.0 : 1.3) + sg * 0.4);
  float au = pect ? 0.22 : 0.53;
  vec2 base = vec2(au, sg * bodyHW(au) * (pect ? 0.78 : 0.55));
  float dir = sg * (pect ? 0.98 + 0.14 * flap : 0.55 + 0.06 * flap) * (1.0 - (pect ? 0.55 : 0.4) * fold);
  float spread = (pect ? 0.84 + 0.1 * flap : 0.46) * (1.0 - 0.45 * fold);
  // broad koi paddles; the leading rays, nearest the head, are the longest
  vec3 shape = sg > 0.0 ? vec3(0.7, 1.0, 0.0) : vec3(1.0, 0.7, 0.0);
  return rayedFin(q, base, dir, spread, pect ? 0.25 : 0.16, pect ? 13.0 : 9.0, shape, sg * 0.3, L, seed * 50.0 + float(i) * 7.0);
}

// Forked tail, about half a body length; the rays ripple like cloth as it sweeps.
Fin tailFin(vec2 q, float beat, float seed, float L) {
  vec2 base = vec2(0.955, 0.0);
  float rn = length(q - base) / 0.5;
  float flutter = sin(beat * 1.6 - rn * 4.0 + seed * 9.0) * 0.12 * rn;
  return rayedFin(q, base, flutter, 1.2, 0.5, 28.0, vec3(1.0, 1.0, 0.4), 0.0, L, seed * 90.0);
}

// The dorsal fin lies mostly folded along the back, leaning a little to one side and slowly changing sides.
Fin dorsalFin(vec2 q, float seed, float L) {
  float lean = sin(u_time * 0.45 + seed * 12.0) * 0.8 + sin(u_time * 1.3 + seed * 3.0) * 0.2;
  float sg = lean >= 0.0 ? 1.0 : -1.0;
  float back = 0.04;
  float front = 0.1 + 0.4 * abs(lean);
  vec3 shape = sg > 0.0 ? vec3(1.0, 0.55, 0.0) : vec3(0.55, 1.0, 0.0);
  return rayedFin(q, vec2(0.33, 0.0), sg * (back + front) * 0.5, max(front - back, 0.02), 0.44, 14.0, shape, sg * 0.25, L, seed * 70.0);
}

vec4 over(vec4 top, vec4 bot) { return top + bot * (1.0 - top.a); }
`,
    M = `${m}${x}${z}
in vec2 v_local;
in vec2 v_tan;
in vec4 v_fish;
in vec2 v_motion;
in vec2 v_p;
uniform sampler2D u_caustic;
uniform vec2 u_size;
uniform vec3 u_ambient;
uniform vec3 u_sun;
uniform float u_fishLight;
uniform float u_pixel;
out vec4 o;
vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }

const float SCALES_PER_LENGTH = 26.0;

// One of the overlapping scales; the one nearest the head sits on top.
struct Scale {
  float r;      // 0 at the centre .. 1 at the edge
  float back;   // positive on the exposed side, facing the tail
  float rnd;
  float rnd2;
  vec2 center;  // in fish space, so markings can follow scale outlines
};

Scale scaleAt(vec2 q) {
  const vec2 cs = vec2(0.78, 0.9);
  vec2 pp = q * SCALES_PER_LENGTH;
  vec2 base = floor(pp / cs);
  Scale sc = Scale(1.0, 0.0, 0.0, 0.0, q);
  float bestX = 1e9;
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 id = base + vec2(float(i), float(j));
    vec2 jitter = (hash22(id * 3.1 + 1.7) - 0.5) * vec2(0.14, 0.1);
    vec2 c = vec2((id.x + mod(id.y, 2.0) * 0.5 + 0.5) * cs.x, (id.y + 0.5) * cs.y) + jitter;
    vec2 d = pp - c;
    float r = length(d) / (0.62 * (0.94 + 0.12 * hash12(id + 9.1)));
    if (r < 1.0 && c.x < bestX) {
      bestX = c.x;
      sc = Scale(r, d.x / 0.6, hash12(id + 0.37), hash12(id * 1.91 + 5.3), c / SCALES_PER_LENGTH);
    }
  }
  return sc;
}

// Varieties: 0 orange koi, 1 metallic gold with black spots, 2 orange and white, 3 light calico.
struct Skin {
  vec3 color;
  vec3 sheen;
  float metal;
  vec3 finBase;
  vec3 finTip;
};

float markings(vec2 p, float seed) {
  return vnoise(p * vec2(6.0, 14.0) + seed * 37.0) * 0.65 + vnoise(p * vec2(13.0, 30.0) + seed * 11.0 + 4.1) * 0.35;
}

Skin skin(int kind, vec2 q, float nz, float seed, Scale sc, float L) {
  float u = q.x;
  float back = smoothstep(0.0, 0.85, nz);
  float scaled = smoothstep(0.23, 0.3, u) * (1.0 - smoothstep(0.92, 1.0, u));
  // markings are organic, with just a hint of following the scale outlines on the body
  float field = mix(markings(q, seed), markings(sc.center, seed), scaled * 0.22);
  float head = 1.0 - smoothstep(0.1, 0.3, u);
  // reticulation: pigment in the middle, a pale rim on the exposed edge, a fine line where it tucks under
  float aa = SCALES_PER_LENGTH * u_pixel / (0.6 * L);
  float visible = scaled * (0.45 + 0.55 * smoothstep(0.25, 0.7, vnoise(q * vec2(7.0, 18.0) + seed * 13.0)));
  float rim = smoothstep(0.4 - aa, 0.85 + aa, sc.r) * smoothstep(-0.4, 0.3, sc.back) * visible;
  float edge = smoothstep(0.8 - aa, 1.0 + aa, sc.r) * smoothstep(-0.25, 0.35, sc.back) * visible;
  float grain = vnoise(q * vec2(60.0, 110.0) + seed * 5.0);

  Skin k;
  if (kind == 1) {
    // metallic gold: deep bronze down the flanks to warm gold along the back
    // (pushed toward orange because the green pond light pulls yellows toward olive)
    vec3 gold = mix(lin(vec3(0.4, 0.17, 0.02)), lin(vec3(0.98, 0.6, 0.13)), back);
    gold = mix(gold, lin(vec3(1.0, 0.7, 0.24)), head * 0.4 * back);
    // glossy black spots scattered over the body, edges following the scales, only the odd one on the head
    float sumiField = mix(markings(q + 5.7, seed), markings(sc.center + 5.7, seed), scaled * 0.45);
    float sumi = smoothstep(0.52, 0.58, sumiField - head * 0.12);
    vec3 c = mix(gold, lin(vec3(0.05, 0.05, 0.06)), sumi);
    // metallic scales: every scale edged with light
    c = mix(c, c * vec3(1.18, 1.12, 1.05), rim * 0.45);
    c *= 1.0 - edge * 0.12;
    k.color = c * (0.95 + 0.1 * grain);
    // black takes a cool, dim shine, so the spots stay glossy black instead of being washed gold
    k.sheen = mix(lin(vec3(1.0, 0.88, 0.62)), lin(vec3(0.4, 0.42, 0.46)), sumi);
    k.metal = 2.2;
    k.finBase = vec3(0.96, 0.66, 0.24);
    k.finTip = vec3(1.0, 0.9, 0.7);
  } else if (kind == 3) {
    // light calico: pale blue-lavender with white and bright orange patches and a scatter of fine speckles
    vec3 blue = mix(lin(vec3(0.5, 0.58, 0.72)), lin(vec3(0.72, 0.78, 0.88)), back);
    vec3 white = mix(lin(vec3(0.82, 0.8, 0.78)), lin(vec3(0.97, 0.95, 0.92)), back);
    vec3 orange = mix(lin(vec3(0.82, 0.28, 0.08)), lin(vec3(0.98, 0.5, 0.18)), back);
    float whiteMask = smoothstep(0.46, 0.6, markings(q + 7.3, seed));
    float orangeMask = smoothstep(0.52, 0.64, field);
    vec3 c = mix(mix(blue, white, whiteMask), orange, orangeMask);
    float speck = smoothstep(0.78, 0.86, vnoise(q * vec2(40.0, 90.0) + seed * 31.0)) * (1.0 - orangeMask * 0.6);
    c = mix(c, lin(vec3(0.12, 0.12, 0.18)), speck * 0.7);
    c = mix(c, c * 1.1, rim * 0.3);
    c *= 1.0 - edge * 0.1;
    k.color = c * (0.94 + 0.12 * grain);
    k.sheen = lin(vec3(0.9, 0.94, 1.0));
    k.metal = 0.5;
    k.finBase = vec3(0.78, 0.8, 0.88);
    k.finTip = vec3(0.96, 0.95, 0.94);
  } else {
    bool whiteKoi = kind == 2;
    vec3 orange = whiteKoi ? mix(lin(vec3(0.72, 0.16, 0.06)), lin(vec3(0.93, 0.32, 0.12)), back)
                           : mix(lin(vec3(0.8, 0.3, 0.1)), lin(vec3(0.97, 0.5, 0.22)), back);
    orange *= 0.84 + 0.26 * grain;
    vec3 cream = mix(lin(vec3(0.84, 0.66, 0.58)), lin(vec3(0.97, 0.9, 0.84)), back);
    float white = smoothstep(whiteKoi ? 0.44 : 0.64, whiteKoi ? 0.58 : 0.78, field + head * 0.08);
    vec3 c = mix(orange, cream, white);
    c = mix(c, c * vec3(1.12, 1.06, 1.0), rim * 0.35);
    c *= 1.0 - edge * 0.08;
    // a few dark scales around the shoulders
    float sumi = step(0.95, sc.rnd) * smoothstep(0.9, 0.3, sc.r) * scaled * (1.0 - smoothstep(0.5, 0.7, u)) * (1.0 - white);
    k.color = mix(c, lin(vec3(0.2, 0.1, 0.07)), sumi * 0.7);
    k.sheen = lin(vec3(1.0, 0.76, 0.42));
    k.metal = 0.8;
    k.finBase = whiteKoi ? vec3(0.95, 0.72, 0.62) : vec3(0.96, 0.54, 0.34);
    k.finTip = vec3(1.0, 0.9, 0.84);
  }
  return k;
}

// Fins read as soft translucent veils: the webbing carries the colour and fades toward a feathered edge,
// and the rays only show as faint streaks inside it.
vec4 shadeFin(Skin k, Fin f, float seed, vec3 sunC, float opacity) {
  if (f.web + f.ray <= 0.0) return vec4(0.0);
  float veil = 0.9 + 0.1 * vnoise(vec2(f.t * 9.0, f.across * 14.0) + seed * 17.0);
  float a = f.web * mix(0.66, 0.2, smoothstep(0.0, 1.0, f.t)) * veil;
  a += f.ray * f.web * 0.1 * (1.0 - f.t * 0.6);
  vec3 c = mix(k.finBase, k.finTip, smoothstep(0.05, 1.0, f.t));
  c *= 1.0 - f.ray * 0.08;
  a = clamp(a, 0.0, 1.0) * opacity;
  return vec4(lin(c) * (u_ambient * 1.3 + sunC * 1.05) * a, a);
}

void main() {
  float u = v_local.x;
  float s = v_local.y;
  int kind = int(floor(v_fish.x));
  float seed = fract(v_fish.x);
  float L = v_fish.y;
  float aa = 1.3 / L;
  vec2 q = vec2(u, s);
  vec2 lat = vec2(-v_tan.y, v_tan.x);

  // sunlight on the fish follows the caustics, softened because the fish swims above the bed
  vec2 cuv = vec2(v_p.x / u_size.x, 1.0 - v_p.y / u_size.y);
  vec2 px = 2.5 / u_size;
  float C = texture(u_caustic, cuv).r * 0.4
    + (texture(u_caustic, cuv + vec2(px.x, 0.0)).r + texture(u_caustic, cuv - vec2(px.x, 0.0)).r
     + texture(u_caustic, cuv + vec2(0.0, px.y)).r + texture(u_caustic, cuv - vec2(0.0, px.y)).r) * 0.15;
  vec3 sunC = u_sun * u_fishLight * mix(0.55, 1.35, clamp(C * 0.45, 0.0, 1.0));

  float hw = bodyHW(u);
  float nx = clamp(s / max(hw, 1e-4), -1.0, 1.0);
  float nz = sqrt(max(0.0, 1.0 - nx * nx));
  Scale sc = scaleAt(q);
  Skin k = skin(kind, q, nz, seed, sc, L);

  vec4 acc = over(shadeFin(k, tailFin(q, v_fish.z, seed, L), seed, sunC, 1.0), vec4(0.0));
  for (int i = 3; i >= 0; i--) {
    acc = over(shadeFin(k, pairedFin(q, i, v_motion.x, v_motion.y, L, seed), seed + float(i), sunC, 1.0), acc);
  }

  // the eyes sit right on the sides of the head and bulge past its outline
  vec2 eyeC = vec2(0.115, sign(s) * (bodyHW(0.115) + 0.002));
  float eyeD = length(q - eyeC) - 0.02;
  float bodyD = min(max(abs(s) - hw, -u), eyeD);
  float bodyA = (1.0 - smoothstep(-aa, aa, bodyD)) * (1.0 - smoothstep(0.96, 1.03, u));
  if (bodyA > 0.0) {
    float snout = 1.0 - smoothstep(0.0, 0.14, u);
    float tailward = smoothstep(0.5, 1.0, u);
    vec3 N = normalize(vec3(lat * nx * 0.95 + v_tan * (snout * 0.8 - tailward * 0.15) * nz, nz + 0.12));
    vec3 Ld = normalize(vec3(-0.42, -0.52, 0.74));
    vec3 Hv = normalize(Ld + vec3(0.0, 0.0, 1.0));
    float dif = max(dot(N, Ld), 0.0);
    float spec = pow(max(dot(N, Hv), 0.0), 36.0);

    vec3 col = k.color * (u_ambient * 1.25 + sunC * (0.3 + 0.7 * dif));
    // flanks fall away into shadow, but light glows through the thin edges
    col *= mix(0.7, 1.0, smoothstep(0.0, 0.55, nz));
    col += k.color * sunC * 0.12 * pow(1.0 - nz, 2.0);
    float sheen = pow(max(dot(N, Hv), 0.0), 7.0);
    col += mix(k.color, k.sheen, 0.6) * sunC * sheen * 0.16 * max(1.0, k.metal * 0.65);
    // metallic skin mirrors the bright water above in a broad band along the back
    col += mix(k.color, k.sheen, 0.5) * sunC * pow(max(dot(N, Hv), 0.0), 3.0) * 0.35 * max(k.metal - 1.2, 0.0);

    // each scale is a tiny tilted mirror, so glints shift as the fish turns
    float scaleRegion = smoothstep(0.22, 0.3, u) * (1.0 - smoothstep(0.9, 1.0, u)) * smoothstep(0.0, 0.35, nz);
    vec2 tilt = (v_tan * -(0.35 + 0.35 * sc.rnd2) + lat * (sc.rnd - 0.5) * 0.9) * 0.55;
    float glint = pow(max(dot(normalize(N + vec3(tilt, 0.0)), Hv), 0.0), 24.0);
    float patchN = smoothstep(0.25, 0.75, vnoise(vec2(u * 7.0, s * 22.0) + seed * 7.0 + vec2(u_time * 0.02, 0.0)));
    float rimGlow = smoothstep(0.5, 0.85, sc.r) * step(0.0, sc.back);
    col += k.sheen * scaleRegion * glint * (0.4 + 0.6 * patchN) * (0.45 + 0.9 * rimGlow) * sunC * 0.6 * k.metal;

    // smooth glossy head, gill covers behind it
    float gill = exp(-pow((u - 0.265 - 0.07 * nx * nx) / 0.006, 2.0)) * smoothstep(0.15, 0.6, abs(nx));
    col *= 1.0 - gill * 0.22;
    col *= 1.0 - smoothstep(0.265, 0.31, u) * (1.0 - smoothstep(0.31, 0.4, u)) * 0.1 * abs(nx);
    float crown = exp(-pow(s / (hw * 0.5 + 1e-4), 2.0)) * exp(-pow((u - 0.12) / 0.07, 2.0));
    col += mix(k.color, k.sheen, 0.5) * crown * 0.28 * sunC;
    float ridge = exp(-pow(s / max(hw * 0.22, 1e-4), 2.0)) * smoothstep(0.25, 0.45, u) * (1.0 - smoothstep(0.8, 1.0, u));
    col += k.sheen * ridge * 0.1 * sunC * k.metal;
    col += vec3(1.0, 0.92, 0.8) * spec * 0.24 * u_fishLight;

    vec3 headLight = u_ambient * 1.3 + sunC;

    // lips: a pale rim right at the snout with a faint crease just behind it
    float front = 1.0 - smoothstep(0.03, 0.08, u);
    float inside = -max(abs(s) - hw, -u);
    col = mix(col, lin(vec3(0.97, 0.9, 0.82)) * headLight, (1.0 - smoothstep(0.0, 0.01, inside)) * front * 0.45);
    col *= 1.0 - exp(-pow((inside - 0.017) / 0.004, 2.0)) * front * 0.25;

    // two nostrils on top, between the eyes and the snout
    float nostril = 1.0 - smoothstep(0.0, 1.0, length((q - vec2(0.062, sign(s) * 0.03)) / vec2(0.012, 0.009)));
    col *= 1.0 - nostril * 0.55;

    // eyes: a pale rim around a dark pupil that looks outward, with a wet highlight
    float eye = 1.0 - smoothstep(-aa, aa, eyeD);
    vec2 pupilC = eyeC + vec2(-0.002, sign(s) * 0.006);
    float pupil = 1.0 - smoothstep(-aa, aa, length(q - pupilC) - 0.012);
    vec3 eyeRim = mix(k.color, lin(vec3(0.9, 0.86, 0.78)), 0.55) * headLight;
    col = mix(col, mix(eyeRim, lin(vec3(0.03, 0.025, 0.02)) * headLight, pupil), eye);
    float eyeHi = 1.0 - smoothstep(0.0, 0.0045, length(q - pupilC - vec2(-0.004, -sign(s) * 0.004)));
    col += vec3(0.5, 0.48, 0.44) * eyeHi * pupil * u_fishLight;

    acc = over(vec4(col * bodyA, bodyA), acc);
  }

  // barbels: short pale whiskers at the corners of the mouth
  float whisker = 0.0;
  for (int i = 0; i < 2; i++) {
    float sg = i == 0 ? 1.0 : -1.0;
    vec2 root = vec2(0.03, sg * bodyHW(0.03) * 0.92);
    vec2 dir = normalize(vec2(0.45, sg));
    vec2 d = q - root;
    float along = clamp(dot(d, dir), 0.0, 0.05);
    float offPx = length(d - dir * along) * L;
    float width = mix(0.9, 0.35, along / 0.05);
    whisker = max(whisker, (1.0 - smoothstep(width * 0.5, width * 0.5 + 0.6, offPx)) * (1.0 - smoothstep(0.035, 0.05, along)));
  }
  if (whisker > 0.0) {
    float wa = whisker * 0.65;
    acc = over(vec4(lin(vec3(0.95, 0.9, 0.82)) * (u_ambient * 1.3 + sunC) * wa, wa), acc);
  }

  acc = over(shadeFin(k, dorsalFin(q, seed, L), seed + 9.0, sunC, 0.9), acc);
  o = acc;
}`,
    N = `${m}${z}
in vec2 v_local;
in vec2 v_tan;
in vec4 v_fish;
in vec2 v_motion;
in vec2 v_p;
out vec4 o;
float finShadow(Fin f, float web, float ray) {
  return max(f.web * web * mix(1.0, 0.4, clamp(f.t, 0.0, 1.0)), f.ray * ray);
}
void main() {
  float u = v_local.x;
  float s = v_local.y;
  float L = v_fish.y;
  float seed = fract(v_fish.x);
  float aa = 1.2 / L;
  vec2 q = vec2(u, s);
  float a = (1.0 - smoothstep(-aa, aa, max(abs(s) - bodyHW(u), -u))) * (1.0 - smoothstep(0.95, 1.04, u));
  a = max(a, finShadow(tailFin(q, v_fish.z, seed, L), 0.6, 0.5));
  for (int i = 0; i < 4; i++) {
    a = max(a, finShadow(pairedFin(q, i, v_motion.x, v_motion.y, L, seed), 0.35, 0.45));
  }
  a = max(a, finShadow(dorsalFin(q, seed, L), 0.3, 0.4));
  o = vec4(a, 0.0, 0.0, a);
}`,
    E = `#version 300 es
precision highp float;
in vec2 a_pos;
in vec3 a_leaf;
uniform vec2 u_size;
out vec3 v_leaf;
void main() {
  v_leaf = a_leaf;
  gl_Position = vec4(a_pos.x / u_size.x * 2.0 - 1.0, 1.0 - a_pos.y / u_size.y * 2.0, 0.0, 1.0);
}`,
    L = `${m}${x}
in vec3 v_leaf;
out vec4 o;
void main() {
  float t = v_leaf.x;
  float side = v_leaf.y;
  float seed = v_leaf.z;
  // deep green at the base to a slightly sunnier green at the tip, with a paler midrib and fine veins
  vec3 c = mix(vec3(0.05, 0.15, 0.08), vec3(0.2, 0.32, 0.12), smoothstep(0.05, 1.0, t));
  c *= 0.85 + 0.3 * hash12(vec2(seed * 91.0, 3.7));
  c = mix(c, c * 1.4, exp(-pow(side / 0.2, 2.0)) * 0.35);
  c *= 0.92 + 0.08 * sin(side * 14.0 + seed * 20.0);
  float a = (1.0 - smoothstep(0.7, 1.0, abs(side))) * mix(0.97, 0.8, t);
  o = vec4(c * a, a);
}`,
    R = `${m}${x}
in vec2 v_uv;
uniform sampler2D u_floor;
uniform sampler2D u_surface;
uniform sampler2D u_caustic;
uniform sampler2D u_shadow;
uniform sampler2D u_fish;
uniform sampler2D u_plants;
uniform sampler2D u_relief;
uniform float u_heightScale;
uniform vec2 u_size;
uniform float u_time;
uniform vec3 u_ambient;
uniform vec3 u_sun;
uniform float u_viewRefraction;
uniform float u_dispersion;
uniform float u_ringContrast;
uniform float u_exposure;
out vec4 o;
vec2 uvOf(vec2 p) { return vec2(p.x / u_size.x, 1.0 - p.y / u_size.y); }
vec3 aces(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
void main() {
  vec2 p = vec2(v_uv.x, 1.0 - v_uv.y) * u_size;
  vec4 S = texture(u_surface, v_uv);
  vec2 pf = p - S.yz * u_viewRefraction;
  vec4 bed = texture(u_floor, uvOf(pf));
  vec3 albedo = pow(bed.rgb, vec3(2.2));
  float sunlit = bed.a * 1.5;
  // sunlight and fish shadows land on a raised stone before they would have reached the bed around it
  vec2 pl = pf + vec2(0.6331, 0.4892) * texture(u_relief, uvOf(pf)).r * u_heightScale;
  // seaweed lies on the bed, so it takes the same caustics and fish shadows
  vec4 plant = texture(u_plants, uvOf(pf));
  albedo = mix(albedo, pow(plant.rgb / max(plant.a, 1e-3), vec3(2.2)), plant.a);

  vec2 split = S.yz * u_dispersion;
  vec3 C = vec3(
    texture(u_caustic, uvOf(pl + split)).r,
    texture(u_caustic, uvOf(pl)).g,
    texture(u_caustic, uvOf(pl - split)).b
  );
  C = pow(max(C, 0.0), vec3(1.5)) * 0.8;
  C *= exp(1.2 * tanh(-u_ringContrast * S.w / 1.2));

  float shadow = texture(u_shadow, uvOf(pl)).r * 0.95;
  vec3 light = u_ambient * (1.0 - 0.65 * shadow) + u_sun * C * sunlit * (1.0 - 0.97 * shadow);
  vec3 col = albedo * light;

  // fish are seen through the moving surface, which bends them ever so slightly
  vec2 shimmer = vec2(
    sin(p.y * 0.21 + u_time * 1.9 + sin(p.x * 0.05 + u_time * 0.7) * 1.5),
    sin(p.x * 0.19 - u_time * 1.6 + sin(p.y * 0.06 - u_time * 0.5) * 1.5)
  ) * 0.12;
  vec2 fp = p - S.yz * u_viewRefraction * 0.3 + shimmer;
  vec2 soften = vec2(0.55) / u_size;
  vec4 fish = texture(u_fish, uvOf(fp)) * 0.4
    + (texture(u_fish, uvOf(fp) + vec2(soften.x, 0.0)) + texture(u_fish, uvOf(fp) - vec2(soften.x, 0.0))
     + texture(u_fish, uvOf(fp) + vec2(0.0, soften.y)) + texture(u_fish, uvOf(fp) - vec2(0.0, soften.y))) * 0.15;
  col = col * (1.0 - fish.a) + fish.rgb;

  col = pow(aces(col * u_exposure), vec3(1.0 / 2.2));
  col += (hash12(gl_FragCoord.xy + fract(u_time * 7.13) * 311.0) - 0.5) * 0.028;
  o = vec4(col, 1.0);
}`,
    C = `${m}${x}
in vec2 v_uv;
uniform sampler2D u_scene;
uniform vec2 u_size;
uniform float u_unit;
uniform float u_feather;
uniform float u_blur;
/** film grain strength, grain size in device px, and which frame of grain to show */
uniform float u_grain;
uniform float u_grainSize;
uniform float u_grainFrame;
out vec4 o;
// soft clumps of grain, zero mean, roughly -1..1
float grainAt(vec2 x) {
  return (vnoise(x) * 0.65 + vnoise(x * 2.03 + 19.7) * 0.35 - 0.5) * 2.0;
}
void main() {
  vec2 p = vec2(v_uv.x, 1.0 - v_uv.y) * u_size;
  // distance in from a very rounded outline that wanders inward here and there, so the pond dissolves into the page
  // instead of ending in a frame; it never reaches past the canvas, so nothing gets cut off at the border
  vec2 halfSize = u_size * 0.5;
  float corner = u_feather * 1.8;
  vec2 q = abs(p - halfSize) - (halfSize - corner);
  float inside = corner - length(max(q, 0.0)) - min(max(q.x, q.y), 0.0);
  vec2 wp = p / u_unit;
  float wander = snoise(vec3(wp * 0.007, 3.1)) * 0.65 + snoise(vec3(wp * 0.018, 8.3)) * 0.35;
  inside -= clamp(wander * 0.5 + 0.5, 0.0, 1.0) * u_feather * 0.25;

  vec3 col = texture(u_scene, v_uv).rgb;
  float radius = (1.0 - smoothstep(0.0, u_feather * 0.9, inside)) * u_blur;
  if (radius > 0.25 && inside > 0.0) {
    vec3 sum = col;
    for (int i = 0; i < 16; i++) {
      float fi = float(i) + 0.5;
      float a = fi * 2.39996;
      vec2 offset = vec2(cos(a), -sin(a)) * sqrt(fi / 16.0) * radius / u_size;
      sum += texture(u_scene, v_uv + offset).rgb;
    }
    col = sum / 17.0;
  }
  // mild film grain over everything, re-rolled every film frame, with a touch of colour and strongest in the midtones
  vec2 gp = gl_FragCoord.xy / u_grainSize + hash22(vec2(u_grainFrame, 7.0)) * 512.0;
  vec3 grain = grainAt(gp) * 0.8 + vec3(grainAt(gp + 41.3), grainAt(gp + 83.1), grainAt(gp + 127.9)) * 0.2;
  float luma = dot(col, vec3(0.299, 0.587, 0.114));
  col = max(col + grain * u_grain * mix(0.55, 1.0, 4.0 * luma * (1.0 - luma)), 0.0);

  // a long, gentle tail so there's no visible line where the water ends
  float alpha = pow(smoothstep(0.0, 1.0, clamp(inside / u_feather, 0.0, 1.0)), 1.3);
  o = vec4(col * alpha, alpha);
}`,
    S = [0.03, 0.066, 0.056],
    A = [0.9, 0.92, 0.66],
    F = ["a_pos", "a_local", "a_tan", "a_fish", "a_motion"];
  function T(e, t) {
    let a,
      i,
      n,
      s,
      o,
      r,
      l,
      c,
      u,
      f,
      m = e.getContext("webgl2", {
        alpha: !0,
        antialias: !1,
        depth: !1,
        stencil: !1,
        premultipliedAlpha: !0,
        powerPreference: "high-performance",
      });
    if (!m || !m.getExtension("EXT_color_buffer_float")) return null;
    let x = [];
    function z(e, t, a = []) {
      let i = m.createProgram();
      for (let [a, n] of [
        [m.VERTEX_SHADER, e],
        [m.FRAGMENT_SHADER, t],
      ]) {
        let e = m.createShader(a);
        if (
          (m.shaderSource(e, n),
          m.compileShader(e),
          !m.getShaderParameter(e, m.COMPILE_STATUS) && !m.isContextLost())
        )
          throw Error(m.getShaderInfoLog(e) ?? "Pond shader failed to compile");
        (m.attachShader(i, e), m.deleteShader(e));
      }
      if (
        (a.forEach((e, t) => m.bindAttribLocation(i, t, e)),
        m.linkProgram(i),
        !m.getProgramParameter(i, m.LINK_STATUS) && !m.isContextLost())
      )
        throw Error(m.getProgramInfoLog(i) ?? "Pond program failed to link");
      x.push(i);
      let n = new Map();
      return {
        program: i,
        u: (e) => (n.has(e) || n.set(e, m.getUniformLocation(i, e)), n.get(e)),
      };
    }
    try {
      ((a = z(v, g)),
        (i = z(v, y)),
        (n = z(b, w, ["a_pos"])),
        (s = z(v, _)),
        (o = z(v, k)),
        (r = z(j, M, F)),
        (l = z(j, N, F)),
        (c = z(v, R)),
        (u = z(v, C)),
        (f = z(E, L, ["a_pos", "a_leaf"])));
    } catch (e) {
      return (console.error(e), x.forEach((e) => m.deleteProgram(e)), null);
    }
    let T = m.createVertexArray(),
      q = new Float32Array(64 * t * 108),
      B = m.createVertexArray(),
      P = m.createBuffer(),
      D = m.createBuffer();
    (m.bindVertexArray(B),
      m.bindBuffer(m.ARRAY_BUFFER, P),
      m.bufferData(m.ARRAY_BUFFER, q.byteLength, m.DYNAMIC_DRAW),
      [2, 2, 2, 4, 2].reduce(
        (e, t, a) => (
          m.enableVertexAttribArray(a),
          m.vertexAttribPointer(a, t, m.FLOAT, !1, 48, 4 * e),
          e + t
        ),
        0,
      ));
    let I = [];
    for (let e = 0; e < t; e++) {
      let t = 64 * e * 9;
      for (let e = 0; e < 63; e++)
        for (let a = 0; a < 8; a++) {
          let i = t + 9 * e + a;
          I.push(i, i + 9, i + 1, i + 1, i + 9, i + 9 + 1);
        }
    }
    (m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, D),
      m.bufferData(m.ELEMENT_ARRAY_BUFFER, new Uint16Array(I), m.STATIC_DRAW),
      m.bindVertexArray(null));
    let O = new Float32Array(128),
      U = 0,
      H = new Float32Array(128),
      V = 0,
      G = new Float32Array(64),
      W = 0,
      X = null;
    function Y(e, t, a) {
      let i = m.createTexture();
      (m.bindTexture(m.TEXTURE_2D, i),
        a
          ? m.texImage2D(
              m.TEXTURE_2D,
              0,
              m.RGBA16F,
              e,
              t,
              0,
              m.RGBA,
              m.HALF_FLOAT,
              null,
            )
          : m.texImage2D(
              m.TEXTURE_2D,
              0,
              m.RGBA8,
              e,
              t,
              0,
              m.RGBA,
              m.UNSIGNED_BYTE,
              null,
            ),
        m.texParameteri(m.TEXTURE_2D, m.TEXTURE_MIN_FILTER, m.LINEAR),
        m.texParameteri(m.TEXTURE_2D, m.TEXTURE_MAG_FILTER, m.LINEAR),
        m.texParameteri(m.TEXTURE_2D, m.TEXTURE_WRAP_S, m.CLAMP_TO_EDGE),
        m.texParameteri(m.TEXTURE_2D, m.TEXTURE_WRAP_T, m.CLAMP_TO_EDGE));
      let n = m.createFramebuffer();
      return (
        m.bindFramebuffer(m.FRAMEBUFFER, n),
        m.framebufferTexture2D(
          m.FRAMEBUFFER,
          m.COLOR_ATTACHMENT0,
          m.TEXTURE_2D,
          i,
          0,
        ),
        m.clearColor(0, 0, 0, 0),
        m.clear(m.COLOR_BUFFER_BIT),
        { tex: i, fb: n, w: e, h: t }
      );
    }
    function $(e) {
      (m.deleteTexture(e.tex), m.deleteFramebuffer(e.fb));
    }
    function K(e) {
      (m.bindFramebuffer(m.FRAMEBUFFER, e ? e.fb : null),
        m.viewport(
          0,
          0,
          e ? e.w : m.drawingBufferWidth,
          e ? e.h : m.drawingBufferHeight,
        ));
    }
    function Z(e, t, a, i) {
      (m.activeTexture(m.TEXTURE0 + i),
        m.bindTexture(m.TEXTURE_2D, a),
        m.uniform1i(e.u(t), i));
    }
    function J() {
      (m.bindVertexArray(T), m.drawArrays(m.TRIANGLES, 0, 3));
    }
    function Q(e, t, a) {
      (m.useProgram(s.program),
        K(t),
        Z(s, "u_tex", e.tex, 0),
        m.uniform2f(s.u("u_dir"), a / e.w, 0),
        J(),
        K(e),
        Z(s, "u_tex", t.tex, 0),
        m.uniform2f(s.u("u_dir"), 0, a / e.h),
        J());
    }
    function ee() {
      if (!X) return;
      let {
        rippleA: e,
        rippleB: t,
        surface: a,
        caustic: i,
        causticBlur: n,
        floor: s,
        relief: o,
        plants: r,
        fish: l,
        shadow: c,
        shadowBlur: u,
        scene: f,
      } = X;
      ([e, t, a, i, n, s, o, r, l, c, u, f].forEach($),
        m.deleteVertexArray(X.gridVao),
        m.deleteVertexArray(X.seaweedVao),
        X.seaweedBuffers.forEach((e) => m.deleteBuffer(e)),
        X.gridBuffers.forEach((e) => m.deleteBuffer(e)),
        (X = null));
    }
    function et(e) {
      let t;
      if (!X) return;
      let { width: a, height: i } = X;
      m.disable(m.BLEND);
      let n = a / 540;
      (m.useProgram(o.program),
        m.uniform2f(o.u("u_size"), a, i),
        m.uniform1f(o.u("u_unit"), n),
        m.uniform1f(o.u("u_heightScale"), 40 * n));
      let s =
        ((t = a / 540),
        {
          placement: new Float32Array(
            d.flatMap((e) => [e.x * a, e.y * i, e.angle, e.seed]),
          ),
          size: new Float32Array(
            d.flatMap((e) => [e.length * t, e.width * t, e.height * t, e.kind]),
          ),
        });
      for (let [t, i] of (m.uniform4fv(o.u("u_stones[0]"), s.placement),
      m.uniform4fv(o.u("u_stoneSize[0]"), s.size),
      e))
        (K(t),
          m.uniform1i(o.u("u_pass"), i),
          m.uniform1f(o.u("u_pixel"), a / t.w),
          J());
    }
    return {
      fishVertices: q,
      resize: function (t, a, i) {
        let n,
          s,
          o,
          r,
          l = Math.max(1, Math.round(t)),
          c = Math.max(1, Math.round(a)),
          u = Math.max(1, Math.round(t * i)),
          f = Math.max(1, Math.round(a * i));
        if (X && X.width === l && X.height === c) {
          if (e.width === u && e.height === f) return;
          ([X.floor, X.plants, X.fish, X.scene].forEach($),
            (e.width = u),
            (e.height = f),
            (X.floor = Y(u, f, !1)),
            (X.plants = Y(u, f, !1)),
            (X.fish = Y(u, f, !0)),
            (X.scene = Y(u, f, !1)),
            et([[X.floor, 0]]));
          return;
        }
        (ee(), (e.width = u), (e.height = f));
        let v = Math.ceil((l + 96) / 2) + 1,
          x = Math.ceil((c + 96) / 2) + 1,
          g = new Float32Array(v * x * 2);
        for (let e = 0; e < x; e++)
          for (let t = 0; t < v; t++)
            ((g[(e * v + t) * 2] = -48 + 2 * t),
              (g[(e * v + t) * 2 + 1] = -48 + 2 * e));
        let y = new Uint32Array((v - 1) * (x - 1) * 6),
          b = 0;
        for (let e = 0; e < x - 1; e++)
          for (let t = 0; t < v - 1; t++) {
            let a = e * v + t;
            ((y[b++] = a),
              (y[b++] = a + v),
              (y[b++] = a + 1),
              (y[b++] = a + 1),
              (y[b++] = a + v),
              (y[b++] = a + v + 1));
          }
        let w = m.createVertexArray(),
          _ = m.createBuffer(),
          k = m.createBuffer();
        (m.bindVertexArray(w),
          m.bindBuffer(m.ARRAY_BUFFER, _),
          m.bufferData(m.ARRAY_BUFFER, g, m.STATIC_DRAW),
          m.enableVertexAttribArray(0),
          m.vertexAttribPointer(0, 2, m.FLOAT, !1, 0, 0),
          m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, k),
          m.bufferData(m.ELEMENT_ARRAY_BUFFER, y, m.STATIC_DRAW),
          m.bindVertexArray(null),
          et([
            [
              (X = {
                width: l,
                height: c,
                unit: l / 540,
                rippleA: Y(l, c, !0),
                rippleB: Y(l, c, !0),
                surface: Y(l, c, !0),
                caustic: Y(l, c, !0),
                causticBlur: Y(l, c, !0),
                floor: Y(u, f, !1),
                relief: Y(l, c, !1),
                plants: Y(u, f, !1),
                fish: Y(u, f, !0),
                shadow: Y(Math.ceil(l / 2), Math.ceil(c / 2), !1),
                shadowBlur: Y(Math.ceil(l / 2), Math.ceil(c / 2), !1),
                scene: Y(u, f, !1),
                gridVao: w,
                gridBuffers: [_, k],
                gridIndexCount: y.length,
                ...((n = (function (e, t) {
                  let a = e / 540,
                    i = p,
                    n = () => (i = (16807 * i) % 0x7fffffff) / 0x7fffffff,
                    s = [...h];
                  for (let i = 0; s.length < h.length + 7 && i < 400; i++) {
                    let i = n(),
                      o = n(),
                      r = Math.min(i * e, (1 - i) * e, o * t, (1 - o) * t);
                    !(r < 50 * a) &&
                      !(r > 110 * a) &&
                      (s.some(
                        (n) =>
                          Math.hypot((n.x - i) * e, (n.y - o) * t) < 60 * a,
                      ) ||
                        d.some(
                          (n) =>
                            Math.hypot((n.x - i) * e, (n.y - o) * t) <
                            (n.length + 25) * a,
                        ) ||
                        s.push({
                          x: i,
                          y: o,
                          angle: 0.55 + (n() - 0.5) * 0.6,
                          spread: 1.3,
                          count: 4 + Math.floor(3 * n()),
                          root: 6,
                          length: [16, 38],
                          width: [4, 6.5],
                        }));
                  }
                  let o = s.flatMap((i) =>
                      Array.from({ length: i.count }, () => ({
                        x: i.x * e + (n() - 0.5) * i.root * a,
                        y: i.y * t + (n() - 0.5) * i.root * a,
                        angle: i.angle + (n() - 0.5) * i.spread,
                        length:
                          (i.length[0] + n() * (i.length[1] - i.length[0])) * a,
                        width:
                          (i.width[0] + n() * (i.width[1] - i.width[0])) * a,
                        curl: (n() - 0.5) * 1.2,
                        seed: n(),
                      })),
                    ),
                    r = new Float32Array(14 * o.length * 10),
                    l = new Uint16Array(13 * o.length * 6),
                    c = 0;
                  function u(e) {
                    let t = 0;
                    for (let a of o) {
                      let i = a.length / 13,
                        n = a.x,
                        s = a.y;
                      for (let o = 0; o < 14; o++) {
                        let l = o / 13,
                          c =
                            0.28 *
                              Math.sin(0.8 * e + 17 * a.seed - 2.4 * l) *
                              l +
                            0.05 * Math.sin(1.9 * e + 5 * a.seed - 4.5 * l) * l,
                          u = a.angle + a.curl * l + c;
                        o > 0 &&
                          ((n += Math.cos(u) * i), (s += Math.sin(u) * i));
                        let f =
                            0.5 *
                            a.width *
                            Math.pow(
                              Math.sin(Math.PI * Math.min(1, 0.15 + 0.85 * l)),
                              0.6,
                            ),
                          d = -Math.sin(u) * f,
                          h = Math.cos(u) * f;
                        for (let e of [-1, 1])
                          ((r[t++] = n + d * e),
                            (r[t++] = s + h * e),
                            (r[t++] = l),
                            (r[t++] = e),
                            (r[t++] = a.seed));
                      }
                    }
                  }
                  return (
                    o.forEach((e, t) => {
                      let a = 14 * t * 2;
                      for (let e = 0; e < 13; e++) {
                        let t = a + 2 * e;
                        (l.set([t, t + 2, t + 1, t + 1, t + 2, t + 3], c),
                          (c += 6));
                      }
                    }),
                    u(0),
                    { vertices: r, indices: l, write: u }
                  );
                })(l, c)),
                (s = m.createVertexArray()),
                (o = m.createBuffer()),
                (r = m.createBuffer()),
                m.bindVertexArray(s),
                m.bindBuffer(m.ARRAY_BUFFER, o),
                m.bufferData(m.ARRAY_BUFFER, n.vertices, m.DYNAMIC_DRAW),
                m.enableVertexAttribArray(0),
                m.vertexAttribPointer(0, 2, m.FLOAT, !1, 20, 0),
                m.enableVertexAttribArray(1),
                m.vertexAttribPointer(1, 3, m.FLOAT, !1, 20, 8),
                m.bindBuffer(m.ELEMENT_ARRAY_BUFFER, r),
                m.bufferData(m.ELEMENT_ARRAY_BUFFER, n.indices, m.STATIC_DRAW),
                m.bindVertexArray(null),
                { seaweed: n, seaweedVao: s, seaweedBuffers: [o, r] }),
              }).floor,
              0,
            ],
            [X.relief, 1],
          ]));
      },
      drop: function (e, t, a, i) {
        !(U >= 32) && (O.set([e, t, a, i], 4 * U), U++);
      },
      splash: function (e, t, a, i) {
        return !(V >= 32) && (H.set([e, t, a, i], 4 * V), V++, !0);
      },
      splashRoom: function () {
        return 32 - V;
      },
      push: function (e, t, a, i) {
        return !(W >= 16) && (G.set([e, t, a, i], 4 * W), W++, !0);
      },
      pushRoom: function () {
        return 16 - W;
      },
      stepRipples: function (e) {
        X &&
          (m.disable(m.BLEND),
          K(X.rippleB),
          m.useProgram(a.program),
          Z(a, "u_state", X.rippleA.tex, 0),
          m.uniform2f(a.u("u_size"), X.width, X.height),
          m.uniform1f(a.u("u_dt"), e),
          m.uniform1f(a.u("u_stiffness"), 22500),
          m.uniform2f(a.u("u_damping"), 0.06 ** e, 0.2 ** e),
          m.uniform1f(a.u("u_smoothing"), 3 * e),
          m.uniform1i(a.u("u_dropCount"), U),
          m.uniform4fv(a.u("u_drops[0]"), O),
          m.uniform1i(a.u("u_splashCount"), V),
          m.uniform4fv(a.u("u_splashes[0]"), H),
          m.uniform1i(a.u("u_pushCount"), W),
          m.uniform4fv(a.u("u_pushes[0]"), G),
          J(),
          (U = 0),
          (V = 0),
          (W = 0),
          ([X.rippleA, X.rippleB] = [X.rippleB, X.rippleA]));
      },
      render: function (e) {
        if (!X || m.isContextLost()) return;
        let a = X,
          s = a.unit;
        (m.disable(m.BLEND),
          K(a.surface),
          m.useProgram(i.program),
          Z(i, "u_state", a.rippleA.tex, 0),
          m.uniform2f(i.u("u_size"), a.width, a.height),
          m.uniform1f(i.u("u_time"), e),
          m.uniform1f(i.u("u_scale"), 0.0042 / s),
          m.uniform2f(i.u("u_fine"), 0.05, 0.35),
          m.uniform2f(i.u("u_big"), 0.13, 0.55),
          J(),
          K(a.caustic),
          m.clearColor(0, 0, 0, 0),
          m.clear(m.COLOR_BUFFER_BIT),
          m.enable(m.BLEND),
          m.blendFunc(m.ONE, m.ONE),
          m.useProgram(n.program),
          Z(n, "u_surface", a.surface.tex, 0),
          m.uniform2f(n.u("u_size"), a.width, a.height),
          m.uniform1f(n.u("u_depth"), 560 * s * s),
          m.bindVertexArray(a.gridVao),
          m.drawElements(m.TRIANGLES, a.gridIndexCount, m.UNSIGNED_INT, 0),
          m.disable(m.BLEND),
          Q(a.caustic, a.causticBlur, 1.3),
          m.useProgram(l.program),
          K(a.shadow),
          m.clear(m.COLOR_BUFFER_BIT),
          m.enable(m.BLEND),
          m.blendFunc(m.ONE, m.ONE_MINUS_SRC_ALPHA),
          m.bindVertexArray(B),
          m.bindBuffer(m.ARRAY_BUFFER, P),
          m.bufferSubData(m.ARRAY_BUFFER, 0, q),
          m.uniform2f(l.u("u_size"), a.width, a.height),
          m.uniform1f(l.u("u_time"), e),
          m.uniform2f(l.u("u_offset"), 22 * s, 17 * s),
          m.drawElements(m.TRIANGLES, 3024 * t, m.UNSIGNED_SHORT, 0),
          m.disable(m.BLEND),
          Q(a.shadow, a.shadowBlur, 1.2),
          Q(a.shadow, a.shadowBlur, 1.2),
          K(a.fish),
          m.clear(m.COLOR_BUFFER_BIT),
          m.enable(m.BLEND),
          m.blendFunc(m.ONE, m.ONE_MINUS_SRC_ALPHA),
          m.useProgram(r.program),
          Z(r, "u_caustic", a.caustic.tex, 0),
          m.uniform2f(r.u("u_size"), a.width, a.height),
          m.uniform2f(r.u("u_offset"), 0, 0),
          m.uniform1f(r.u("u_time"), e),
          m.uniform3fv(r.u("u_ambient"), S),
          m.uniform3fv(r.u("u_sun"), A),
          m.uniform1f(r.u("u_fishLight"), 0.62),
          m.uniform1f(r.u("u_pixel"), a.width / a.fish.w),
          m.bindVertexArray(B),
          m.drawElements(m.TRIANGLES, 3024 * t, m.UNSIGNED_SHORT, 0),
          m.disable(m.BLEND),
          a.seaweed.write(e),
          K(a.plants),
          m.clear(m.COLOR_BUFFER_BIT),
          m.enable(m.BLEND),
          m.blendFunc(m.ONE, m.ONE_MINUS_SRC_ALPHA),
          m.useProgram(f.program),
          m.uniform2f(f.u("u_size"), a.width, a.height),
          m.bindVertexArray(a.seaweedVao),
          m.bindBuffer(m.ARRAY_BUFFER, a.seaweedBuffers[0]),
          m.bufferSubData(m.ARRAY_BUFFER, 0, a.seaweed.vertices),
          m.drawElements(
            m.TRIANGLES,
            a.seaweed.indices.length,
            m.UNSIGNED_SHORT,
            0,
          ),
          m.disable(m.BLEND),
          K(a.scene),
          m.useProgram(c.program),
          Z(c, "u_floor", a.floor.tex, 0),
          Z(c, "u_surface", a.surface.tex, 1),
          Z(c, "u_caustic", a.caustic.tex, 2),
          Z(c, "u_shadow", a.shadow.tex, 3),
          Z(c, "u_fish", a.fish.tex, 4),
          Z(c, "u_plants", a.plants.tex, 5),
          Z(c, "u_relief", a.relief.tex, 6),
          m.uniform1f(c.u("u_heightScale"), 40 * s),
          m.uniform2f(c.u("u_size"), a.width, a.height),
          m.uniform1f(c.u("u_time"), e),
          m.uniform3fv(c.u("u_ambient"), S),
          m.uniform3fv(c.u("u_sun"), A),
          m.uniform1f(c.u("u_viewRefraction"), 120 * s * s),
          m.uniform1f(c.u("u_dispersion"), 60 * s * s),
          m.uniform1f(c.u("u_ringContrast"), 150),
          m.uniform1f(c.u("u_exposure"), 1.3),
          J(),
          K(null),
          m.clearColor(0, 0, 0, 0),
          m.clear(m.COLOR_BUFFER_BIT),
          m.useProgram(u.program),
          Z(u, "u_scene", a.scene.tex, 0),
          m.uniform2f(u.u("u_size"), a.width, a.height),
          m.uniform1f(u.u("u_unit"), s),
          m.uniform1f(u.u("u_feather"), 30 * s),
          m.uniform1f(u.u("u_blur"), 0 * s),
          m.uniform1f(u.u("u_grain"), 0.07),
          m.uniform1f(
            u.u("u_grainSize"),
            1.2 * (m.drawingBufferWidth / a.width),
          ),
          m.uniform1f(u.u("u_grainFrame"), Math.floor(24 * e) % 1024),
          J());
      },
      dispose: function () {
        (ee(),
          x.forEach((e) => m.deleteProgram(e)),
          m.deleteVertexArray(T),
          m.deleteVertexArray(B),
          m.deleteBuffer(P),
          m.deleteBuffer(D));
      },
    };
  }
  function q({ className: e }) {
    let a = (0, i.useRef)(null),
      d = (0, i.useRef)(null);
    return (
      (0, i.useEffect)(() => {
        let e = a.current,
          t = d.current;
        if (!e || !t) return;
        let i = e.clientWidth,
          n = e.clientHeight,
          h = (function (e, t) {
            let a = e,
              i = t,
              n = [],
              d = o.map((a) => {
                let i = a.size * e,
                  n = {
                    kind: a.kind,
                    seed: a.seed,
                    size: a.size,
                    length: i,
                    lift: a.lift,
                    x: a.x * e,
                    y: a.y * t,
                    prevHeadX: a.x * e,
                    prevHeadY: a.y * t,
                    heading: a.heading,
                    turn: 0,
                    speed: 0,
                    cruise: i * (0.2 + 0.1 * a.seed),
                    goalX: a.x * e,
                    goalY: a.y * t,
                    goalUntil: 0,
                    fear: 0,
                    fleeAngle: 0,
                    beat: a.seed * s,
                    flickSide: 1,
                    flicked: !1,
                    finPhase: 20 * a.seed,
                    fold: 0,
                    swim: 0.4,
                    spine: new Float32Array(44),
                    trail: new Float32Array(320),
                    trailCount: 160,
                    rows: new Float32Array(256),
                  };
                n.speed = n.cruise;
                for (let e = 0; e < 160; e++)
                  ((n.trail[2 * e] = n.x - Math.cos(n.heading) * i * 0.02 * e),
                    (n.trail[2 * e + 1] =
                      n.y - Math.sin(n.heading) * i * 0.02 * e));
                return (p(n), m(n), n);
              }),
              h = [...d].sort((e, t) => e.lift - t.lift);
            function p(e) {
              let { spine: t, trail: a } = e,
                i = (1.52 * e.length) / 21;
              ((t[0] = e.x), (t[1] = e.y));
              let n = e.x,
                s = e.y,
                o = i,
                r = 1;
              for (let l = 0; r < 22 && l < e.trailCount;) {
                let e = Math.hypot(a[2 * l] - n, a[2 * l + 1] - s);
                e >= o
                  ? ((n += ((a[2 * l] - n) * o) / e),
                    (s += ((a[2 * l + 1] - s) * o) / e),
                    (t[2 * r] = n),
                    (t[2 * r + 1] = s),
                    r++,
                    (o = i))
                  : ((o -= e), (n = a[2 * l]), (s = a[2 * l + 1]), l++);
              }
              let l =
                  r >= 2
                    ? t[(r - 1) * 2] - t[(r - 2) * 2]
                    : -Math.cos(e.heading),
                c =
                  r >= 2
                    ? t[(r - 1) * 2 + 1] - t[(r - 2) * 2 + 1]
                    : -Math.sin(e.heading),
                u = Math.hypot(l, c) || 1;
              for (l /= u, c /= u; r < 22; r++)
                ((t[2 * r] = t[(r - 1) * 2] + l * i),
                  (t[2 * r + 1] = t[(r - 1) * 2 + 1] + c * i));
            }
            function m(e) {
              let { spine: t, rows: a, length: i } = e,
                n = Math.cos(e.heading),
                s = Math.sin(e.heading);
              for (let o = 0; o < 64; o++) {
                let r,
                  c,
                  f,
                  d,
                  h = u(o);
                if (h <= 0)
                  ((r = e.x - n * h * i),
                    (c = e.y - s * h * i),
                    (f = n),
                    (d = s));
                else {
                  let e = 21 * Math.min(h / 1.52, 1),
                    a = Math.min(Math.floor(e), 20),
                    i = e - a;
                  ((r = t[2 * a] + (t[(a + 1) * 2] - t[2 * a]) * i),
                    (c =
                      t[2 * a + 1] + (t[(a + 1) * 2 + 1] - t[2 * a + 1]) * i));
                  let n =
                    Math.hypot(
                      (f = t[2 * a] - t[(a + 1) * 2]),
                      (d = t[2 * a + 1] - t[(a + 1) * 2 + 1]),
                    ) || 1;
                  ((f /= n), (d /= n));
                }
                let p =
                  i *
                  (0.008 + 0.07 * Math.pow(l(0.15, 1.52, h), 1.5)) *
                  e.swim *
                  Math.sin(e.beat - 5.2 * h);
                ((a[4 * o] = r - d * p), (a[4 * o + 1] = c + f * p));
              }
              for (let e = 0; e < 64; e++) {
                let t = Math.max(e - 1, 0),
                  i = Math.min(e + 1, 63),
                  n = a[4 * t] - a[4 * i],
                  s = a[4 * t + 1] - a[4 * i + 1],
                  o = Math.hypot(n, s) || 1;
                ((a[4 * e + 2] = n / o), (a[4 * e + 3] = s / o));
              }
            }
            function v(e, t, a, i) {
              let n = 4 * f(0.45),
                s = e.rows[n] - t,
                o = e.rows[n + 1] - a;
              if (4 > Math.hypot(s, o)) {
                let t = 0.5 > Math.random() ? 1 : -1;
                ((s = -Math.sin(e.heading) * t), (o = Math.cos(e.heading) * t));
              }
              ((e.fleeAngle = Math.atan2(o, s) + (Math.random() - 0.5) * 0.8),
                (e.fear = Math.max(e.fear, i)));
            }
            function x(e, t, a, i, n) {
              for (let s of d) {
                if (s === n) continue;
                let o = Math.hypot(s.x - e, s.y - t);
                o < a && v(s, e, t, i * (1 - o / a));
              }
            }
            return {
              count: d.length,
              update: function (e, t) {
                for (let n of d) {
                  let o = n.length,
                    l = 4 * f(0.12);
                  ((n.prevHeadX = n.rows[l]),
                    (n.prevHeadY = n.rows[l + 1]),
                    (t > n.goalUntil ||
                      Math.hypot(n.goalX - n.x, n.goalY - n.y) < 0.8 * o) &&
                      (function (e, t) {
                        let n = -1 / 0;
                        for (let t = 0; t < 6; t++) {
                          let t = a * (0.12 + 0.76 * Math.random()),
                            s = i * (0.12 + 0.76 * Math.random()),
                            o = Math.hypot(t - e.x, s - e.y);
                          if (o < 1.2 * e.length) continue;
                          let r = 1 / 0;
                          for (let a of d)
                            a !== e &&
                              (r = Math.min(
                                r,
                                Math.hypot(t - a.x, s - a.y),
                                Math.hypot(t - a.goalX, s - a.goalY),
                              ));
                          let l = Math.min(r, 2.5 * e.length) - 0.15 * o;
                          l > n && ((n = l), (e.goalX = t), (e.goalY = s));
                        }
                        e.goalUntil = t + 8 + 10 * Math.random();
                      })(n, t));
                  let u = Math.cos(n.heading),
                    h = Math.sin(n.heading),
                    v = Math.hypot(n.goalX - n.x, n.goalY - n.y) || 1,
                    x = (n.goalX - n.x) / v,
                    g = (n.goalY - n.y) / v,
                    y =
                      0.18 * Math.sin(0.4 * t + 17 * n.seed) +
                      0.05 * Math.sin(1.1 * t + 5 * n.seed),
                    b = x - g * y,
                    w = g + x * y,
                    _ = n.x + u * o * 0.8,
                    k = n.y + h * o * 0.8,
                    j = -0.15 * o,
                    z = (e) => Math.max(e, 0) / o,
                    M = z(j - _) - z(_ - (a - j)),
                    N = z(j - k) - z(k - (i - j));
                  ((b += M * (4 + 8 * Math.abs(M))),
                    (w += N * (4 + 8 * Math.abs(N))));
                  let E = 0;
                  for (let e of d) {
                    if (e === n) continue;
                    let t = (o + e.length) * 0.55;
                    for (let a of [0, 0.6, 1.3]) {
                      let i = n.x + u * o * a,
                        s = n.y + h * o * a,
                        l = 1 / 0,
                        c = 0,
                        d = 0;
                      for (let t = f(0); t < f(1.1); t += 3) {
                        let a = 4 * t,
                          n = 4 * Math.min(t + 3, 63),
                          o = e.rows[n] - e.rows[a],
                          u = e.rows[n + 1] - e.rows[a + 1],
                          f = r(
                            ((i - e.rows[a]) * o + (s - e.rows[a + 1]) * u) /
                              (o * o + u * u || 1),
                            0,
                            1,
                          ),
                          h = i - (e.rows[a] + o * f),
                          p = s - (e.rows[a + 1] + u * f),
                          m = Math.hypot(h, p);
                        m < l && ((l = m), (c = h), (d = p));
                      }
                      if (l >= t) continue;
                      let p = 1 - l / t;
                      (l < 1 && ((c = -h), (d = u), (l = 1)),
                        (b += (c / l) * p * p * 9),
                        (w += (d / l) * p * p * 9),
                        (E = Math.max(E, p * (a > 1 ? 0.6 : 1))));
                    }
                  }
                  (E > 0.6 && (n.goalUntil = Math.min(n.goalUntil, t + 1.2)),
                    n.fear > 0.02 &&
                      ((b += Math.cos(n.fleeAngle) * n.fear * 6),
                      (w += Math.sin(n.fleeAngle) * n.fear * 6)));
                  let L = c(Math.atan2(w, b) - n.heading),
                    R = Math.min(
                      0.6 + 2.4 * E + 8 * n.fear,
                      6,
                      0.3 + n.speed / (0.5 * o),
                    ),
                    C = 1.2 + 2 * E + 8 * n.fear,
                    S = r(L * C, -R, R);
                  ((n.turn += (S - n.turn) * (1 - Math.exp(-e * C * 4.5))),
                    (n.heading = c(n.heading + n.turn * e)));
                  let A =
                      0.7 +
                      0.45 * (0.5 + 0.5 * Math.sin(0.37 * t + 23 * n.seed)),
                    F =
                      n.cruise *
                        A *
                        (1 - 0.35 * Math.min(Math.abs(L), 1)) *
                        (1 - 0.4 * E) +
                      n.fear * o * 3.4;
                  ((n.speed +=
                    (F - n.speed) *
                    (1 - Math.exp(-e * (n.fear > 0.15 ? 7 : 1.1)))),
                    (n.x += Math.cos(n.heading) * n.speed * e),
                    (n.y += Math.sin(n.heading) * n.speed * e),
                    (n.fear *= Math.exp(-(1.5 * e))));
                  let T = n.speed / o,
                    q = n.beat;
                  ((n.beat += e * s * (0.7 + 2.2 * T)),
                    Math.floor(n.beat / Math.PI) !== Math.floor(q / Math.PI) &&
                      (n.flicked = !0),
                    (n.finPhase += e * s * (0.8 + 0.4 * n.seed)),
                    (n.fold +=
                      ((n.fear > 0.25) - n.fold) * (1 - Math.exp(-(6 * e)))),
                    (n.swim = 0.3 + 0.7 * r(T / 1.2, 0, 1)),
                    (function (e) {
                      let t = e.trail;
                      Math.hypot(e.x - t[0], e.y - t[1]) < 0.02 * e.length ||
                        (t.copyWithin(2, 0, t.length - 2),
                        (t[0] = e.x),
                        (t[1] = e.y),
                        (e.trailCount = Math.min(e.trailCount + 1, 160)));
                    })(n),
                    p(n),
                    m(n));
                }
              },
              writeVertices: function (e) {
                let t = 0;
                for (let a of h) {
                  let { rows: i, length: n } = a;
                  for (let s = 0; s < 64; s++) {
                    let o = u(s),
                      r = i[4 * s],
                      l = i[4 * s + 1],
                      c = i[4 * s + 2],
                      f = i[4 * s + 3];
                    for (let i = 0; i < 9; i++) {
                      let s = -0.42 + (0.84 * i) / 8;
                      ((e[t++] = r - f * s * n),
                        (e[t++] = l + c * s * n),
                        (e[t++] = o),
                        (e[t++] = s),
                        (e[t++] = c),
                        (e[t++] = f),
                        (e[t++] = a.kind + a.seed),
                        (e[t++] = n),
                        (e[t++] = a.beat),
                        (e[t++] = a.lift),
                        (e[t++] = a.fold),
                        (e[t++] = a.finPhase));
                    }
                  }
                }
              },
              emitRipples: function (e, t, a, i) {
                let o = 180 * a;
                for (let [a, l, c, u] of (d.forEach((a, n) => {
                  let { rows: l, length: c } = a,
                    u = a.speed / c,
                    d = 4 * f(0.12),
                    h = a.prevHeadX + (l[d] - a.prevHeadX) * t,
                    p = a.prevHeadY + (l[d + 1] - a.prevHeadY) * t,
                    m = l[d + 2],
                    v = l[d + 3],
                    x = 2800 * Math.tanh(a.speed / 380);
                  if (
                    (x > 20 &&
                      i.pushRoom() >= 2 &&
                      (i.push(h + m * c * 0.08, p + v * c * 0.08, 0.11 * c, x),
                      i.push(h - m * c * 0.12, p - v * c * 0.12, 0.11 * c, -x)),
                    a.flicked)
                  ) {
                    ((a.flicked = !1), (a.flickSide = -a.flickSide));
                    let e = 4 * f(1.3),
                      t = a.flickSide * c * 0.05;
                    i.drop(
                      l[e] - l[e + 3] * t,
                      l[e + 1] + l[e + 2] * t,
                      3.2,
                      0.06 + 0.24 * r(u / 2, 0, 1),
                    );
                  }
                  let g = 1 - r(u / 0.5, 0, 1);
                  if (g > 0.05) {
                    let t = 4 * f(0.26),
                      r =
                        0.05 *
                        Math.sin(e * s * 14 + 1.7 * n) *
                        g *
                        (1 - a.fold) *
                        o;
                    for (let e of [1, -1]) {
                      let a = -l[t + 3] * e * 0.09 * c,
                        n = l[t + 2] * e * 0.09 * c;
                      i.drop(l[t] + a, l[t + 1] + n, 3, r);
                    }
                  }
                }),
                n))
                  i.splash(a, l, c, u);
                n.length = 0;
              },
              hitTest: function (e, t) {
                for (let a = h.length - 1; a >= 0; a--) {
                  let i = h[a],
                    { rows: n, length: s } = i;
                  for (let a = 0; a < 63; a++) {
                    let o = u(a);
                    if (o < 0) continue;
                    let l =
                      (o <= 1
                        ? (function (e) {
                            if (e < 0) return 0;
                            let t = Math.sqrt(
                              Math.max(
                                0,
                                1 - (Math.max(0.3 - e, 0) / 0.3) ** 2,
                              ),
                            );
                            return (
                              (0.05 +
                                0.085 * (1 - r((e - 0.3) / 0.7, 0, 1) ** 1.4)) *
                              t
                            );
                          })(o) * s
                        : 0.12 * s) + 10;
                    if (
                      (function (e, t, a, i, n, s) {
                        let o = n - a,
                          l = s - i,
                          c = r(
                            ((e - a) * o + (t - i) * l) / (o * o + l * l || 1),
                            0,
                            1,
                          );
                        return Math.hypot(e - (a + o * c), t - (i + l * c));
                      })(
                        e,
                        t,
                        n[4 * a],
                        n[4 * a + 1],
                        n[(a + 1) * 4],
                        n[(a + 1) * 4 + 1],
                      ) < l
                    )
                      return i;
                  }
                }
                return null;
              },
              scare: function (e, t, a) {
                let i = e.fear < 0.5;
                if ((v(e, t, a, 1), !i)) return;
                e.speed = Math.max(e.speed, 1.2 * e.length);
                let s = 4 * f(1.3);
                (n.length < 6 && n.push([e.rows[s], e.rows[s + 1], 7, 1.6]),
                  x(t, a, 1.8 * e.length, 0.6, e));
              },
              disturb: x,
              resize: function (e, t) {
                let n = e / (a || e),
                  s = t / (i || t);
                for (let o of ((a = e), (i = t), d)) {
                  ((o.x *= n), (o.y *= s));
                  for (let e = 0; e < 22; e++)
                    ((o.spine[2 * e] *= n), (o.spine[2 * e + 1] *= s));
                  for (let e = 0; e < 160; e++)
                    ((o.trail[2 * e] *= n), (o.trail[2 * e + 1] *= s));
                  let t = (o.size * e) / o.length;
                  ((o.length *= t), (o.cruise *= t), (o.speed *= t), m(o));
                }
              },
            };
          })(i, n),
          p = T(t, h.count);
        if (!p) {
          e.dataset.fallback = "";
          return;
        }
        let m = window.matchMedia("(prefers-reduced-motion: reduce)"),
          v = 0,
          x = 0,
          g = 40,
          y = !1,
          b = 0,
          w = 2,
          _ = () => Math.min(window.devicePixelRatio || 1, w),
          k = 150,
          j = [],
          z = 0,
          M = 0,
          N = 0,
          E = 0,
          L = !1,
          R = (e) => {
            ((w = e), p?.resize(i, n, _()), (k = 60));
          },
          C = () =>
            null !== p &&
            y &&
            !document.hidden &&
            (!m.matches || performance.now() < b),
          S = (e) => {
            if (((v = 0), !p || !C())) {
              x = 0;
              return;
            }
            let t = x ? Math.min((e - x) / 1e3, 0.05) : 1 / 60;
            (x
              ? ((e) => {
                  if (L) return;
                  if (k > 0) return k--;
                  if ((j.push(e), j.length < 90)) return;
                  let t = j.sort((e, t) => e - t)[j.length >> 1];
                  j.length = 0;
                  let a = _(),
                    i = t <= 22;
                  if (!z) {
                    if (i || a <= 1) return;
                    ((z = N = a), (M = t), R(1));
                    return;
                  }
                  i ? (E = a) : (N = a);
                  let n = 0.25 * Math.round((N + E) / 2 / 0.25);
                  if (E && n > E && n < N) return R(n);
                  (E ? R(E) : t > 0.8 * M && R(z), (L = !0));
                })(e - x)
              : ((k = Math.max(k, 60)), (j.length = 0)),
              (x = e),
              (g += t),
              h.update(t, g));
            let a = Math.min(12, Math.max(1, Math.ceil(300 * t - 0.01)));
            for (let e = 1; e <= a; e++)
              (h.emitRipples(g - t + (t * e) / a, e / a, t / a, p),
                p.stepRipples(t / a));
            (h.writeVertices(p.fishVertices),
              p.render(g),
              (v = requestAnimationFrame(S)));
          },
          A = () => {
            !v && C() && (v = requestAnimationFrame(S));
          },
          F = () => {
            ((i = e.clientWidth),
              (n = e.clientHeight),
              p &&
                i &&
                n &&
                (h.resize(i, n),
                p.resize(i, n, _()),
                !v && p && (h.writeVertices(p.fishVertices), p.render(g))));
          },
          q = () => {
            ((b = performance.now() + 4e3), A());
          },
          B = (e) => {
            let a = t.getBoundingClientRect();
            return [
              ((e.clientX - a.left) / a.width) * i,
              ((e.clientY - a.top) / a.height) * n,
            ];
          },
          P = null,
          D = (e) => {
            if (!p || e.button > 0) return;
            let [t, a] = B(e),
              n = h.hitTest(t, a);
            (n
              ? (h.scare(n, t, a), p.splash(t, a, 7, 1.4))
              : (p.splash(t, a, 9, 2.6),
                p.drop(t, a, 3, 0.5),
                h.disturb(t, a, 0.3 * i, 0.45)),
              (P = [t, a]),
              q());
          },
          I = (e) => {
            if (!p || !P) return;
            let [t, a] = B(e);
            8 > Math.hypot(t - P[0], a - P[1]) ||
              (p.splash(t, a, 6, 0.9),
              h.disturb(t, a, 0.2 * i, 0.3),
              (P = [t, a]),
              q());
          },
          O = () => {
            P = null;
          },
          U = (e) => {
            (e.preventDefault(), cancelAnimationFrame(v), (v = 0), (p = null));
          },
          H = () => {
            ((p = T(t, h.count)), F(), A());
          },
          V = new ResizeObserver(F);
        V.observe(e);
        let G = new IntersectionObserver(
          ([e]) => {
            ((y = e.isIntersecting), A());
          },
          { rootMargin: "200px" },
        );
        return (
          G.observe(e),
          F(),
          t.addEventListener("pointerdown", D),
          window.addEventListener("pointermove", I),
          window.addEventListener("pointerup", O),
          window.addEventListener("pointercancel", O),
          t.addEventListener("webglcontextlost", U),
          t.addEventListener("webglcontextrestored", H),
          document.addEventListener("visibilitychange", A),
          m.addEventListener("change", A),
          () => {
            (cancelAnimationFrame(v),
              V.disconnect(),
              G.disconnect(),
              t.removeEventListener("pointerdown", D),
              window.removeEventListener("pointermove", I),
              window.removeEventListener("pointerup", O),
              window.removeEventListener("pointercancel", O),
              t.removeEventListener("webglcontextlost", U),
              t.removeEventListener("webglcontextrestored", H),
              document.removeEventListener("visibilitychange", A),
              m.removeEventListener("change", A),
              p?.dispose());
          }
        );
      }, []),
      (0, t.jsx)("div", {
        ref: a,
        className: (0, n.cn)("n1fj o2rm r4gv jd6z o257", e),
        children: (0, t.jsx)("canvas", {
          ref: d,
          role: "img",
          "aria-label":
            "Koi swimming in a sunlit pond. Tap the water to make ripples, or tap a fish to scare it.",
          className: "p4q3 ih2j af14 deu9 gm2a",
        }),
      })
    );
  }
  var B = e.i(1382);
  e.s(
    [
      "PondSection",
      0,
      function () {
        return (0, t.jsx)(a.motion.section, {
          className: "vze0 lo7r",
          ...(0, B.useReveal)(B.SLOT.pond, "hero"),
          children: (0, t.jsx)(q, {}),
        });
      },
    ],
    49689,
  );
};
export default originalPondModule;
