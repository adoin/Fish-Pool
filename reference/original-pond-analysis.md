# Original pond module: readable map

This document maps the identifiers in `original-pond.compiled.js` to their roles. The formatted reference is the exact client module extracted from the public bundle; `src/original-engine.ts` is mechanically generated from its framework-independent renderer and fish simulation.

## Runtime findings

- The pond does not request fish images, video, 3D models, JSON configuration, or a pond API.
- The page's observed fetches are Next.js RSC route prefetches plus an unrelated CARTO tiles metadata request used by another page feature.
- All pond geometry, palettes, motion, water state, interactions, stones, plants, caustics, shadows, and grain are generated locally.
- React only mounts the canvas and manages lifecycle. The engine itself is ordinary JavaScript and WebGL2.

## Top-level identifier map

| Compiled name | Readable role |
| --- | --- |
| `s` | `TAU` (`2 * Math.PI`) |
| `o` | Four original koi configuration records |
| `r` | Numeric clamp helper |
| `l` | Smooth interpolation helper |
| `c` | Angle wrapping helper |
| `u` | Convert mesh row 0–63 to longitudinal fish coordinate `-0.03…1.52` |
| `f` | Convert longitudinal fish coordinate back to mesh row |
| `d` | Three original stone definitions |
| `h` | Three authored plant clusters |
| `p` | Deterministic Park–Miller random seed |
| `m` | Shared GLSL precision header |
| `v` | Full-screen triangle vertex shader |
| `x` | Shared GLSL hash, value-noise, and analytic simplex-noise functions |
| `g` | Two-band ripple simulation fragment shader |
| `y` | Water surface / slope / caustic-field fragment shader |
| `b` | Tessellated water-grid vertex shader |
| `w` | Additive caustic projection shader |
| `_` | Separable Gaussian blur shader |
| `k` | Floor, sand, relief, and stone shader |
| `j` | Dynamic fish-mesh vertex shader |
| `z` | Shared koi body and rayed-fin GLSL helpers |
| `M` | Koi skin, scales, fins, eye, gill, and lighting fragment shader |
| `N` | Fish shadow fragment shader |
| `R` | Scene composition/refraction/dispersion fragment shader |
| `C` | Final feathering, exposure, blur, and film-grain shader |
| `E` | Animated plant-strip vertex shader |
| `L` | Translucent plant fragment shader |
| `T` | Framework-independent WebGL2 renderer factory |
| `q` | React canvas/lifecycle wrapper; intentionally excluded from the npm engine |

## Exact render pipeline

1. Update two ripple bands in ping-pong `RGBA16F` textures.
2. Convert ripple height and velocity into a water surface/slope texture.
3. Project caustics additively through a tessellated two-pixel grid.
4. Apply a separable caustic blur.
5. Draw fish silhouettes into a half-resolution shadow target using a `(22, 17)` scene-unit offset.
6. Blur the shadow target twice.
7. Upload the `64 × 9 × fishCount` dynamic fish mesh and render koi into a floating-point target.
8. Animate and render generated plant strips.
9. Composite floor, relief, water surface, caustics, shadows, fish, and plants with view refraction and chromatic dispersion.
10. Apply feathered transparency and frame-varying film grain to the canvas.

The renderer allocates twelve targets: `rippleA`, `rippleB`, `surface`, `caustic`, `causticBlur`, `floor`, `relief`, `plants`, `fish`, `shadow`, `shadowBlur`, and `scene`.

## Fish simulation map

- Each koi owns a 22-point spine, 160-point head trail, 64 sampled body rows, and a 64 × 9 render mesh.
- The spine is resampled from the head trail at equal arc-length intervals.
- Body rows interpolate along the spine and add a speed-dependent sinusoidal swim displacement.
- Fish choose spaced goals, steer away from canvas boundaries, and perform multi-segment separation against every other fish.
- Fear adds a flee vector, increases turn rate and speed, folds fins, and propagates to nearby fish.
- Each half-tail beat emits a wake drop; slow pectoral strokes add paired ripples; moving bodies add opposite signed water pushes.
- Hit testing walks all 63 centerline segments and uses the same longitudinal half-width function as the fish shader.

## Exact interaction constants

- Click water: `splash(x, y, 9, 2.6)`, `drop(x, y, 3, 0.5)`, then disturb nearby fish within `0.3 × pondWidth` at strength `0.45`.
- Click fish: set fear to `1`, raise speed to at least `1.2 × fishLength`, queue `splash(x, y, 7, 1.4)`, then disturb other fish within `1.8 × fishLength` at strength `0.6`.
- Pointer drag: after every 8 CSS pixels, queue `splash(x, y, 6, 0.9)` and disturb within `0.2 × pondWidth` at strength `0.3`.
- Interaction wakes reduced-motion rendering for four seconds.
- Simulation uses up to 12 substeps per animation frame: `ceil(300 × dt)`.

## Reproducible extraction

```bash
npm run extract:reference
npm run generate:engine
```

The first command downloads the current public chunk, verifies its module boundary, records its SHA-256 hash, extracts module `49689`, and formats it. The second command mechanically extracts only the framework-independent renderer and fish simulation into `src/original-engine.ts`.
