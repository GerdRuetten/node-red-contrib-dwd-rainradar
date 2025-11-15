# node-red-contrib-dwd-rainradar

A Node-RED node to access the German Weather Service (DWD) rain radar data (RADOLAN).  
This node is designed to analyse current precipitation over Germany or a selected region and to provide summary values, grid data and optional image output.

> ⚠️ **Status:** Early beta.  
> The initial version uses a dummy implementation for development and testing.  
> A future release will connect to the official DWD OpenData RADOLAN products.

---

## ✨ Features

- Node-RED input node for the DWD rain radar (RADOLAN)
- Configurable area of interest:
    - Whole Germany
    - Bounding box (lat/lon)
    - Point + radius (lat/lon + km)
- Optional automatic refresh (polling in the background)
- Flexible output:
    - Summary (aggregated precipitation information)
    - Full grid data (raster)
    - Optional image placeholder (PNG/Base64, planned for a future version)
- Full editor i18n support (English / German)
- Localized help pages (English / German)
- Ready for CI/CD with GitHub Actions and npm

---

## 📦 Install

From your Node-RED user directory (typically `~/.node-red`):

```bash
npm install node-red-contrib-dwd-rainradar
```

Or via the Node-RED Palette Manager:

1. Open the Node-RED editor
2. Menu → **Manage palette**
3. Tab **Install**
4. Search for **`node-red-contrib-dwd-rainradar`**
5. Click **Install**

---

## Node: `dwd-rainradar`

This node appears in the **input** category and is labelled **“DWD Rain Radar”** (or **„DWD-Regenradar“** when the editor language is set to German).

### Configuration

#### Name

Optional display name.  
If left empty, a default label is used.

#### Area mode

Defines how the area of interest is specified:

- **Whole Germany**  
  Uses the full DWD radar domain.

- **Bounding box**  
  Requires:
    - **Min latitude**
    - **Max latitude**
    - **Min longitude**
    - **Max longitude**  
      All values are expected in decimal degrees (WGS84).

- **Point + radius**  
  Requires:
    - **Latitude**
    - **Longitude**
    - **Radius (km)**

The area parameters are currently part of the configuration and are not modified by incoming messages.

#### Auto-refresh (sec)

Interval in seconds for automatic background updates:

- `0` → disabled (no automatic fetch)
- `> 0` → fetch radar data periodically

#### Fetch on deploy

When enabled, the node performs an initial fetch shortly after the flow is deployed.  
A **full deploy** (all flows) ensures that the node is re-created and the initial fetch is triggered.

#### Output options

Controls the structure of `msg.payload`:

- **Summary**  
  Emits aggregated information about the precipitation in the area of interest.

- **Full grid**  
  Emits a simple raster representation of the radar field (width, height, values).  
  In the dummy implementation this is a small 10×10 array.

- **Image (PNG/Base64)**  
  Reserved for future usage to provide an encoded radar image suitable for dashboards and UI templates.

#### Diagnostics

When enabled, the node writes additional diagnostic information to the Node-RED log, for example:

- When the node is created
- Whether `fetchOnDeploy` is enabled
- Auto-refresh interval
- Fetch results and errors

---

## 🔌 Inputs

Any incoming message triggers a fetch of the radar data using the current configuration.

- The content of the input message is not evaluated in the initial version.
- In a future version, optional overrides via `msg.payload` may be added (e.g. specific time, temporary area).

Typical usage:

- **Inject node** as trigger
- **Timers / schedulers** to trigger fetches on a custom schedule

---

## 📤 Outputs

The node sends a single message with the radar information in `msg.payload`.

### `msg.payload.meta`

Metadata describing the result:

```json
{
  "source": "DWD Rain Radar (dummy)",
  "timestamp": "2025-11-15T22:20:38.474Z",
  "mode": "de"
}
```

- `source` – source identifier (currently marked as dummy)
- `timestamp` – ISO 8601 timestamp when the data was created/fetched
- `mode` – current area mode (`de`, `bbox`, `point`)

### `msg.payload.summary`

Present when **Summary** is enabled.

Example:

```json
{
  "hasRain": true,
  "maxIntensity": 12.3,
  "avgIntensity": 1.7,
  "coveragePercent": 42.0
}
```

- `hasRain` – Boolean flag indicating if any rain is detected in the area
- `maxIntensity` – maximum intensity in the domain (dummy value in this version)
- `avgIntensity` – average intensity (dummy value)
- `coveragePercent` – percentage of cells with rain (dummy value)

### `msg.payload.grid`

Present when **Full grid** is enabled.

Example (dummy):

```json
{
  "width": 10,
  "height": 10,
  "values": [5, 0, 0, 0, ...]
}
```

- `width` / `height` – dimensions of the grid
- `values` – flattened array of raster values (length = `width * height`)

In the dummy implementation, every 5th cell is set to `5`, the others to `0`.

### `msg.payload.image`

Present when **Image (PNG/Base64)** is enabled.

Example (dummy placeholder):

```json
{
  "mimeType": "image/png",
  "data": null
}
```

Future versions may provide an actual Base64-encoded radar image here.

---

## 🔎 Status text

The node uses Node-RED status text to indicate its current state:

- **`loading…`** – fetching radar data
- **`ready`** – idle, waiting for input or auto-refresh
- **`N cells`** – number of cells in the last grid result (if grid output is enabled)
- **`error`** – an error occurred during fetch or processing

The text is localized according to the editor language.

---

## 🌍 Internationalisation (i18n)

This node fully supports the Node-RED i18n system.

- Editor labels and tooltips are translated via:
    - `nodes/locales/en-US/dwd-rainradar.json`
    - `nodes/locales/de/dwd-rainradar.json`
- Help text is localized via:
    - `nodes/locales/en-US/dwd-rainradar.html`
    - `nodes/locales/de/dwd-rainradar.html`
- Runtime messages and statuses use `RED._()` with the same namespace.

When the Node-RED editor language is changed (or set to “Browser”), the node UI and help text follow the selected language.

---

## 🧪 Example flow

A basic example flow is included in the repository under:

```text
examples/dwd-rainradar-basic.json
```

This flow demonstrates:

- Triggering the DWD Rain Radar node via an Inject node
- Using “Fetch on deploy” to get data directly after deployment
- Showing the result in a Debug node

You can import it via:

1. Node-RED menu → **Import**
2. **Clipboard**
3. Paste the JSON from `examples/dwd-rainradar-basic.json`
4. Click **Import**

---

## 🗺️ Roadmap

Planned features for future releases:

- Direct integration with DWD RADOLAN OpenData endpoints
- Real precipitation intensity values (mm/h or dBZ)
- Improved grid resolution and projection handling
- Optional PNG/Base64 radar imagery output
- Additional configuration for specific RADOLAN products (e.g. RW, RY)
- Optional time selection (most recent, specific timestamp)

---

## ⚖️ License

MIT © 2025 [Gerd Rütten](https://github.com/GerdRuetten)

---

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for details.

---

> ⚠️ **node-red-contrib-dwd-rainradar** — bringing official DWD rain radar (RADOLAN) data directly into your Node-RED flows.