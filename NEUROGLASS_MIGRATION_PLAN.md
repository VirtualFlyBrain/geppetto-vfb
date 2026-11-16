# Neuroglass widget in geppetto-vfb — implementation plan (VFB-246)

Branch: `feature/VFB-246` · Drafted 2026-10-27 · Updated 2026-11-12

Bring the Neuroglass viewer widget from `virtual-fly-brain` (v3) into `geppetto-vfb`, which stays on React 16 / webpack 4.

## Status

| Phase | Scope | State |
|---|---|---|
| 1 | Widget shows the Neuroglass iframe; its layers are the terms with a visual capability in the 3D scene, kept in sync on add/remove | **Done** (commit `399e5cba3`) |
| 2 | Sync colour, opacity, hide/show, selection; updates applied in place (no reload) | **Done, not committed** (2026-11-12) |
| 3 | Housekeeping: deployment config, URL `layout` param, tests | To do |

## How phase 1 works

### Data
- One zip per instance and template:
  `https://www.virtualflybrain.org/data/VFB/i/<id[4:8]>/<id[8:]>/<templateId>/precomputed.zip`
  e.g. `VFB_00000001` on JRC2018U → `.../0000/0001/VFB_00101567/precomputed.zip`.
  Ids can be alphanumeric (`VFB_jrchk00s` → `jrch/k00s`).
- Index: `https://precomputed.k8s.virtualflybrain.org/precomputed.csv` (211 MB; columns `vfb_id,label,gross_types,template,precomputed_url,thumbnail_url`). On 2026-11-10 it had 809k rows / 801k ids, only two templates (`VFB_00101567` JRC2018U: 667k rows, `VFB_00200000` VNC: 142k rows), and 8k ids on both. Too big for the browser; it's only used as a reference.
- Neuroglancer reads the zip directly: `<zip url>|zip:|neuroglancer-precomputed:`. It uses HEAD plus explicit byte ranges, so no CORS preflight. The server sends `Access-Control-Allow-Origin: *` and `Accept-Ranges: bytes`. `OPTIONS` returns 405, so anything that needs a preflight (e.g. a suffix range `bytes=-N`) would fail.
- Zip content: `info`, `provenance.json`, chunks in `0/`, legacy meshes in `mesh/` (segment `1`).
  - Templates (category `template`) and expression patterns (category `expression`) are `image` layers.
  - Neurons, painted domains and other `object`s are `segmentation` layers with a mesh.
  - The layer type is read from `info`, which the pipeline writes as the first zip entry: one `Range: bytes=0-4095` request, then the local file header is parsed and the entry inflated with `DecompressionStream('deflate-raw')`. A 404 means no data for that term on this template, and the term is left out.

