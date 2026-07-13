# Photo Collage Maker

A full-stack web app that builds photo collages with the **ImageMagick CLI**.
The Node backend runs `magick` via `spawn()` with argument arrays (no shell
strings). The React frontend lets you pick a layout, fill its slots with images,
reorder them, and generates a downloadable collage.

## Prerequisites

- Node.js 18+
- ImageMagick 7 (`magick` on PATH)

```bash
# Debian/Ubuntu
sudo apt install imagemagick
# macOS
brew install imagemagick
# NixOS
nix-shell -p imagemagick
```

Verify: `magick --version`

## Project Structure

```
.
├── client/   # Vite + React + Tailwind frontend
├── server/   # Express + Multer + ImageMagick backend
└── README.md
```

## How it works

1. **Pick a layout first** — preset cards in the sidebar (Instagram grid,
   Pinterest masonry, Contact sheet, Film strip, Polaroid stack). Each preset
   has a fixed number of slots.
2. Fill the slots — click a slot's `+`, or use the Dropzone / "Add images" to
   add several at once. Reorder thumbnails in the sidebar by dragging.
3. **Generate** — the backend renders the collage and the browser downloads
   the result.

Images are placed into **uniform 1080×1080 square cells**, cover-cropped to
fill (no blank gaps). `GAP` (24px) and `OUTER_PADDING` (48px) are fixed
constants defined in both `client/src/utils/constants.js` and
`server/services/imagemagick.js` — they must stay in sync so the preview
matches the exported file.

## Development Setup

Backend:

```bash
cd server
npm install
npm run dev      # http://localhost:3000
```

Frontend (another terminal):

```bash
cd client
npm install
npm run dev      # http://localhost:5173
```

The Vite dev server proxies `/api` and `/output` to `http://localhost:3000`,
so local dev works with no extra config.

## Configuration

### Frontend (`client/.env`)

| Var           | Purpose |
|---------------|---------|
| `VITE_API_URL` | Backend base URL, e.g. `https://api.example.com`. Empty = same-origin (`/api`). Set this when deploying the frontend separately. |

### Backend (`server/.env`, all optional)

| Var           | Default |
|---------------|---------|
| `PORT`        | `3000` |
| `OUTPUT_DIR`  | `output` |
| `UPLOAD_DIR`  | `uploads` |
| `TEMP_DIR`    | `temp` |
| `MAGICK_PATH` | `magick` |

CORS is enabled on the server, so a separately-hosted frontend can call it.

## API

### POST /api/collage

`multipart/form-data`

| Field        | Type    | Notes |
|--------------|---------|-------|
| images[]     | file[]  | 2–20 images |
| layout       | string  | `grid`, `masonry`, `contact-sheet`, `horizontal`, `vertical` |
| background   | string  | color, e.g. `white` or `#1f1f1f` |
| backgroundImage | file | optional; uploaded image used as the canvas background (composited behind the collage). Supported for all layouts. |
| format       | string  | `png`, `jpg`, `webp` |
| sizes        | JSON    | array of `{ w, h }` (client sends uniform 1080×1080) |
| preset       | string  | used for the output filename |

`gap`, padding, and `resizeMode` are fixed server constants (not overridable
via the API): `gap = 24`, `OUTER_PADDING = 48`, `resizeMode = original`.

Response:

```json
{ "success": true, "imageUrl": "/output/polaroid-20240712-143000.png" }
```

The frontend fetches `imageUrl` as a blob and triggers a download (so it works
cross-origin).

### GET /api/health

Returns backend status and the configured magick path.

## Layouts

- **Grid**: rows × cols via balanced grid (`cols = ceil(sqrt(n))`); last partial
  row is stretched to fill the width.
- **Masonry**: round-robin column distribution.
- **Contact sheet**: uniform thumbnails in an ImageMagick grid.
- **Horizontal / Vertical**: single row / single column strip.

## Deployment

- **Frontend → Vercel**: Root Directory `client`, build
  `npm install && npm run build`, output `dist`. Set `VITE_API_URL` to the
  backend URL in Vercel's Environment Variables.
- **Backend → Render** (or Railway): Root Directory `server`, build
  `npm install`, start `node app.js` (or `npm start`). Set `OUTPUT_DIR`/`PORT`
  if needed. Ubuntu images include ImageMagick.

### Local test with ngrok

Expose the backend (`ngrok http 3000`), then set `VITE_API_URL` in
`client/.env` to the ngrok URL and restart the frontend — this exercises the
real cross-origin download flow.

## Security

- Commands are argument arrays executed with `spawn()` (never `exec()`).
- MIME / extension / size / count validated at the boundary.
- Output filenames are `<preset>-<timestamp>.<ext>` (no user input in the path).
- Temporary uploads are deleted after generation.

## Troubleshooting

- `magick: command not found` — install ImageMagick or set `MAGICK_PATH`.
- `Generation failed` — check server logs; ensure `magick` supports the format.
- Preview doesn't match export — confirm `GAP`/`OUTER_PADDING` match in
  `client/src/utils/constants.js` and `server/services/imagemagick.js`.
