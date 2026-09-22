import type { FishState } from "./fish";
import { FULLSCREEN_VERTEX, POND_FRAGMENT, WATER_STEP_FRAGMENT } from "./shaders";

export interface PondRenderer {
  readonly kind: "webgl2" | "canvas2d";
  resize(width: number, height: number, pixelRatio: number): void;
  ripple(x: number, y: number, radius: number, strength: number): void;
  render(time: number, dt: number, fish: FishState[]): void;
  destroy(): void;
}

interface ProgramInfo {
  program: WebGLProgram;
  uniform: (name: string) => WebGLUniformLocation | null;
}

interface SimulationTarget {
  texture: WebGLTexture;
  framebuffer: WebGLFramebuffer;
}

interface Impulse {
  x: number;
  y: number;
  radius: number;
  strength: number;
}

function compileProgram(
  gl: WebGL2RenderingContext,
  vertexSource: string,
  fragmentSource: string,
): ProgramInfo {
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create a WebGL program.");

  const shaders: WebGLShader[] = [];
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertexSource],
    [gl.FRAGMENT_SHADER, fragmentSource],
  ] as const) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Unable to create a WebGL shader.");
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(shader) ?? "Unknown shader compilation error.";
      gl.deleteShader(shader);
      throw new Error(log);
    }
    gl.attachShader(program, shader);
    shaders.push(shader);
  }

  gl.linkProgram(program);
  for (const shader of shaders) {
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
  }
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program) ?? "Unknown WebGL link error.";
    gl.deleteProgram(program);
    throw new Error(log);
  }

  const locations = new Map<string, WebGLUniformLocation | null>();
  return {
    program,
    uniform(name: string) {
      if (!locations.has(name)) locations.set(name, gl.getUniformLocation(program, name));
      return locations.get(name) ?? null;
    },
  };
}

function createTarget(gl: WebGL2RenderingContext, width: number, height: number): SimulationTarget {
  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) throw new Error("Unable to allocate the water simulation target.");

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (status !== gl.FRAMEBUFFER_COMPLETE) {
    gl.deleteTexture(texture);
    gl.deleteFramebuffer(framebuffer);
    throw new Error(`Incomplete water framebuffer: 0x${status.toString(16)}`);
  }

  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  return { texture, framebuffer };
}

export class WebGLPondRenderer implements PondRenderer {
  readonly kind = "webgl2" as const;
  private readonly gl: WebGL2RenderingContext;
  private readonly stepProgram: ProgramInfo;
  private readonly pondProgram: ProgramInfo;
  private readonly vertexArray: WebGLVertexArrayObject;
  private targets: [SimulationTarget, SimulationTarget] | null = null;
  private readIndex = 0;
  private simWidth = 0;
  private simHeight = 0;
  private width = 1;
  private height = 1;
  private pixelRatio = 1;
  private impulses: Impulse[] = [];
  private readonly impulseData = new Float32Array(16 * 4);
  private readonly fishA = new Float32Array(8 * 4);
  private readonly fishB = new Float32Array(8 * 4);
  private disposed = false;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 is unavailable.");
    if (!gl.getExtension("EXT_color_buffer_float")) {
      throw new Error("EXT_color_buffer_float is unavailable.");
    }

