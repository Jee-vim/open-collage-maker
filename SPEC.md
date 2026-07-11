# Build a Web Photo Collage Maker Using ImageMagick CLI

## Overview

Build a modern full-stack web application that creates beautiful photo collages using the **ImageMagick CLI (`magick`)** for all image processing.

Do **NOT** use image processing libraries like:

- Sharp
- Jimp
- Canvas
- Fabric.js
- GraphicsMagick Node wrappers

All collage generation must be performed by executing the **ImageMagick CLI** from the backend.

---

# Tech Stack

## Frontend

- Vite
- React
- Tailwind CSS
- Axios
- Radix ui
- React Dropzone
- React DnD (or dnd-kit) for image reordering

## Backend

- Node.js
- Express.js
- Multer
- UUID
- Child Process (`spawn`)
- dotenv

---

# Project Structure

```
photo-collage-maker/

├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── utils/
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── uploads/
│   ├── output/
│   ├── temp/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── app.js
│   └── package.json
│
├── README.md
└── .env.example
```

---

# Application Features

## Image Upload

Users should be able to:

- Drag & drop images
- Browse files
- Upload multiple images
- Remove uploaded images
- Preview thumbnails
- Reorder images via drag & drop

Supported formats:

- JPG
- JPEG
- PNG
- WEBP

Limit:

- 2–20 images
- Maximum upload size configurable through `.env`

---

# Collage Settings

## Layout

Support the following layouts:

- Horizontal
- Vertical
- Grid
- Automatic Grid
- Contact Sheet
- Masonry-like rows
- Custom Grid

---

## UI
Always use lib from radix
All style centrelize no shadow

## Gap

Slider

```
0–100 px
```

Maps to ImageMagick:

```bash
+smush GAP
```

or

```bash
-smush GAP
```

depending on layout.

---

## Background Color

Color picker.

Produces:

```bash
-background white
```

or

```bash
-background "#1f1f1f"
```

---

## Border

Slider

```
0–100 px
```

Produces:

```bash
-bordercolor white
-border 20
```

---

## Resize Mode

Options

- Original
- Equal Width
- Equal Height
- Square Thumbnail
- Fit Width
- Fit Height

---

## Output Format

Choose:

- JPG
- PNG
- WEBP

---

## Quality

Slider

```
50–100
```

Produces:

```bash
-quality 90
```

---

## Output Filename

Optional custom filename.

If empty:

Generate UUID filename.

---

# ImageMagick Requirements

The backend must dynamically construct ImageMagick commands.

Example:

```bash
magick lake.jpg \
  \( gruvbox-bw.jpg gruvbox-nvim.png +smush 20 \) \
  -resize %[fx:u.w] \
  -background white \
  -smush 20 \
  -bordercolor white \
  -border 20 \
  output_grid.jpg
```

The application should generate commands automatically based on:

- uploaded images
- layout
- spacing
- border
- background
- resize mode

---

# Layout Algorithms

## Horizontal

Generate

```bash
magick \
img1 \
img2 \
img3 \
+smush GAP \
output.jpg
```

---

## Vertical

Generate

```bash
magick \
img1 \
img2 \
img3 \
-smush GAP \
output.jpg
```

---

## Grid

Automatically calculate rows and columns.

Example

6 images

```
1 2 3
4 5 6
```

Generate

```bash
magick \
\( img1 img2 img3 +smush GAP \) \
\( img4 img5 img6 +smush GAP \) \
-resize %[fx:u.w] \
-background white \
-smush GAP \
-bordercolor white \
-border BORDER \
output.jpg
```

Rows should automatically be calculated.

Use a balanced grid:

Examples

```
2 images
1x2

3 images
2x2

4 images
2x2

5 images
2x3

6 images
2x3

7 images
3x3

8 images
3x3

9 images
3x3

10 images
3x4
```

---

# Backend API

## Upload & Generate

```
POST /api/collage
```

Content-Type

```
multipart/form-data
```

Fields

```
images[]
layout
gap
border
background
resizeMode
quality
format
filename
```

Response

```json
{
  "success": true,
  "imageUrl": "/output/abc123.jpg"
}
```

Error

```json
{
  "success": false,
  "message": "Generation failed"
}
```

---

# Backend Architecture

Create a dedicated ImageMagick service.

```
services/imagemagick.js
```

Responsibilities

- validate inputs
- generate ImageMagick arguments
- execute ImageMagick
- return output filename

Routes should contain minimal logic.

Business logic belongs inside services.

---

# Important Security Requirements

Never execute shell strings.

Do NOT do:

```js
exec("magick ...")
```

Always use

```js
spawn("magick", args)
```

with an array of arguments.

Validate

- MIME type
- extension
- file size
- upload count

Generate UUID filenames.

Prevent directory traversal.

Delete temporary uploads after generation.

---

# Frontend UI

Design a clean modern interface using Tailwind CSS.

Layout

```
--------------------------------------------------

Photo Collage Maker

--------------------------------------------------

Upload Images

[ Dropzone ]

--------------------------------------------------

Image Preview

[ ] [ ] [ ] [ ]

Drag to reorder

--------------------------------------------------

Settings

Layout

Gap

Border

Background

Resize

Output Format

Quality

Filename

--------------------------------------------------

Generate Collage

--------------------------------------------------

Loading Spinner

--------------------------------------------------

Generated Result

Preview

Download Button

Copy URL Button

--------------------------------------------------
```

Responsive design required.

---

# User Experience

Implement

- upload progress
- loading indicator
- success notification
- error notification
- disabled Generate button while processing

Display readable errors.

---

# Output Page

Display

Large preview

Buttons

- Download
- Open Image
- Generate Again

---

# Bonus Features

Implement as many as possible.

## Presets

- Instagram Grid
- Pinterest Style
- Contact Sheet
- Film Strip
- Polaroid Stack

---

## Styling

Support

- rounded corners
- shadows
- white border
- black border
- transparent background
- automatic padding

---

## Image Options

Allow

- rotate
- flip
- grayscale
- brightness
- contrast

using ImageMagick CLI options.

---

## Watermark

Optional text watermark.

---

## Batch Download

Allow downloading generated images as ZIP.

---

## History

Show recent generated collages.

---

## Dark Mode

Implement dark/light themes.

---

# Environment Variables

Create `.env.example`

```
PORT=3000

UPLOAD_DIR=uploads

OUTPUT_DIR=output

TEMP_DIR=temp

MAX_UPLOAD_SIZE=10485760

MAX_FILES=20

MAGICK_PATH=magick
```

---

# Code Quality

Requirements

- ES Modules
- Async/Await
- Modular architecture
- Reusable React components
- Reusable Express services
- Clear folder structure
- Well-commented code
- Error handling everywhere
- No duplicated logic

---

# README

Include

- prerequisites
- ImageMagick installation
- development setup
- production build
- environment variables
- API documentation
- example requests
- troubleshooting

---

# Deliverables

Generate a complete production-ready project including:

- Express backend
- Vite + React frontend
- Tailwind CSS setup
- Multer upload handling
- ImageMagick command builder
- Dynamic layout generation
- Grid algorithm
- Download endpoint
- Static file serving
- Responsive UI
- Complete README
- `.env.example`

The generated project should be clean, modular, maintainable, and production-ready. All image processing must be performed exclusively through the ImageMagick CLI using `spawn()` with argument arrays for security.
