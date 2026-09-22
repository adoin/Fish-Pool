import * as esbuild from "esbuild";

const context = await esbuild.context({
  entryPoints: ["demo/main.ts"],
  bundle: true,
  format: "esm",
  target: ["es2020"],
  sourcemap: true,
  outfile: "demo-dist/main.js",
  plugins: [
    {
      name: "copy-demo-shell",
      setup(build) {
        build.onEnd(async () => {
          const { cp, mkdir } = await import("node:fs/promises");
          await mkdir("demo-dist", { recursive: true });
          await Promise.all([
            cp("demo/index.html", "demo-dist/index.html"),
            cp("demo/style.css", "demo-dist/style.css"),
          ]);
        });
      },
    },
  ],
});

await context.watch();
const server = await context.serve({ servedir: "demo-dist", port: 4173 });
console.log(`Fish Pool demo: http://${server.host}:${server.port}`);