    this.gl = gl;
    this.stepProgram = compileProgram(gl, FULLSCREEN_VERTEX, WATER_STEP_FRAGMENT);
    this.pondProgram = compileProgram(gl, FULLSCREEN_VERTEX, POND_FRAGMENT);
    const vertexArray = gl.createVertexArray();
    if (!vertexArray) throw new Error("Unable to create a vertex array.");
    this.vertexArray = vertexArray;
    gl.bindVertexArray(vertexArray);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
  }

  resize(width: number, height: number, pixelRatio: number): void {
    if (this.disposed) return;
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.pixelRatio = Math.max(0.5, pixelRatio);

    const drawingWidth = Math.max(1, Math.round(this.width * this.pixelRatio));
    const drawingHeight = Math.max(1, Math.round(this.height * this.pixelRatio));
    if (this.canvas.width !== drawingWidth || this.canvas.height !== drawingHeight) {
      this.canvas.width = drawingWidth;
      this.canvas.height = drawingHeight;
    }

    const scale = Math.min(0.52, 360 / this.width, 240 / this.height);
    const nextSimWidth = Math.max(96, Math.round(this.width * scale));
    const nextSimHeight = Math.max(64, Math.round(this.height * scale));
    if (nextSimWidth !== this.simWidth || nextSimHeight !== this.simHeight) {
      this.releaseTargets();
      this.simWidth = nextSimWidth;
      this.simHeight = nextSimHeight;
      this.targets = [
        createTarget(this.gl, this.simWidth, this.simHeight),
        createTarget(this.gl, this.simWidth, this.simHeight),
      ];
      this.readIndex = 0;
    }
  }

  ripple(x: number, y: number, radius: number, strength: number): void {
    if (this.impulses.length >= 16) this.impulses.shift();
    this.impulses.push({
      x: Math.min(1, Math.max(0, x / this.width)),
      y: Math.min(1, Math.max(0, 1 - y / this.height)),
      radius: Math.max(2, radius) / this.height,
      strength,
    });
  }

  render(time: number, dt: number, fish: FishState[]): void {
    if (this.disposed || !this.targets) return;
    const frameDt = Math.min(Math.max(dt, 1 / 240), 1 / 24);
    const substeps = frameDt > 1 / 45 ? 3 : 2;
    for (let step = 0; step < substeps; step += 1) {
      this.stepWater(frameDt / substeps, step === 0);
    }
    this.drawPond(time, fish);
  }

  destroy(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.releaseTargets();
    this.gl.deleteProgram(this.stepProgram.program);
    this.gl.deleteProgram(this.pondProgram.program);
    this.gl.deleteVertexArray(this.vertexArray);
  }

  private stepWater(dt: number, applyImpulses: boolean): void {
    const gl = this.gl;
    const targets = this.targets;
    if (!targets) return;
    const read = targets[this.readIndex] ?? targets[0];
    const write = targets[1 - this.readIndex] ?? targets[1];
    gl.bindFramebuffer(gl.FRAMEBUFFER, write.framebuffer);
    gl.viewport(0, 0, this.simWidth, this.simHeight);
    gl.useProgram(this.stepProgram.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, read.texture);
    gl.uniform1i(this.stepProgram.uniform("u_state"), 0);
    gl.uniform2f(this.stepProgram.uniform("u_texel"), 1 / this.simWidth, 1 / this.simHeight);
    gl.uniform1f(this.stepProgram.uniform("u_dt"), dt);
    gl.uniform1f(this.stepProgram.uniform("u_aspect"), this.width / this.height);

    const active = applyImpulses ? this.impulses : [];
    this.impulseData.fill(0);
    for (let index = 0; index < active.length; index += 1) {
      const impulse = active[index];
      if (!impulse) continue;
      const offset = index * 4;
      this.impulseData[offset] = impulse.x;
      this.impulseData[offset + 1] = impulse.y;
      this.impulseData[offset + 2] = impulse.radius;
      this.impulseData[offset + 3] = impulse.strength;
    }
    gl.uniform1i(this.stepProgram.uniform("u_impulseCount"), active.length);
    gl.uniform4fv(this.stepProgram.uniform("u_impulses[0]"), this.impulseData);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    this.readIndex = 1 - this.readIndex;
    if (applyImpulses) this.impulses.length = 0;
  }

  private drawPond(time: number, fish: FishState[]): void {
    const gl = this.gl;
    const targets = this.targets;
    if (!targets) return;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.pondProgram.program);
    gl.activeTexture(gl.TEXTURE0);
    const currentTarget = targets[this.readIndex] ?? targets[0];
    gl.bindTexture(gl.TEXTURE_2D, currentTarget.texture);
    gl.uniform1i(this.pondProgram.uniform("u_state"), 0);
    gl.uniform2f(this.pondProgram.uniform("u_stateTexel"), 1 / this.simWidth, 1 / this.simHeight);
    gl.uniform2f(this.pondProgram.uniform("u_resolution"), this.width, this.height);
    gl.uniform1f(this.pondProgram.uniform("u_time"), time);

    this.fishA.fill(0);
    this.fishB.fill(0);
    const count = Math.min(fish.length, 8);
    for (let index = 0; index < count; index += 1) {
      const item = fish[index];
      if (!item) continue;
      const offset = index * 4;
      const sizeScale = Math.min(1.18, Math.max(0.72, this.height / 430));
      this.fishA[offset] = item.x;
      this.fishA[offset + 1] = item.y;
      this.fishA[offset + 2] = item.angle;
      this.fishA[offset + 3] = item.length * sizeScale;
      this.fishB[offset] = item.phase;
      this.fishB[offset + 1] = item.kind;
      this.fishB[offset + 2] = item.fear;
      this.fishB[offset + 3] = item.seed;
    }
    gl.uniform1i(this.pondProgram.uniform("u_fishCount"), count);
    gl.uniform4fv(this.pondProgram.uniform("u_fishA[0]"), this.fishA);
    gl.uniform4fv(this.pondProgram.uniform("u_fishB[0]"), this.fishB);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  private releaseTargets(): void {
    if (!this.targets) return;
    for (const target of this.targets) {
      this.gl.deleteTexture(target.texture);
      this.gl.deleteFramebuffer(target.framebuffer);
    }
    this.targets = null;
  }
}

interface CanvasRipple extends Impulse {
  age: number;
}

