import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";

await rm("demo-dist", { recursive: true, force: true });
await mkdir("demo-dist", { recursive: true });

await build({
  entryPoints: ["demo/main.ts"],
  bundle: true,
  format: "esm",
  target: ["es2020"],
  sourcemap: true,
  outfile: "demo-dist/main.js",
});

await Promise.all([
  cp("demo/index.html", "demo-dist/index.html"),
  cp("demo/style.css", "demo-dist/style.css"),
]);

console.log("Built demo to demo-dist/.");
