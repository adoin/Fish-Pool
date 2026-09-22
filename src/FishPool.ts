import { createFish, hitTestFish, scareFish, updateFish, type FishState, type Point } from "./fish";
import { createOriginalFishSimulation, createOriginalRenderer } from "./original-engine";
import { CanvasPondRenderer } from "./renderer";
import type { FishPoolOptions, FishPoolStats, FishPoolTarget, RippleOptions } from "./types";

const DEFAULT_ARIA_LABEL =
  "Interactive koi pond. Tap the water to make ripples, or tap a fish to scare it.";

interface ResolvedOptions {
  fishCount: number;
  pixelRatio: number;
  interactive: boolean;
  paused: boolean;
  seed: number;
  ariaLabel: string;
  onFallback?: (reason: string) => void;
}

interface OriginalRenderer {
  fishVertices: Float32Array;
  resize(width: number, height: number, pixelRatio: number): void;
  drop(x: number, y: number, radius: number, strength: number): void;
  splash(x: number, y: number, radius: number, strength: number): boolean;
  stepRipples(dt: number): void;
  render(time: number): void;
  dispose(): void;
}

interface OriginalSimulation {
  count: number;
  update(dt: number, time: number): void;
  writeVertices(target: Float32Array): void;
  emitRipples(
    time: number,
    interpolation: number,
    dt: number,
    renderer: OriginalRenderer,
  ): void;
  hitTest(x: number, y: number): unknown | null;
  scare(fish: unknown, x: number, y: number): void;
  disturb(x: number, y: number, radius: number, strength: number): void;
  resize(width: number, height: number): void;
}

function resolveTarget(target: FishPoolTarget): HTMLElement | HTMLCanvasElement {
  if (typeof target === "string") {
    const element = document.querySelector<HTMLElement>(target);
    if (!element) throw new Error(`FishPool target not found: ${target}`);
    return element;
  }
  return target;
}

function resolveOptions(options: FishPoolOptions): ResolvedOptions {
  return {
    fishCount: Math.max(1, Math.min(4, Math.round(options.fishCount ?? 4))),
    pixelRatio: Math.max(0.5, Math.min(3, options.pixelRatio ?? 2)),
    interactive: options.interactive ?? true,
    paused: options.paused ?? false,
    seed: Math.floor(options.seed ?? 23847),
    ariaLabel: options.ariaLabel ?? DEFAULT_ARIA_LABEL,
    onFallback: options.onFallback,
  };
}

