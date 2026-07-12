# Collage Maker — Client

Vite + React frontend for the Web Photo Collage Maker.

## Stack

- Vite + React 18
- Tailwind CSS
- dnd-kit — drag-to-reorder thumbnails
- react-dropzone — file upload
- axios — calls the backend API

## Flow

1. Pick a **layout** first (preset cards in the sidebar).
2. Each layout shows fixed slots. Click a slot's `+` to add an image, or use the
   Dropzone / "Add images" to fill several at once.
3. Reorder thumbnails in the sidebar (drag handle).
4. **Generate** renders the collage on the backend and downloads the result.

Images are placed into uniform `CELL_SIZE` (1080×1080) square cells, cover-cropped
to fill. `GAP` and `OUTER_PADDING` in `src/utils/constants.js` must match the
backend so the preview matches the exported file.

## Env

| Var | Purpose |
|-----|---------|
| `VITE_API_URL` | Backend base URL (e.g. `https://api.example.com`). Empty = same-origin (`/api`). |

## Scripts

```bash
npm install
npm run dev      # dev server
npm run build    # production build -> dist/
```
