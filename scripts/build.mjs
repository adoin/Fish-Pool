import { build } from "esbuild";
import { mkdir, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";

await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });

const shared = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  sourcemap: true,
  target: ["es2020"],
  legalComments: "eof",
};

await Promise.all([
  build({ ...shared, format: "esm", outfile: "dist/index.js" }),
  build({ ...shared, format: "cjs", outfile: "dist/index.cjs" }),
  build({
    ...shared,
    format: "iife",
    globalName: "FishPoolWebGL",
    minify: true,
    outfile: "dist/fish-pool.min.js",
  }),
]);

execFileSync(process.execPath, ["node_modules/typescript/bin/tsc", "-p", "tsconfig.types.json"], {
  stdio: "inherit",
});

await Promise.all(
  ["fish", "renderer", "shaders", "original-engine"].flatMap((name) => [
    rm(`dist/${name}.d.ts`, { force: true }),
    rm(`dist/${name}.d.ts.map`, { force: true }),
  ]),
);
console.log("Built ESM, CommonJS, browser IIFE, source maps, and declarations.");