export class FishPool {
  canvas: HTMLCanvasElement;
  readonly element: HTMLElement | HTMLCanvasElement;
  private readonly ownsCanvas: boolean;
  private options: ResolvedOptions;
  private originalRenderer: OriginalRenderer | null = null;
  private originalSimulation: OriginalSimulation | null = null;
  private fallbackRenderer: CanvasPondRenderer | null = null;
  private fallbackFish: FishState[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private readonly motionQuery: MediaQueryList;
  private animationFrame = 0;
  private lastFrame = 0;
  private elapsed = 40;
  private width = 1;
  private height = 1;
  private visible = true;
  private running = false;
  private destroyed = false;
  private pointerId: number | null = null;
  private lastPointer: Point | null = null;
  private activeUntil = 0;
  private renderPixelRatioCap: number;
  private adaptationWarmup = 150;
  private readonly frameSamples: number[] = [];
  private initialMeasuredRatio = 0;
  private initialMedianMs = 0;
  private fastRatio = 0;
  private slowRatio = 0;
  private adaptationLocked = false;

  constructor(target: FishPoolTarget, options: FishPoolOptions = {}) {
    if (typeof window === "undefined" || typeof document === "undefined") {
      throw new Error("FishPool must be created in a browser environment.");
    }

    this.element = resolveTarget(target);
    this.options = resolveOptions(options);
    this.renderPixelRatioCap = this.options.pixelRatio;
    this.ownsCanvas = !(this.element instanceof HTMLCanvasElement);
    this.canvas =
      this.element instanceof HTMLCanvasElement ? this.element : document.createElement("canvas");
    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (this.ownsCanvas) this.element.append(this.canvas);
    this.prepareCanvas();
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    this.initializeEngine();
    this.bindObservers();
    this.bindInteraction();
    this.resize();

    if (!this.options.paused) this.start();
  }

  start(): void {
    if (this.destroyed || this.running) return;
    this.running = true;
    this.lastFrame = 0;
    this.requestFrame();
  }

  stop(): void {
    this.running = false;
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = 0;
    this.lastFrame = 0;
  }

  /** Add the same paired height/velocity impulse used by the original pond. */
  addRipple(x: number, y: number, options: RippleOptions = {}): void {
    if (this.destroyed) return;
    const radius = options.radius ?? 9;
    const strength = options.strength ?? 1.2;
    if (this.originalRenderer) {
      this.originalRenderer.splash(x, y, radius, strength);
      this.originalRenderer.drop(x, y, 3, strength * 0.2);
    } else {
      this.fallbackRenderer?.ripple(x, y, radius, strength);
    }
    this.wakeForInteraction();
  }

  /** Run the original centerline hit test and flee response. */
  scareAt(x: number, y: number): boolean {
    if (this.destroyed) return false;
    if (this.originalSimulation && this.originalRenderer) {
      const fish = this.originalSimulation.hitTest(x, y);
      if (!fish) return false;
      this.originalSimulation.scare(fish, x, y);
      this.originalRenderer.splash(x, y, 7, 1.4);
      this.wakeForInteraction();
      return true;
    }

    const point = { x, y };
    const fish = hitTestFish(this.fallbackFish, point, this.width, this.height);
    if (!fish) return false;
    scareFish(fish, point, this.width, this.height);
    this.fallbackRenderer?.ripple(x, y, Math.max(20, fish.length * 0.18), 1.45);
    this.wakeForInteraction();
    return true;
  }

  setFishCount(count: number): void {
    const nextCount = Math.max(1, Math.min(4, Math.round(count)));
    if (nextCount === this.options.fishCount) return;
    this.options.fishCount = nextCount;
    const wasRunning = this.running;
    this.stop();
    this.originalRenderer?.dispose();
    this.originalRenderer = null;
    this.originalSimulation = null;
    this.fallbackRenderer?.destroy();
    this.fallbackRenderer = null;
    this.initializeEngine();
    this.resize();
    if (wasRunning) this.start();
  }

  resize(): void {
    if (this.destroyed) return;
    const rect = this.canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, rect.width);
    const nextHeight = Math.max(1, rect.height);
    this.originalSimulation?.resize(nextWidth, nextHeight);
    this.width = nextWidth;
    this.height = nextHeight;
    const ratio = Math.min(this.renderPixelRatioCap, window.devicePixelRatio || 1);
    this.originalRenderer?.resize(this.width, this.height, ratio);
    this.fallbackRenderer?.resize(this.width, this.height, ratio);
    this.requestFrame();
  }

  getStats(): FishPoolStats {
    return {
      renderer: this.originalRenderer ? "webgl2" : "canvas2d",
      fishCount: this.originalSimulation?.count ?? this.fallbackFish.length,
      width: this.width,
      height: this.height,
      pixelRatio: Math.min(this.renderPixelRatioCap, window.devicePixelRatio || 1),
      running: this.running,
    };
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stop();
    this.resizeObserver?.disconnect();
    this.intersectionObserver?.disconnect();
    this.unbindInteraction();
    this.motionQuery.removeEventListener("change", this.handleMotionPreference);
    this.originalRenderer?.dispose();
    this.fallbackRenderer?.destroy();
    if (this.ownsCanvas) this.canvas.remove();
  }

