// ImageMagick service: builds argument arrays and executes the CLI via spawn.
import { spawn } from 'child_process';
import config from '../config.js';
import { balancedGrid, chunkRows, masonryColumns } from '../utils/layout.js';
import { validateOptions } from '../utils/validate.js';

const BEST_QUALITY = 100;
const GAP = 24;            // hard-coded internal gap between images
const OUTER_PADDING = 48;  // hard-coded outer padding around the collage


const BASE = {
  'equal-width': 800,
  'equal-height': 800,
  square: 600,
  'fit-width': 1200,
  'fit-height': 1200,
};

// Per-input resize prefix applied immediately before each input file.
function resizePrefix(mode) {
  switch (mode) {
    case 'equal-width':
      return ['-resize', `${BASE['equal-width']}x`];
    case 'equal-height':
      return ['-resize', `x${BASE['equal-height']}`];
    case 'square':
      return [
        '-thumbnail', `${BASE.square}x${BASE.square}^`,
        '-gravity', 'center',
        '-extent', `${BASE.square}x${BASE.square}`,
      ];
    case 'fit-width':
      return ['-resize', `${BASE['fit-width']}x`];
    case 'fit-height':
      return ['-resize', `x${BASE['fit-height']}`];
    default:
      return [];
  }
}

// Compute the final canvas size for a layout (mirrors the client preview totals).
function canvasTotals(sizes, layout) {
  const n = sizes.length;
  const g = (k) => GAP * Math.max(0, k - 1);
  const pad = OUTER_PADDING * 2;
  if (layout === 'horizontal') {
    return {
      width: sizes.reduce((s, it) => s + it.w, 0) + g(n) + pad,
      height: Math.max(...sizes.map((it) => it.h)) + pad,
    };
  }
  if (layout === 'vertical') {
    return {
      width: Math.max(...sizes.map((it) => it.w)) + pad,
      height: sizes.reduce((s, it) => s + it.h, 0) + g(n) + pad,
    };
  }
  if (layout === 'masonry') {
    const cols = balancedGrid(n).cols;
    const groups = masonryColumns(sizes.map((_, i) => i), cols);
    const colW = groups.map((c) => Math.max(...c.map((i) => sizes[i].w)));
    const colH = groups.map((c) => c.reduce((s, i) => s + sizes[i].h, 0) + g(c.length));
    return { width: colW.reduce((s, w) => s + w, 0) + g(cols) + pad, height: Math.max(...colH) + pad };
  }
  if (layout === 'contact-sheet') {
    const { cols } = balancedGrid(n);
    const rows = Math.ceil(n / cols);
    return { width: cols * 220 + GAP * (cols - 1) + pad, height: rows * 220 + GAP * (rows - 1) + pad };
  }
  // grid, automatic-grid — stretch last partial row to fill row width
  const { cols } = balancedGrid(n);
  const groups = chunkRows(sizes.map((_, i) => i), cols);
  const eff = sizes.map((s) => ({ ...s }));
  if (groups.length > 1) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup.length < cols) {
      const fullRowWidth = groups[0].reduce((sum, i) => sum + (sizes[i]?.w || 200), 0) + GAP * (cols - 1);
      const stretchedW = Math.round((fullRowWidth - GAP * (lastGroup.length - 1)) / lastGroup.length);
      lastGroup.forEach((i) => { eff[i].w = stretchedW; });
    }
  }
  const rowW = groups.map((r) => r.reduce((sum, i) => sum + eff[i].w, 0) + g(r.length));
  const rowH = groups.map((r) => Math.max(...r.map((i) => eff[i].h)));
  return { width: Math.max(...rowW) + pad, height: rowH.reduce((s, h) => s + h, 0) + g(groups.length) + pad };
}

// Build a single image entry: cover-fit into the cell, padded with background.
function imageEntry(img, mode, size, background) {
  // Explicit drag-resize wins; the image is fit (contained) into the cell and
  // padded with the background so cells are uniform with no blank space.
  const out = [img];
  if (size && size.w > 0 && size.h > 0) {
    out.push('-resize', `${Math.round(size.w)}x${Math.round(size.h)}^`);
    out.push('-background', background, '-gravity', 'center', '-extent', `${Math.round(size.w)}x${Math.round(size.h)}`);
  } else {
    out.push(...resizePrefix(mode));
  }
  return out;
}

