# Neuroglass widget in geppetto-vfb — implementation plan (VFB-246)

Status: **draft, under review** · Branch: `feature/VFB-246` · Drafted: 2026-10-27

Port the Neuroglass viewer widget that already exists in `virtual-fly-brain` into `geppetto-vfb`.

## Source implementation (virtual-fly-brain)

All paths relative to `virtual-fly-brain/applications/virtual-fly-brain/frontend/`.

| File | Role |
|---|---|
| `src/components/NeuroglassViewer.jsx` | iframe pointing at `${NEUROGLASS_URL}/embed#!<encodeURIComponent(JSON state)>`. Rebuilds the src when loaded instances, focused instance, layout or screen size change. 300 ms debounce; an `AbortController` cancels stale builds. |
| `src/utils/neuroglassStateConfig.js` | Shared viewport, fixed GLSL shader, one image layer per instance, and the datasource URL builder (`gs://`/`s3://` direct; HTTP walks directory listings to find the `VFB_*/neuroglancer/` folder). Results are cached per instance. |
| `src/utils/neuroglassActions.js` | show / hide / toggle the widget. |
| `src/utils/constants.js` | `KNOWN_NG_VIEWS`, `NG_LAYOUT_URL_PARAM = 'layout'`, defaults `4panel-alt` (desktop) and `3d` (mobile). |
| `src/reducers/...` | `SET_NEUROGLASS_VIEW` action and `globalInfo.neuroglassView` state. |
| `src/reducers/middleware/urlUpdaterMiddleware.js` | Reads `?layout=` on first load (removes invalid values); writes it back on `SET_NEUROGLASS_VIEW`. |
| `src/components/layout/widgets.js`, `minimized.js`, `componentMap.js` | Widget registration (hidden by default, right panel). |
| `src/components/configuration/VFBToolbar/vfbtoolbarMenuConfiguration.jsx` | "Neuroglass Viewer" menu entry (`fa fa-brain`). |
| `vite.config.js` | `NEUROGLASS_URL`, `NEUROGLASS_DATA_BASE_URL`, `NEUROGLASS_DATA_PROTOCOL` env vars. |

How an instance maps to a Neuroglancer layer:

| VFB instance | Neuroglancer layer |
|---|---|
| `metadata.Id` | `name` |
| `color.{r,g,b}` | `shaderControls.color` (hex) |
| `color.a` | `opacity` |
| `visibleMesh === false` | `visible: false` |
| focused instance | `selectedLayer.layer` |
| removed | layer absent |

The design history is in commits `1f4f2e7` to `8f0e1b0` (VFB-229, VFB-233, VFB-240). The original design doc, `NEUROGLASS_INTEGRATION_DESIGN.md`, was later removed; read it with `git show cb0a879:NEUROGLASS_INTEGRATION_DESIGN.md` in `virtual-fly-brain`.

## How geppetto-vfb differs

| | virtual-fly-brain | geppetto-vfb |
|---|---|---|
| Stack | React 18, MUI 5, Vite | React 16.14 (hooks available), MUI 4.12, webpack 4 |
| Instance state | `allLoadedInstances` in redux | Geppetto model (`Instances`) and `GEPPETTO.Events`. Redux only has `generals.idsList` and `generals.instanceOnFocus` |
| Change signals | redux actions | `GEPPETTO.Events.Color_set`, `Visibility_changed`, `Instance_deleted`, `Instances_created` (see `components/VFBMain.js` ~L2027, `components/interface/VFBStackViewer/VFBStackViewer.js` ~L220). `getColor()` returns a hex string |
| Layout | geppetto-meta widget registry | FlexLayout: `factory()`, `UIElementHandler` switch, `*Visible` state flags and `restoreUIComponent` in `components/VFBMain.js`; default model in `components/configuration/VFBMain/layoutModel.js` |
| Config | `import.meta.env` | Defaults hard-coded in configuration files, overwritten by `sed` in `dockerFiles/configure.sh` at Docker build time (Dockerfile `ARG`s) |
| URL | middleware | Direct `history.replaceState`/`pushState` calls that rebuild `?id=&i=` (`components/VFBMain.js` ~L287, `components/interface/VFBFocusTerm/VFBFocusTerm.js` ~L519-543). They drop any other parameter |

Use CircuitBrowser (`vfbCircuitBrowser`) as the example of how a widget is wired end to end in `VFBMain.js`.

## Steps (one commit each)

### 1. Configuration and state builder
- New `components/configuration/VFBNeuroglass/neuroglassConfiguration.js`:
  - endpoints with defaults copied from the Vite config: protocol `neuroglancer-precomputed`, base `gs://neuroglass/vfb`, URL `https://www.research.neuroglass.dev.metacell.us`
  - allowed layouts and the `layout` URL parameter name
  - shared viewport, shader, layout resolver, address builder (with cache) and `buildNeuroglassState`