  private initializeEngine(): void {
    this.originalSimulation = createOriginalFishSimulation(
      this.width,
      this.height,
      this.options.fishCount,
    ) as OriginalSimulation;
    this.originalRenderer = createOriginalRenderer(
      this.canvas,
      this.originalSimulation.count,
    ) as OriginalRenderer | null;

    if (this.originalRenderer) return;
    const reason = "WebGL2 or EXT_color_buffer_float is unavailable.";
    this.options.onFallback?.(reason);
    this.originalSimulation = null;
    if (!this.canvas.getContext("2d")) {
      const replacement = document.createElement("canvas");
      replacement.className = this.canvas.className;
      replacement.style.cssText = this.canvas.style.cssText;
      replacement.setAttribute("role", this.canvas.getAttribute("role") ?? "img");
      replacement.setAttribute("aria-label", this.canvas.getAttribute("aria-label") ?? this.options.ariaLabel);
      this.canvas.replaceWith(replacement);
      this.canvas = replacement;
      this.prepareCanvas();
    }
    this.fallbackFish = createFish(this.options.fishCount, this.options.seed);
    this.fallbackRenderer = new CanvasPondRenderer(this.canvas);
  }

  private prepareCanvas(): void {
    this.canvas.setAttribute("role", "img");
    this.canvas.setAttribute("aria-label", this.options.ariaLabel);
    this.canvas.style.display = "block";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.touchAction = this.options.interactive ? "pan-y" : "auto";
    this.canvas.style.userSelect = "none";
  }

