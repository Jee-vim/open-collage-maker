# Collage Maker 

Vite + React + Tailwind CSS frontend for the Web Photo Collage Maker.

## Stack

- **Vite** — build tool
- **React 18** — UI
- **Tailwind CSS** — utility-first styling
- **dnd-kit** — drag-to-reorder thumbnails
- **react-dropzone** — file upload

## Design System

The UI uses a **compact, grid/border-based** design. No rounded corners, no heavy shadows, no decorative elements. Everything is separated by 1px borders.

### CSS Variables (index.css)

```css
--border:  /* section borders, dividers */
--bg:      /* page background */
--bg-inset: /* header bg, hover states */
--text:    /* primary text */
--text-muted: /* labels, hints */
--accent:  /* selected/active border, button bg */
--accent-fg: /* button text on accent bg */
```

Dark mode toggles all variables via `.dark` class on `<html>`.

### Layout Structure

```
Header          — thin top bar, title + theme toggle
Section         — bordered box with header label + body
  Upload        — dashed dropzone
  Settings      — inline controls (preset cards, background color)
  Preview       — scaled collage preview + generate button in header
```

Every section uses the same pattern:
```html
<div class="section">
  <div class="section-header">LABEL</div>
  <div class="section-body">content</div>
</div>
```

### Components

| File | Role |
|------|------|
| `App.jsx` | Root — state, auto-preset, generate |
| `Header.jsx` | Top bar — title, theme toggle |
| `Dropzone.jsx` | File upload — react-dropzone, dashed border |
| `SettingsPanel.jsx` | Preset visual cards + background color picker |
| `ImageList.jsx` | Preview grid — totals, scaling, dnd-kit, thumbnails |
| `Toast.jsx` | Bottom-right notification |

### Preset Selector

Horizontal scrollable row of small preview cards (16×12 each). Each card shows a mini icon of the layout pattern (colored blocks). Selected card gets accent border. Background of each card matches the preset's background color.

Presets auto-select on initial image upload based on count:
- 2-3 images → Film Strip (horizontal)
- 4-6 → Instagram Grid (grid)
- 7-12 → Pinterest (masonry)
- 13+ → Contact Sheet (tiles)

### Preview (ImageList)

- Scales to fit container width via `ResizeObserver` + CSS `transform: scale()`
- Matches ImageMagick output exactly (same GAP=10, OUTER_PADDING=20)
- Grid layout stretches last partial row to fill width (no blank cells)
- Thumbnails have bordered cells, `⠿` drag handle, `✕` remove button
- All images use `object-cover` (200×200 default, auto-crop to fill)

### Thumbnails

- Bordered cells (no rounded corners)
- Drag handle: `⠿` (top-left, bordered)
- Remove: `✕` (top-right, bordered)
- Image fills cell via `object-cover`

## File Structure

```
src/
  App.jsx
  main.jsx
  index.css
  api/
    collage.js          — POST to backend
  components/
    Header.jsx
    Dropzone.jsx
    SettingsPanel.jsx
    ImageList.jsx
    Toast.jsx
  hooks/
    useTheme.js         — dark/light toggle, localStorage
  utils/
    constants.js        — GAP, OUTER_PADDING, MAX_FILES, PRESETS
```

## Constants (constants.js)

```js
GAP = 10            // internal gap between images
OUTER_PADDING = 20  // outer padding around collage
MAX_FILES = 30
PRESETS = [ ... ]   // value, label, opts (layout, background)
```