export class CanvasPondRenderer implements PondRenderer {
  readonly kind = "canvas2d" as const;
  private readonly context: CanvasRenderingContext2D;
  private width = 1;
  private height = 1;
  private pixelRatio = 1;
  private ripples: CanvasRipple[] = [];
  private pebbles: Array<{
    x: number;
    y: number;
    size: number;
    angle: number;
    seed: number;
    kind: number;
  }> = [];

  constructor(private readonly canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) throw new Error("Canvas 2D is unavailable.");
    this.context = context;
  }

  resize(width: number, height: number, pixelRatio: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.pixelRatio = Math.max(0.5, pixelRatio);
    this.canvas.width = Math.round(this.width * this.pixelRatio);
    this.canvas.height = Math.round(this.height * this.pixelRatio);
    this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  ripple(x: number, y: number, radius: number, strength: number): void {
    this.ripples.push({ x, y, radius, strength, age: 0 });
    if (this.ripples.length > 24) this.ripples.shift();
  }

  setPebbles(
    pebbles: readonly {
      x: number;
      y: number;
      size: number;
      angle: number;
      seed: number;
      kind: number;
    }[],
  ): void {
    this.pebbles = pebbles.map((pebble) => ({ ...pebble }));
  }

  render(time: number, dt: number, fish: FishState[]): void {
    const context = this.context;
    const gradient = context.createLinearGradient(0, 0, this.width, this.height);
    gradient.addColorStop(0, "#315e45");
    gradient.addColorStop(0.5, "#174332");
    gradient.addColorStop(1, "#2d6045");
    context.fillStyle = gradient;
    context.fillRect(0, 0, this.width, this.height);

    context.globalAlpha = 0.23;
    context.strokeStyle = "#d9f2b5";
    context.lineWidth = 2;
    for (let index = 0; index < 24; index += 1) {
      const x = ((index * 97) % 101) / 101 * this.width;
      const y = ((index * 53) % 103) / 103 * this.height;
      const radius = 28 + 13 * Math.sin(time * 0.7 + index);
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.stroke();
    }
    context.globalAlpha = 1;

    for (const pebble of this.pebbles) {
      context.save();
      context.translate(pebble.x, pebble.y);
      context.rotate(pebble.angle);
      context.shadowColor = "rgba(4, 18, 10, 0.38)";
      context.shadowBlur = Math.max(2, pebble.size * 0.55);
      context.shadowOffsetX = pebble.size * 0.28;
      context.shadowOffsetY = pebble.size * 0.35;
      const lightness = 29 + pebble.kind * 7 + pebble.seed * 8;
      context.fillStyle = `hsl(68 12% ${lightness}%)`;
      context.beginPath();
      context.ellipse(0, 0, pebble.size, pebble.size * (0.68 + pebble.seed * 0.12), 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    for (const item of fish) this.drawFish(item, time);

    for (const ripple of this.ripples) {
      ripple.age += dt;
      const progress = ripple.age / 1.5;
      context.globalAlpha = Math.max(0, 1 - progress) * Math.min(1, ripple.strength);
      context.strokeStyle = "#e9ffd0";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(ripple.x, ripple.y, ripple.radius + progress * 90, 0, Math.PI * 2);
      context.stroke();
    }
    this.ripples = this.ripples.filter((ripple) => ripple.age < 1.5);
    context.globalAlpha = 1;
  }

  destroy(): void {
    this.ripples.length = 0;
  }

  private drawFish(fish: FishState, time: number): void {
    const context = this.context;
    const x = fish.x * this.width;
    const y = this.height - fish.y * this.height;
    const length = fish.length * Math.min(1.18, Math.max(0.72, this.height / 430));
    context.save();
    context.translate(x, y);
    context.rotate(-fish.angle);
    context.shadowColor = "rgba(0, 20, 10, 0.45)";
    context.shadowBlur = 13;
    context.shadowOffsetX = 7;
    context.shadowOffsetY = 9;
    context.fillStyle = fish.kind % 2 === 0 ? "#f2eee0" : "#dfa327";
    context.beginPath();
    context.ellipse(0, 0, length * 0.48, length * 0.19, 0, 0, Math.PI * 2);
    context.fill();
    context.shadowColor = "transparent";
    context.fillStyle = fish.kind === 1 ? "#1f2a20" : "#e64b1f";
    context.beginPath();
    context.ellipse(length * 0.13, 0, length * 0.22, length * 0.18, 0, 0, Math.PI * 2);
    context.fill();
    const beat = Math.sin(time * 4 + fish.phase) * 0.18;
    context.rotate(beat);
    context.fillStyle = "rgba(239, 202, 149, 0.8)";
    context.beginPath();
    context.moveTo(-length * 0.43, 0);
    context.lineTo(-length * 0.72, -length * 0.25);
    context.lineTo(-length * 0.68, length * 0.25);
    context.closePath();
    context.fill();
    context.restore();
  }
}
