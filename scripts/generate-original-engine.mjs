import { readFile, writeFile } from "node:fs/promises";

const source = await readFile("reference/original-pond.compiled.js", "utf8");
const coreStart = source.indexOf("  let s = 2 * Math.PI");
const componentStart = source.indexOf("  function q({ className: e })");
if (coreStart < 0 || componentStart < 0) {
  throw new Error("Could not find the standalone renderer core.");
}

const simulationStart = source.indexOf("function (e, t) {", componentStart);
if (simulationStart < 0) throw new Error("Could not find the fish simulation factory.");

function findFunctionEnd(text, functionStart) {
  const braceStart = text.indexOf("{", functionStart);
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = braceStart; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return index + 1;
    }
  }
  throw new Error("Unterminated fish simulation function.");
}

const simulationEnd = findFunctionEnd(source, simulationStart);
let rendererCore = source.slice(coreStart, componentStart).replace(/^  /gm, "");

// Extend the original fixed three-stone shader arrays with inactive slots. The
// slots are still rendered by the original stone shader and composition passes;
// only their state is new. Keeping this transform in the generator means the
// generated engine remains reproducible from the extracted upstream module.
const dynamicPebbleCapacity = 12;
const stoneListStart = rendererCore.indexOf("  d = [");
const plantListStart = rendererCore.indexOf("\n  h = [", stoneListStart);
const stoneListEnd = rendererCore.lastIndexOf("  ],", plantListStart);
if (stoneListStart < 0 || plantListStart < 0 || stoneListEnd < 0) {
  throw new Error("Could not locate the original stone definitions.");
}
const pebbleSlots = Array.from({ length: dynamicPebbleCapacity }, (_, index) => `    {
      x: -10,
      y: -10,
      length: 1,
      width: 1,
      height: 1,
      angle: 0,
      seed: ${((index + 1) / (dynamicPebbleCapacity + 1)).toFixed(6)},
      kind: ${index % 3},
      dynamic: true,
    },
`).join("");
rendererCore = `${rendererCore.slice(0, stoneListEnd)}${pebbleSlots}${rendererCore.slice(stoneListEnd)}`;

const extensionGuard = 'if (!m || !m.getExtension("EXT_color_buffer_float")) return null;';
rendererCore = rendererCore.replace(
  extensionGuard,
  `${extensionGuard}\n  const fixedStoneCount = 3;\n  const stoneDefinitions = d.map((stone) => ({ ...stone }));`,
);
rendererCore = rendererCore.replaceAll("d.flatMap", "stoneDefinitions.flatMap");
rendererCore = rendererCore.replaceAll("d.some", "stoneDefinitions.some");

const rendererReturn = "return {\n    fishVertices: q,";
rendererCore = rendererCore.replace(
  rendererReturn,
  `return {
    fishVertices: q,
    dynamicPebbleCapacity: ${dynamicPebbleCapacity},
    setDynamicPebbles: function (pebbles) {
      const width = X?.width ?? 1;
      const height = X?.height ?? 1;
      const unit = X?.unit ?? width / 540;
      for (let index = 0; index < ${dynamicPebbleCapacity}; index++) {
        const target = stoneDefinitions[fixedStoneCount + index];
        const pebble = pebbles[index];
        if (!pebble || pebble.state === "airborne") {
          Object.assign(target, { x: -10, y: -10, length: 1, width: 1, height: 1 });
          continue;
        }
        const baseSize = Math.max(1, pebble.size / Math.max(unit, 0.0001));
        Object.assign(target, {
          x: pebble.x / width,
          y: pebble.y / height,
          length: baseSize,
          width: baseSize * (0.72 + 0.12 * pebble.seed),
          height: baseSize * (0.38 + 0.12 * (1 - pebble.seed)),
          angle: pebble.angle,
          seed: pebble.seed,
          kind: pebble.kind,
        });
      }
      if (X) et([[X.floor, 0], [X.relief, 1]]);
    },`,
);
if (!rendererCore.includes(`dynamicPebbleCapacity: ${dynamicPebbleCapacity}`)) {
  throw new Error("Could not inject the dynamic pebble renderer extension.");
}

let simulationFactory = source.slice(simulationStart, simulationEnd);
simulationFactory = simulationFactory.replace(
  "function (e, t) {",
  "function (e: number, t: number, fishCount = 4) {",
);
simulationFactory = simulationFactory.replace(
  "d = o.map((a) => {",
  "d = o.slice(0, Math.max(1, Math.min(4, fishCount))).map((a) => {",
);

const output = `// @ts-nocheck
/**
 * Generated faithful engine port from reference/original-pond.compiled.js.
 * Do not hand-edit: run npm run extract:reference and npm run generate:engine.
 *
 * The original minified identifiers are intentionally retained here so every
 * operation can be compared mechanically with the shipped client module.
 */

${rendererCore}

export const createOriginalRenderer = T;
export const createOriginalFishSimulation = ${simulationFactory};
`;

await writeFile("src/original-engine.ts", output, "utf8");
console.log("Generated src/original-engine.ts from the extracted pond module.");
