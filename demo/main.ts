import { FishPool } from "../src/index";

const stage = document.querySelector<HTMLElement>("#pond");
const rendererLabel = document.querySelector<HTMLElement>("#renderer");
const countInput = document.querySelector<HTMLInputElement>("#fish-count");

if (!stage || !rendererLabel || !countInput) {
  throw new Error("Demo shell is incomplete.");
}

const pond = new FishPool(stage, {
  fishCount: Number(countInput.value),
  seed: 42069,
  onFallback(reason) {
    console.warn(`Using Canvas 2D fallback: ${reason}`);
  },
});

rendererLabel.textContent = pond.getStats().renderer.toUpperCase();
countInput.addEventListener("input", () => pond.setFishCount(Number(countInput.value)));

document.querySelector<HTMLButtonElement>("#ripple")?.addEventListener("click", () => {
  const stats = pond.getStats();
  pond.addRipple(stats.width * 0.5, stats.height * 0.52, { radius: 42, strength: 1.5 });
});

window.addEventListener("beforeunload", () => pond.destroy());
