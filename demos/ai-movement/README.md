# AI Movement browser build

This demo runs the original openFrameworks C++ implementation compiled with Emscripten, rather than a JavaScript rewrite.

## Build environment

- openFrameworks nightly package: `of_v20261013_linux64_gcc6_release`
- Emscripten SDK: `6.0.12`
- Browser libraries: installed with `scripts/emscripten/download_libs.sh`
- Build folder: `~/of-browser-build/of_v20261013_linux64_gcc6_release/apps/myApps/aiMovementWeb`
- Browser-only source fix: `Rigidbody2D.h` include changed to `rigidbody2D.h` to match the file's capitalization.
- `PROJECT_EMSCRIPTEN_EMBIND_AOT = 0` in the copied project's `config.make`.

## Rebuild

In Ubuntu, activate the SDK, change into the build folder above, then run:

```bash
source ~/emsdk/emsdk_env.sh
emmake make Release -j4
```

Copy the generated `bin/em/aiMovementWeb/index.js` and `index.wasm` into this directory. Keep the custom `index.html`, `demo.js`, and `isolation-sw.js`.

## Hosting

Serve over HTTPS or localhost. Do not open the HTML as a local file.
The build uses Wasm threads. The demo-scoped service worker adds cross-origin isolation headers and reloads the page once on first launch. Open this demo as a top-level page; an iframe inside a non-isolated portfolio page will not provide the required isolation.

The service worker does not cache responses or control the portfolio outside this demo directory. All runtime assets are local; no external runtime CDN is required.

## Controls

1: Kinematic; 2: Seek; 3: Wander; 4: Flocking.
B: Breadcrumbs; D: Wander debug; + / -: Add/remove boids.
Click or tap in Seek mode to select a target. Equivalent on-screen buttons are provided.
