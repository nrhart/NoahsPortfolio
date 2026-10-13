# Pathfinding browser build

Compiled from the original C++ source at `assignment-2-pathfinding-nrhart/apps/myApps/PathfindingAI/src`.
The desktop project is unchanged. No external data assets or third-party addons were needed.

Build environment: openFrameworks `of_v20261013_linux64_gcc6_release`, Emscripten `6.0.12`, with browser libraries downloaded through the framework's Emscripten script.

## Rebuild in Ubuntu

```bash
source ~/emsdk/emsdk_env.sh
cd ~/of-browser-build/of_v20261013_linux64_gcc6_release/apps/myApps/pathfindingWeb
emmake make Release -j4
```

The copied build project uses the framework's Emscripten Makefile and `PROJECT_EMSCRIPTEN_EMBIND_AOT = 0`. Copy `bin/em/pathfindingWeb/index.js` and `index.wasm` here after rebuilding. Preserve the custom HTML, controls, and service worker.

## Hosting

Open as a top-level page on HTTPS or localhost. A service worker scoped only to this demo supplies the isolation headers needed by Wasm threads, then reloads once. It does not cache responses or control the rest of the portfolio.

## Controls

- 1 / 2: Small / large graph (1 returns from navigation to graph mode).
- 3: Navigation grid.
- A: Toggle Dijkstra / A* in graph mode.
- H: Cycle graph heuristics.
- R: Run graph search. Click two nodes first or use random endpoints.
- B: Toggle wall building in navigation mode.
- C: Clear grid walls.
- Navigation: click a destination, or click/drag to paint walls while building.

The page includes equivalent buttons. Grid navigation uses A* with Euclidean distance, independently of graph-mode selections. Reported timings and memory metrics are those calculated by the original project, rather than browser-wide profiling measurements.

## Browser rendering adaptation

The browser copy batches graph edges and node markers into meshes, rather than issuing separate draw calls for every edge and circle in the 10,000-node graph. Search algorithms, graph size, endpoints, and metrics are unchanged. Node markers use 12-segment discs. The reproducible source change is in `browser-rendering.patch`; apply it once with `patch -p1 < browser-rendering.patch` from the copied build project root.
