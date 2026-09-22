export interface FishPoolOptions {
  /** Number of koi. Values are clamped between 1 and 4. Default: 4. */
  fishCount?: number;
  /** Maximum device-pixel ratio used by the renderer. Default: 2. */
  pixelRatio?: number;
  /** Enables pointer and touch interaction. Default: true. */
  interactive?: boolean;
  /** Starts the pond in a paused state. Default: false. */
  paused?: boolean;
  /** Seed used to create repeatable fish colors and starting positions. */
  seed?: number;
  /** Accessible name applied to canvases created by the library. */
  ariaLabel?: string;
  /** Called when WebGL2 is unavailable and the 2D fallback is used. */
  onFallback?: (reason: string) => void;
}

export interface RippleOptions {
  /** Radius in CSS pixels. */
  radius?: number;
  /** Signed impulse strength. Typical values are 0.2–2.0. */
  strength?: number;
}

export interface FishPoolStats {
  renderer: "webgl2" | "canvas2d";
  fishCount: number;
  width: number;
  height: number;
  pixelRatio: number;
  running: boolean;
}

export type FishPoolTarget = HTMLCanvasElement | HTMLElement | string;
