import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

const site = "https://www.shwn.design";
const html = await (await fetch(`${site}/`)).text();
const chunkPaths = [...html.matchAll(/(?:src|href)="(?<path>\/_next\/static\/chunks\/[^\"]+\.js)"/g)]
  .map((match) => match.groups?.path)
  .filter(Boolean);

let chunkUrl = "";
let chunkSource = "";
for (const path of [...new Set(chunkPaths)]) {
  const url = `${site}${path}`;
  const source = await (await fetch(url)).text();
  if (source.includes("PondSection") && source.includes('getContext("webgl2"')) {
    chunkUrl = url;
    chunkSource = source;
    break;
  }
}

if (!chunkSource) throw new Error("Could not locate the current pond chunk.");

const marker = '49689,e=>{"use strict"';
const moduleStart = chunkSource.indexOf(marker);
if (moduleStart < 0) throw new Error("Could not locate module 49689.");
const functionStart = moduleStart + "49689,".length;
const nextModule = chunkSource.indexOf("},17002,e=>", functionStart);
if (nextModule < 0) throw new Error("Could not locate the end of module 49689.");
const moduleFunction = chunkSource.slice(functionStart, nextModule + 1);

const header = `/**
 * Read-only reverse-engineering reference extracted from the public client bundle.
 * Source: ${chunkUrl}
 * Retrieved: ${new Date().toISOString()}
 * SHA-256 of full chunk: ${createHash("sha256").update(chunkSource).digest("hex")}
 *
 * This file retains the original bundler wrapper and minified identifiers so the
 * port can be checked against exact shipped behavior. It is not imported by the
 * npm package or demo.
 */
`;

await mkdir("reference", { recursive: true });
await writeFile(
  "reference/original-pond.compiled.js",
  `${header}const originalPondModule = ${moduleFunction};\nexport default originalPondModule;\n`,
  "utf8",
);
await writeFile(
  "reference/original-pond.metadata.json",
  `${JSON.stringify(
    {
      sourceUrl: chunkUrl,
      retrievedAt: new Date().toISOString(),
      fullChunkBytes: Buffer.byteLength(chunkSource),
      fullChunkSha256: createHash("sha256").update(chunkSource).digest("hex"),
      extractedModule: 49689,
      extractedBytes: Buffer.byteLength(moduleFunction),
      networkDependencyFinding:
        "No pond-specific data API or media request exists. Browser capture only observed Next.js RSC navigation prefetches and an unrelated CARTO tiles metadata request used elsewhere on the page.",
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log(`Extracted module 49689 from ${chunkUrl}`);
