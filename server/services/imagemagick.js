// ImageMagick service: builds argument arrays and executes the CLI via spawn.
import { spawn } from 'child_process';
import config from '../config.js';
import { balancedGrid, chunkRows, masonryColumns } from '../utils/layout.js';
import { validateOptions } from '../utils/validate.js';

const BEST_QUALITY = 100;
const GAP = 10;            // hard-coded internal gap between images
const OUTER_PADDING = 20;  // hard-coded outer padding around the collage


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
  const { images, layout, background, resizeMode, format } = opts;
  const sizes = opts.sizes || [];
  const sizeAt = (i) => sizes[i];
  const output = opts.outputName;
  const mode = resizeMode;
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
    args.push('-background', background, '-resize', '%[fx:u.w]', '-smush', String(GAP));
    args.push('-quality', String(BEST_QUALITY), '-bordercolor', background, '-border', String(OUTER_PADDING), output);
    return args;
  }

  if (layout === 'horizontal') {
    images.forEach((img, i) => args.push(...imageEntry(img, mode, sizeAt(i), background)));
    args.push('-background', background, '+smush', String(GAP));
  } else if (layout === 'vertical') {
    images.forEach((img, i) => args.push(...imageEntry(img, mode, sizeAt(i), background)));
    args.push('-background', background, '-smush', String(GAP));
  } else if (layout === 'masonry') {
    const { cols } = balancedGrid(images.length);
    const groups = masonryColumns(images.map((_, i) => i), cols);
    groups.forEach((g) => {
      args.push('(');
      g.forEach((i) => args.push(...imageEntry(images[i], mode, sizeAt(i), background)));
      args.push('-background', background, '-smush', String(GAP), ')');
    });
    args.push('-background', background, '+smush', String(GAP));
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
      g.forEach((i) => args.push(...imageEntry(images[i], mode, effectiveSizes[i], background)));
      args.push('+smush', String(GAP), ')');
    });
    args.push('-background', background, '-smush', String(GAP));
  }

  args.push('-quality', String(BEST_QUALITY), '-bordercolor', background, '-border', String(OUTER_PADDING), output);
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
