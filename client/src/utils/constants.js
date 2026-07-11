// Shared option constants for the UI.

export const LAYOUTS = [
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
  { value: 'grid', label: 'Grid' },
  { value: 'automatic-grid', label: 'Automatic Grid' },
  { value: 'contact-sheet', label: 'Contact Sheet' },
  { value: 'masonry', label: 'Masonry Rows' },
];

export const RESIZE_MODES = [
  { value: 'original', label: 'Original' },
  { value: 'equal-width', label: 'Equal Width' },
  { value: 'equal-height', label: 'Equal Height' },
  { value: 'square', label: 'Square Thumbnail' },
  { value: 'fit-width', label: 'Fit Width' },
  { value: 'fit-height', label: 'Fit Height' },
];

export const FORMATS = [
  { value: 'jpg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WEBP' },
];

export const PRESETS = [
  { value: 'instagram', label: 'Instagram Grid', opts: { layout: 'grid', gap: 4, background: 'white', resizeMode: 'square' } },
  { value: 'pinterest', label: 'Pinterest Style', opts: { layout: 'masonry', gap: 12, background: '#1f1f1f', resizeMode: 'fit-width' } },
  { value: 'contact', label: 'Contact Sheet', opts: { layout: 'contact-sheet', gap: 8, background: 'black', resizeMode: 'fit-width' } },
  { value: 'film', label: 'Film Strip', opts: { layout: 'horizontal', gap: 0, background: 'black', resizeMode: 'equal-height' } },
  { value: 'polaroid', label: 'Polaroid Stack', opts: { layout: 'grid', gap: 16, background: 'white', resizeMode: 'square' } },
];

export const DEFAULT_SETTINGS = {
  background: '#ffffff',
};

// Hard-coded layout metrics (must match the backend in server/services/imagemagick.js).
export const GAP = 10;
export const OUTER_PADDING = 20;

export const MAX_FILES = 20;