  private bindObservers(): void {
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.canvas);
    this.intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.visible = entry?.isIntersecting ?? true;
        if (this.visible) this.requestFrame();
      },
      { rootMargin: "200px" },
    );
    this.intersectionObserver.observe(this.canvas);
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.motionQuery.addEventListener("change", this.handleMotionPreference);
  }

  private bindInteraction(): void {
    if (!this.options.interactive) return;
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    window.addEventListener("pointermove", this.handlePointerMove);
    window.addEventListener("pointerup", this.handlePointerUp);
    window.addEventListener("pointercancel", this.handlePointerUp);
  }

  private unbindInteraction(): void {
    document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
    window.removeEventListener("pointermove", this.handlePointerMove);
    window.removeEventListener("pointerup", this.handlePointerUp);
    window.removeEventListener("pointercancel", this.handlePointerUp);
  }

  private readonly handleVisibilityChange = (): void => this.requestFrame();
  private readonly handleMotionPreference = (): void => this.requestFrame();

  private readonly handlePointerDown = (event: PointerEvent): void => {
    if (event.button > 0) return;
    const point = this.localPoint(event);
    if (this.originalSimulation && this.originalRenderer) {
      const fish = this.originalSimulation.hitTest(point.x, point.y);
      if (fish) {
        this.originalSimulation.scare(fish, point.x, point.y);
        this.originalRenderer.splash(point.x, point.y, 7, 1.4);
      } else {
        this.originalRenderer.splash(point.x, point.y, 9, 2.6);
        this.originalRenderer.drop(point.x, point.y, 3, 0.5);
        this.originalSimulation.disturb(point.x, point.y, 0.3 * this.width, 0.45);
      }
    } else if (!this.scareAt(point.x, point.y)) {
      this.fallbackRenderer?.ripple(point.x, point.y, 34, 1.12);
    }
    this.pointerId = event.pointerId;
    this.lastPointer = point;
    this.wakeForInteraction();
  };

  private readonly handlePointerMove = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId || !this.lastPointer) return;
    const point = this.localPoint(event);
    if (Math.hypot(point.x - this.lastPointer.x, point.y - this.lastPointer.y) < 8) return;
    if (this.originalSimulation && this.originalRenderer) {
      this.originalRenderer.splash(point.x, point.y, 6, 0.9);
      this.originalSimulation.disturb(point.x, point.y, 0.2 * this.width, 0.3);
    } else {
      this.fallbackRenderer?.ripple(point.x, point.y, 20, 0.42);
    }
    this.lastPointer = point;
    this.wakeForInteraction();
  };

  private readonly handlePointerUp = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointerId) return;
    this.pointerId = null;
    this.lastPointer = null;
  };

  private localPoint(event: PointerEvent): Point {
    const rect = this.canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private wakeForInteraction(): void {
    this.activeUntil = performance.now() + 4000;
    this.requestFrame();
  }

  private canAnimate(): boolean {
    return (
      this.running &&
      this.visible &&
      !document.hidden &&
      (!this.motionQuery.matches || performance.now() < this.activeUntil)
    );
  }

  private requestFrame(): void {
    if (!this.canAnimate() || this.animationFrame) return;
    this.animationFrame = requestAnimationFrame(this.frame);
  }

  private readonly frame = (timestamp: number): void => {
    this.animationFrame = 0;
    if (!this.canAnimate() || this.destroyed) {
      this.lastFrame = 0;
      return;
    }
    const dt = this.lastFrame ? Math.min((timestamp - this.lastFrame) / 1000, 0.05) : 1 / 60;
    if (this.lastFrame) this.sampleAdaptiveResolution(timestamp - this.lastFrame);
    this.lastFrame = timestamp;
    this.elapsed += dt;

    if (this.originalSimulation && this.originalRenderer) {
      this.originalSimulation.update(dt, this.elapsed);
      const substeps = Math.min(12, Math.max(1, Math.ceil(300 * dt - 0.01)));
      for (let step = 1; step <= substeps; step += 1) {
        this.originalSimulation.emitRipples(
          this.elapsed - dt + (dt * step) / substeps,
          step / substeps,
          dt / substeps,
          this.originalRenderer,
        );
        this.originalRenderer.stepRipples(dt / substeps);
      }
      this.originalSimulation.writeVertices(this.originalRenderer.fishVertices);
      this.originalRenderer.render(this.elapsed);
    } else if (this.fallbackRenderer) {
      updateFish({
        fish: this.fallbackFish,
        width: this.width,
        height: this.height,
        time: this.elapsed,
        dt,
        onWake: (x, y, radius, strength) => {
          this.fallbackRenderer?.ripple(x * this.width, (1 - y) * this.height, radius, strength);
        },
      });
      this.fallbackRenderer.render(this.elapsed, dt, this.fallbackFish);
    }
    this.requestFrame();
  };

  private sampleAdaptiveResolution(frameMs: number): void {
    if (this.adaptationLocked) return;
    if (this.adaptationWarmup > 0) {
      this.adaptationWarmup -= 1;
      return;
    }
    this.frameSamples.push(frameMs);
    if (this.frameSamples.length < 90) return;

    this.frameSamples.sort((a, b) => a - b);
    const median = this.frameSamples[this.frameSamples.length >> 1] ?? frameMs;
    this.frameSamples.length = 0;
    const currentRatio = Math.min(this.renderPixelRatioCap, window.devicePixelRatio || 1);
    const isFast = median <= 22;

    if (!this.initialMeasuredRatio) {
      if (isFast || currentRatio <= 1) return;
      this.initialMeasuredRatio = currentRatio;
      this.fastRatio = currentRatio;
      this.initialMedianMs = median;
      this.setRenderPixelRatioCap(1);
      return;
    }

    if (isFast) this.slowRatio = currentRatio;
    else this.fastRatio = currentRatio;
    const nextRatio = 0.25 * Math.round((this.fastRatio + this.slowRatio) / 2 / 0.25);
    if (this.slowRatio && nextRatio > this.slowRatio && nextRatio < this.fastRatio) {
      this.setRenderPixelRatioCap(nextRatio);
      return;
    }

    if (this.slowRatio) this.setRenderPixelRatioCap(this.slowRatio);
    else if (median > 0.8 * this.initialMedianMs) this.setRenderPixelRatioCap(this.initialMeasuredRatio);
    this.adaptationLocked = true;
  }

  private setRenderPixelRatioCap(value: number): void {
    this.renderPixelRatioCap = value;
    const ratio = Math.min(value, window.devicePixelRatio || 1);
    this.originalRenderer?.resize(this.width, this.height, ratio);
    this.fallbackRenderer?.resize(this.width, this.height, ratio);
    this.adaptationWarmup = 60;
  }
}
