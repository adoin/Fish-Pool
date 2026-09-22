export { FishPool } from "./FishPool";
export type {
  FishPoolOptions,
  FishPoolStats,
  FishPoolTarget,
  PebbleDropOptions,
  PebbleSnapshot,
  PebbleState,
  RippleOptions,
} from "./types";

import { FishPool } from "./FishPool";
import type { FishPoolOptions, FishPoolTarget } from "./types";

/** Convenience factory equivalent to `new FishPool(target, options)`. */
export function createFishPool(target: FishPoolTarget, options?: FishPoolOptions): FishPool {
  return new FishPool(target, options);
}

export default FishPool;
