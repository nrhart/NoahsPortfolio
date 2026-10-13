# Assignment 4 — Pac-Man browser build

Compiled from `C:/Users/Noah/Documents/GitHub/GAMEAI/assignment-4-pacman-nrhart/apps/myApps/assignment3/src`.
The source project retains its assignment3 application folder name, but this browser output is separate from Decision Making.

## Build

openFrameworks nightly `of_v20261013_linux64_gcc6_release`, Emscripten `6.0.12`, and the framework's downloaded browser libraries.

```bash
source ~/emsdk/emsdk_env.sh
cd ~/of-browser-build/of_v20261013_linux64_gcc6_release/apps/myApps/pacmanWeb
emmake make Release -j4
```

Configuration:

```make
PROJECT_EMSCRIPTEN_EMBIND_AOT = 0
PROJECT_CFLAGS += -Isrc/DecisionMaking -Isrc/PathFinding
```

Copy `bin/em/pacmanWeb/index.js` and `index.wasm` here. Preserve the custom HTML, controls, and isolation service worker. The original C++ source and its 1920×1080 resolution are unchanged.

## Runtime

Open as a top-level page on HTTPS or localhost. The service worker is scoped to this demo and supplies the isolation headers required by Wasm threads, with a first-launch reload. It does not cache requests or control the rest of the portfolio.

Arrow keys / WASD move; R restarts; M toggles classic/procedural maze mode; U toggles debug UI. Onscreen equivalents and fullscreen are available.

## Implemented systems

- Behavior trees choose frightened, scatter, and chase modes.
- Four ghost personalities provide different chase targets; A* finds their routes.
- Grid movement, pellets, power-pellet effects, lives, and win conditions integrate the AI into a game loop.
- PCG uses randomized DFS backtracking, horizontal mirroring, fixed ghost-house/spawn constraints, pellet placement, and flood-fill reachability checks.
- The generator retries up to ten times, then uses the classic map if no generated layout passes validation. PCG mode does not guarantee a different layout after every restart.

This source does not implement GOAP for Pac-Man. The repository remote still points to Assignment 3; no separate Assignment 4 repository link is assumed.
