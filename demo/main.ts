import { FishPool } from "../src/index";

const stage = document.querySelector<HTMLElement>("#pond");
const rendererLabel = document.querySelector<HTMLElement>("#renderer");
const countInput = document.querySelector<HTMLInputElement>("#fish-count");
const pebbleCount = document.querySelector<HTMLElement>("#pebble-count");

if (!stage || !rendererLabel || !countInput || !pebbleCount) {
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
  pond.dropPebble();
});

function updatePebbleStatus(): void {
  const pebbles = pond.getPebbles();
  const active = [...pebbles].reverse().find((pebble) => pebble.state !== "settled");
  const count = pebbles.length;
  pebbleCount!.textContent = `${count} ${count === 1 ? "pebble" : "pebbles"}${active ? ` · ${active.state}` : ""}`;
  requestAnimationFrame(updatePebbleStatus);
}

updatePebbleStatus();

window.addEventListener("beforeunload", () => pond.destroy());
