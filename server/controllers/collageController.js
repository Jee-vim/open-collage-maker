// Collage generation controller. Routes stay minimal; logic lives here.
import fs from 'fs';
import path from 'path';
import config from '../config.js';
import { generateCollage } from '../services/imagemagick.js';
import { clampInt } from '../utils/validate.js';

function cleanup(files) {
  files.forEach((f) => {
    fs.unlink(f.path, () => {});
  });
}

function parseSizes(raw) {
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr.map((s) => ({ w: Number(s.w) || 0, h: Number(s.h) || 0 }));
    }
  } catch {
    /* ignore */
  }
  return [];
}

export async function createCollage(req, res) {
  const files = req.files || [];
  if (files.length < 2) {
    cleanup(files);
    return res.status(400).json({ success: false, message: 'Upload 2 to 20 images' });
  }

  const format = (req.body.format || 'png').toLowerCase();
  const pad = (n) => String(n).padStart(2, '0');
  const d = new Date();
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  const base = (req.body.preset || req.body.layout || 'collage').replace(/[^a-z0-9-]/gi, '');
  const outputName = `${base}-${stamp}.${format}`;
  const outputPath = path.join(config.outputDir, outputName);

  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  const opts = {
    images: files.map((f) => f.path),
    sizes: parseSizes(req.body.sizes),
    layout: req.body.layout || 'grid',
    gap: clampInt(req.body.gap, 0, 100, 10),
    background: req.body.background || 'white',
    resizeMode: req.body.resizeMode || 'original',
    format,
    outputName: outputPath,
  };

  try {
    await generateCollage(opts);
    cleanup(files);
    return res.json({ success: true, imageUrl: `/output/${outputName}` });
  } catch (err) {
    cleanup(files);
    return res.status(500).json({ success: false, message: err.message || 'Generation failed' });
  }
}