- Change from the source: the builder takes a plain list `{ id, color, opacity, visible }` instead of VFB instance objects, so it never touches Geppetto and is easy to test.
- Colour conversion accepts hex strings as well as `{r,g,b}`.
- Jest unit tests for the pure functions: layer mapping, layout resolution, address building for gs/n5/http.

### 2. Geppetto adapter
- `getNeuroglassInstances(idsList)`: for each id, `Instances.getInstance(id)` → `{ id, color: getColor(), opacity, visible }`.
- Visibility comes from the `_obj` child (open question 4); opacity per open question 2.
- Skip ids with no volume (open question 3).

### 3. `VFBNeuroglassViewer` component
- Location: `components/interface/VFBNeuroglass/VFBNeuroglassViewer.js`.
- Connected to redux for `idsList`, `instanceOnFocus` and `neuroglassView`.
- Listens to `Color_set`, `Visibility_changed`, `Instance_deleted` and `Instances_created`, and removes the listeners with `GEPPETTO.off` on unmount (VFBStackViewer never removes its listeners; don't copy that).
- Keeps the 300 ms debounce and cancellation, and the same iframe `sandbox`/`allow` attributes.
- Screen-size check uses an explicit `(min-width:1200px)` media query, because MUI 4's `lg` breakpoint is 1280 px.
- Takes a `visible` prop and skips rebuilds while its tab is hidden, as CircuitBrowser does; rebuilds when shown again.
- Empty state: "No layers selected…"; while building: "Loading Neuroglass viewer…".

### 4. Wiring into VFBMain
- `neuroglassViewerVisible` state flag, default `false`.
- `UIElementHandler` case `neuroglassViewerVisible` → `UIUpdateItem(..., "vfbNeuroglassViewer")`.
- `componentDidUpdate` adds the tab; `factory()` branch for `vfbNeuroglassViewer`; `restoreUIComponent` handling.
- Toolbar entry "Neuroglass Viewer" (`fa fa-brain`) next to Circuit Browser in `components/configuration/VFBToolbar/vfbtoolbarMenuConfiguration.js`.
- Not in the default `layoutModel.js` (hidden by default, as in virtual-fly-brain).
- Optionally a `helpLinks.js` entry.

### 5. `?layout=` URL parameter
- `SET_NEUROGLASS_VIEW` action plus `neuroglassView: null` in `actions/generals.js` and `reducers/generals.js`.
- Read at startup, checked against the allowed layouts; invalid values are removed from the URL.
- Patch the `replaceState`/`pushState` calls in `VFBMain.js` and `VFBFocusTerm.js` so `layout` survives URL rewrites.

### 6. Docker and configuration
- Dockerfile `ARG`s: `NEUROGLASS_URL_ARG`, `NEUROGLASS_DATA_BASE_URL_ARG`, `NEUROGLASS_DATA_PROTOCOL_ARG`, passed to `configure.sh`.
- `configure.sh`: `sed` lines replacing the defaults in `neuroglassConfiguration.js`, and log the values used, like the existing PDB/Solr entries.

### 7. QA
- `eslint` (runs on `prestart`/`prebuild`) and jest.
- Manual checks:
  - add, remove, recolour, hide and show from the list viewer and term info
  - focus change updates the selected layer
  - `?layout=3d`; an invalid `?layout=foo` is removed
  - mobile width defaults to `3d`
  - several quick colour changes cause only one iframe reload
  - the iframe loads on v2 (no CSP set in `dockerFiles/nginx.conf`; the Neuroglass host must allow being framed by `v2.virtualflybrain.org`)
- Optionally a puppeteer test under `tests/jest/vfb` that opens the widget.

## Open questions

1. **Data source:** default to the GCS bucket or to a VFB HTTP file server? Do we keep the directory-listing crawl, which is fragile and costs two fetches per instance on first load?
2. **Opacity:** Geppetto keeps opacity per mesh in the scene controller and has no `getOpacity`. Read it from the mesh material, or fix layer opacity at 1 for now?
3. **Which instances become layers:** everything in `idsList`, or only the template plus instances with volumes (`_obj`)? What about skeleton-only neurons (`_swc`)?
4. **Visibility source:** use the 3D `_obj` visibility (matches VFB's `visibleMesh`) or the instance-level visibility?
5. **Default placement:** a hidden tab that opens in the canvas tabset, or its own tabset to the right?
6. **Drift from virtual-fly-brain:** port as-is and accept that, or put the shared pure logic (state builder, address builder) in a package both apps import?

## Housekeeping

- When the branch was created, `master` had unrelated uncommitted changes, which carried over: `package.json` (`--openssl-legacy-provider` on `start`), `webpack.config.dev.js` (dev proxy pointing at `VFB_BACKEND`) and `package-lock.json`. Decide whether they stay on this branch, move to their own branch, or get stashed.
- Delete this file, or move it to `docs/`, before merging.
