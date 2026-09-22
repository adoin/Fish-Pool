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
const rendererCore = source.slice(coreStart, componentStart).replace(/^  /gm, "");
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