### Code
- `components/interface/utils/neuroglass.js` (from master, commit `281806acc`, "Tools > Open in Neuroglass") holds all the state logic:
  - `sceneTerms()`: template first, then the composite instances of everything with a visual capability (the same set as the share link `i=`), with colour, visibility and gross types
  - `buildNeuroglassState(terms, templateId, focusId, layout)`: layer types from the zip `info`, tuned shaders (faint template volume, silhouettes for regions), per-template view
  - `neuroglassUrl()` → `https://vfb.neuroglass.io/embed#!<state>` (VFB's own Neuroglass; it allows framing with `frame-ancestors *`)
  - **Changed on this branch:** `buildNeuroglassState` takes an optional `layout` (default `4panel-alt`); zip type probes are cached per page (`cachedZipLayerType`), so rebuilds don't refetch.
- `components/interface/VFBNeuroglass/VFBNeuroglassViewer.js`: new class component, `connect`ed to `generals.idsList` / `generals.instanceOnFocus`.
  - Rebuilds, debounced by 300 ms, when `idsList` changes, on `GEPPETTO.Events.Instances_created` (idsList can change before the term's visual instances exist), on a mobile/desktop switch, and when its tab becomes visible.
  - Focus changes alone don't rebuild; the focused term becomes the selected layer on the next build. (Phase 2 replaced the iframe reloads with in-place hash updates.)
  - Layout: `3d` at ≤1199 px, else `4panel-alt`.
  - Messages for: no template, template without precomputed data, no term with data.
- `components/VFBMain.js`: wired like the Circuit Browser:
  - `neuroglassViewerVisible` state flag (default `false`, so it isn't in the default layout)
  - `UIUpdateManager` case
  - reopen in `componentDidUpdate` and restore in the `UIUpdated` switch
  - `factory()` branch for `vfbNeuroglassViewer`
- `components/configuration/VFBToolbar/vfbtoolbarMenuConfiguration.js`: Tools → "Neuroglass Viewer" (`fa fa-cube`; this app uses Font Awesome 4, which has no `fa-brain`), next to "Open in Neuroglass" (new tab).

### Verified (2026-11-10)
- `eslint` clean on changed files; dev build compiles.
- Headless Chrome against the dev server (proxying live v2), scene `?id=VFB_00000001&i=VFB_00101567,VFB_00000001`:
  - Opening Tools → Neuroglass Viewer gives an iframe on `vfb.neuroglass.io/embed` with the template (image) and the neuron (segmentation, its 3D colour).
  - `addVfbId('VFB_001012vj')`: the expression pattern appears as an image layer within ~10 s.
  - Deleting `VFB_001012vj`: its layer is gone within ~5 s.
  - No page errors.
- The state renders in Neuroglass with template, neuron, expression pattern and painted domain.

## Phase 2: feature sync (done 2026-11-12)

### In-place updates
Neuroglass has no external update API: the embed bundle only posts messages to itself (`STATE_UPDATE`, `CREATE_FIGURE`, ...), nothing to or from the parent. It does apply a new `#!` hash in place. Checked with headless Chrome:
- `iframe.contentWindow.location.replace(<same /embed URL, new #!state>)` keeps the page (a marker variable survives) and refetches nothing.
- Layers are rebuilt from the state, so colour, visibility, opacity, added and removed layers all apply.
- `replace` adds no history entry to the VFB page.
- **The camera is reset** to what the state says (the template view). Leaving the camera keys out resets it to Neuroglancer's defaults, and the iframe is cross-origin, so its current camera can't be read back.

The widget therefore loads the iframe once, then only replaces the hash, and skips a state identical to the one shown.

### What is followed
| VFB | Event | Neuroglass |
|---|---|---|
| add / delete term | `idsList`, `Instances_created`, `Instance_deleted` | layer added / removed |
| colour | `Color_set` | segment colour / image `color` control |
| show / hide | `Visibility_changed` | layer `visible` |
| select / deselect | `Select` | layer drawn in `GEPPETTO.Resources.COLORS.SELECTED` (`#ffcc00`), like the 3D viewer; the base colour comes back on deselect |
| opacity | none in Geppetto: `watchOpacityChanges()` wraps `SceneController.setOpacity` once and triggers `vfb:opacity_set` | relative to the load opacity `setSepCol` gives (0.4 template, 0.3 others): segmentation `objectAlpha`, image `opacity` (2D) and volume `alpha` scaled by `min(1, opacity / load opacity)` |

- Selection is read from the term and its children (a 3D click can select the mesh).
- Opacity is read from `canvas.viewState.custom.opacityMap[termId]`; opacity set on a child path only (e.g. `VFB_x.VFB_x_obj.setOpacity()`) is not followed.
- The VFB UI has no opacity control today; opacity changes come from the console/API.
- Focus alone still doesn't rebuild (each rebuild resets the camera); focusing selects, and selection is followed.
- "Open in Neuroglass" (new tab) uses the same state, so it also shows the selected terms in yellow.

### Verified (2026-11-12)
Headless Chrome on the dev server, scene `VFB_00101567, VFB_00000001`, reading `viewer.state` inside the iframe after each step: deselect → green; `setColor('#0000ff')` → blue; select → `#ffcc00`; hide/show template → `visible` false/true; neuron `setOpacity(0.15)` → `objectAlpha 0.5`; template `setOpacity(0.2)` → `opacity 0.5`; `addVfbId('VFB_001012vj')` → new layer (selected, yellow); `delete()` → gone. Same page throughout, iframe `src` attribute unchanged, no history entries from the widget, no errors. eslint clean.

### Next for sync
1. **Ask the Neuroglass team** for a `postMessage` API (apply a state patch without touching the camera; send selection/camera out). That removes the camera reset and allows Neuroglass → VFB selection.
2. Alternative without them: serve the embed from the VFB origin (reverse proxy), so the widget can drive `iframe.contentWindow.viewer` directly.

## Default layout (2026-11-13)

`components/configuration/VFBMain/layoutModel.js`, requested by the user:
- Left 70%: top tabset (75% of the height) with **Neuroglass Viewer** (selected), 3D Viewer, Slice Viewer; below it Layers (25%).
- Right 30%: Term Info (selected), Template ROI Browser, Circuit Browser, Term Context. The strip is narrow, so FlexLayout puts the last tabs in its "»" overflow menu.
- 3D Viewer and Slice Viewer have `enableRenderOnDemand: false`: they mount hidden at startup, as before. VFBMain calls `canvasReference` unguarded while loading, and the Neuroglass widget reads colours/opacity from the 3D canvas.
- `neuroglassViewerVisible` now defaults to `true` in VFBMain.
- Checked in headless Chrome: layout as above; Neuroglass shows the scene with the right colours; 3D and Slice viewers render when their tabs are selected; no page errors.

## Phase 3: housekeeping

- **Deployment config:** `https://vfb.neuroglass.io/embed` and the data root are constants in `utils/neuroglass.js`. If they need to differ per environment, add Dockerfile `ARG`s and `sed` lines in `dockerFiles/configure.sh`, as for PDB/Solr.
- **`?layout=` URL parameter** (as in v3): redux `neuroglassView`, read at startup, and preserve it in the `replaceState`/`pushState` rewrites in `VFBMain.js` / `VFBFocusTerm.js`.
- **Tests:** jest here is jest-puppeteer only (no unit-test setup). Add an e2e test under `tests/jest/vfb` that opens the widget and checks the iframe `src` layers.
- Templates other than JRC2018U/VNC show the "not available" message (`neuroglassAvailable` → `TEMPLATE_VIEWS`); extend when the pipeline converts more.

## Open issues

1. **Camera reset on every scene change** (see phase 2): colour, visibility, selection, opacity, add/remove all put the Neuroglass camera back to the template view. Needs a Neuroglass API or a same-origin proxy.
2. **"Limited viewing area" dialog:** Neuroglass shows it when the iframe is small (the default tab is ~460×420). With in-place updates it only appears once per load. Ask Neuroglass for an embed option to suppress it, or open the tab larger.
3. **Probe cache:** a term whose zip check failed on the network stays cached as "missing"/`auto` until reload.

## Housekeeping on the branch

- Phase 1 was committed together with the local dev changes (`package.json` `--openssl-legacy-provider`, `webpack.config.dev.js` dev proxy, `package-lock.json`); check they are wanted in the PR.
- Delete this file, or move it to `docs/`, before merging.
