// Boundary validation helpers for collage requests.
import path from 'path';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const ALLOWED_FORMATS = new Set(['jpg', 'png', 'webp']);
const ALLOWED_LAYOUTS = new Set([
  'horizontal',
  'vertical',
  'grid',
  'automatic-grid',
  'contact-sheet',
  'masonry',
]);
const ALLOWED_RESIZE = new Set([
  'original',
  'equal-width',
  'equal-height',
  'square',
  'fit-width',
  'fit-height',
]);

export function clampInt(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function sanitizeFilename(name) {
  if (typeof name !== 'string') return '';
  const base = path.basename(String(name)).replace(/\.[^.]+$/, '');
  const safe = base.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  return safe || '';
}

export function validateFile(file) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
    return `Unsupported file type: ${file.originalname}`;
  }
  return null;
}

export function validateOptions(opts) {
  const errors = [];
  if (opts.images.length < 2) errors.push('At least 2 images required');
  if (!ALLOWED_LAYOUTS.has(opts.layout)) errors.push('Invalid layout');
  if (!ALLOWED_FORMATS.has(opts.format)) errors.push('Invalid format');
  if (!ALLOWED_RESIZE.has(opts.resizeMode)) errors.push('Invalid resize mode');
  return errors;
}

export { ALLOWED_FORMATS };
