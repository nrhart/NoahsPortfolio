# Assignment 3 — Decision Making browser build

This runs the compiled C++ implementation from `C:/Users/Noah/OneDrive/Documents/GitHub/GAMEAI/assignment-3-decision-making-nrhart/apps/myApps/assignment3/src`.
Pac-Man is not part of this build. The desktop source is unchanged.

Build environment: openFrameworks nightly `of_v20261013_linux64_gcc6_release`, Emscripten `6.0.12`, with the framework's browser libraries installed. Original 1920×1080 simulation resolution is retained.

## Rebuild in Ubuntu

```bash
source ~/emsdk/emsdk_env.sh
cd ~/of-browser-build/of_v20261013_linux64_gcc6_release/apps/myApps/decisionMakingWeb
emmake make Release -j4
```

The copied project uses the Emscripten template Makefile. Its `config.make` contains:

```make
PROJECT_EMSCRIPTEN_EMBIND_AOT = 0
PROJECT_CFLAGS += -Isrc/DecisionMaking -Isrc/PathFinding
```

Copy the resulting `bin/em/decisionMakingWeb/index.js` and `index.wasm` into this directory. Preserve the custom HTML, demo controls, and service worker.

## Hosting and controls

Serve over HTTPS or localhost, as a top-level page. The demo-scoped service worker supplies browser isolation for Wasm threads and reloads once on first launch. It does not cache requests or control the rest of the portfolio.

1: Decision Tree; 2: Behavior Tree; 3: GOAP; R: Start/reset current scene; B: Wall building; C: Clear walls; U: Debug UI.
Click to select targets in the first two scenes or relocate bait in GOAP. Wall building pauses simulation and applies only to the first two scenes.

The page supplies equivalent buttons and fullscreen. Debug text is easiest to read on a desktop at fullscreen resolution.