// Build the magick argument array (without the command name).
export function buildArgs(opts) {
  const { images, layout, background, resizeMode } = opts;
  const sizes = opts.sizes || [];
  const sizeAt = (i) => sizes[i];
  const output = opts.outputName;
  const mode = resizeMode;
  const useBgImage = !!opts.backgroundImage;
  // When compositing a custom background image, gaps/extent must be transparent
  // so the uploaded image shows through; otherwise use the solid color.
  const bg = useBgImage ? 'none' : background;
  const args = [];

  if (layout === 'contact-sheet') {
    const { cols } = balancedGrid(images.length);
    const groups = chunkRows(images.map((_, i) => i), cols);
    groups.forEach((g) => {
      args.push('(');
      g.forEach((i) => {
        args.push(images[i]);
        args.push('-thumbnail', '220x220^', '-gravity', 'center', '-extent', '220x220');
      });
      args.push('+smush', String(GAP), ')');
    });
    args.push('-background', bg, '-resize', '%[fx:u.w]', '-smush', String(GAP));
  } else if (layout === 'horizontal') {
    images.forEach((img, i) => args.push(...imageEntry(img, mode, sizeAt(i), bg)));
    args.push('-background', bg, '+smush', String(GAP));
  } else if (layout === 'vertical') {
    images.forEach((img, i) => args.push(...imageEntry(img, mode, sizeAt(i), bg)));
    args.push('-background', bg, '-smush', String(GAP));
  } else if (layout === 'masonry') {
    const { cols } = balancedGrid(images.length);
    const groups = masonryColumns(images.map((_, i) => i), cols);
    groups.forEach((g) => {
      args.push('(');
      g.forEach((i) => args.push(...imageEntry(images[i], mode, sizeAt(i), bg)));
      args.push('-background', bg, '-smush', String(GAP), ')');
    });
    args.push('-background', bg, '+smush', String(GAP));
  } else {
    // grid, automatic-grid — stretch last partial row to fill row width
    const { cols } = balancedGrid(images.length);
    const groups = chunkRows(images.map((_, i) => i), cols);
    const effectiveSizes = sizes.map((s) => ({ ...s }));
    if (groups.length > 1) {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup.length < cols) {
        const fullRowWidth = groups[0].reduce((sum, i) => sum + (sizes[i]?.w || 200), 0) + GAP * (cols - 1);
        const stretchedW = Math.round((fullRowWidth - GAP * (lastGroup.length - 1)) / lastGroup.length);
        lastGroup.forEach((i) => { effectiveSizes[i].w = stretchedW; });
      }
    }
    groups.forEach((g) => {
      args.push('(');
      g.forEach((i) => args.push(...imageEntry(images[i], mode, effectiveSizes[i], bg)));
      args.push('+smush', String(GAP), ')');
    });
    args.push('-background', bg, '-smush', String(GAP));
  }

  if (useBgImage) {
    // Transparent outer padding, then composite the uploaded image behind.
    args.push('-background', 'none', '-bordercolor', 'none', '-border', String(OUTER_PADDING));
    const { width, height } = canvasTotals(sizes, layout);
    return [
      '(', opts.backgroundImage, '-resize', `${width}x${height}^`, '-gravity', 'center', '-extent', `${width}x${height}`, ')',
      '(', ...args, ')',
      '-composite', '-quality', String(BEST_QUALITY), output,
    ];
  }

  args.push('-background', background, '-bordercolor', background, '-border', String(OUTER_PADDING));
  args.push('-quality', String(BEST_QUALITY), output);
  return args;
}

export async function runMagick(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(config.magickPath, args);
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString(); });
    child.on('error', (err) => reject(err));
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr || `magick exited with code ${code}`));
    });
    setTimeout(() => {
      child.kill('SIGKILL');
      reject(new Error('ImageMagick timed out'));
    }, 60000);
  });
}

// Validate, build, run, and return the generated output filename.
export async function generateCollage(opts) {
  const errors = validateOptions(opts);
  if (errors.length) throw new Error(errors.join('; '));
  const args = buildArgs(opts);
  await runMagick(args);
  return opts.outputName;
}
