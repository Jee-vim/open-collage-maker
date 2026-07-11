// Shared constants for the app.

export const PRESETS = [
  { value: 'instagram', label: 'Instagram Grid', opts: { layout: 'grid' } },
  { value: 'pinterest', label: 'Pinterest Style', opts: { layout: 'masonry' } },
  { value: 'contact', label: 'Contact Sheet', opts: { layout: 'contact-sheet' } },
  { value: 'film', label: 'Film Strip', opts: { layout: 'horizontal' } },
  { value: 'polaroid', label: 'Polaroid Stack', opts: { layout: 'grid' } },
];

export const DEFAULT_SETTINGS = {
  background: '#ffffff',
};

// Hard-coded layout metrics (must match the backend).
export const GAP = 10;
export const OUTER_PADDING = 20;

export const MAX_FILES = 20;
