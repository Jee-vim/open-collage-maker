# Photo Collage Maker

A full-stack web app that builds photo collages using the **ImageMagick CLI** for all image processing. Node backend runs `magick` via `spawn()` with argument arrays (no shell strings). React frontend provides upload, reorder, layout settings, and result preview.

## Prerequisites

- Node.js 18+
- ImageMagick 7 (`magick` on PATH)

### Install ImageMagick

- Debian/Ubuntu: `sudo apt install imagemagick`
- macOS: `brew install imagemagick`
- NixOS: `nix-shell -p imagemagick`

Verify: `magick --version`

## Project Structure

```
.
├── client/   # Vite + React + Tailwind frontend
├── server/   # Express + Multer + ImageMagick backend
├── .env.example
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` in the project root:

```
PORT=3000
UPLOAD_DIR=uploads
OUTPUT_DIR=output
TEMP_DIR=temp
MAX_UPLOAD_SIZE=10485760
MAX_FILES=20
MAGICK_PATH=magick
```

## Development Setup

Backend:

```bash
cd server
npm install
# from project root, or set env as needed
npm run dev
```

Frontend (in another terminal):

```bash
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/output` to `http://localhost:3000`.

Open `http://localhost:5173`.

## Production Build

```bash
cd client && npm run build
# Serve client/dist with any static host, and run the server.
cd server && npm start
```

## API

### POST /api/collage

`multipart/form-data`

| Field        | Type   | Notes                          |
|--------------|--------|--------------------------------|
| images[]     | file[] | 2-20 images (jpg/png/webp)     |
| layout       | string | horizontal, vertical, grid, automatic-grid, contact-sheet, masonry |
| gap          | int    | 0-100 px                       |
| background   | string | color, e.g. `white` or `#1f1f1f` |
| resizeMode   | string | original, equal-width, equal-height, square, fit-width, fit-height |
| format       | string | jpg, png, webp                 |

Response:

```json
{ "success": true, "imageUrl": "/output/abc123.jpg" }
```

### GET /api/health

Returns backend status and configured magick path.

## Example Request (curl)

```bash
curl -F 'images[]=@a.jpg' -F 'images[]=@b.jpg' \
  -F 'layout=grid' -F 'gap=10' \
  -F 'background=white' -F 'resizeMode=original' \
  -F 'format=jpg' \
  http://localhost:3000/api/collage
```

## Layout Algorithms

- **Grid / Automatic Grid**: rows x cols computed via balanced grid (`cols = ceil(sqrt(n))`).
- **Masonry**: round-robin column distribution, equalized heights.
- **Contact Sheet**: ImageMagick grid of uniform thumbnails.

## Security

- Commands built as argument arrays, executed with `spawn()` (never `exec()`).
- MIME, extension, size, and count validated at the boundary.
- UUID filenames; upload directory traversal prevented.
- Temporary uploads deleted after generation.

## Troubleshooting

- `magick: command not found` — install ImageMagick or set `MAGICK_PATH`.
- `Generation failed` — check server logs; ensure `magick` supports the chosen format.
- Upload rejected — verify file type/size against `.env` limits.
