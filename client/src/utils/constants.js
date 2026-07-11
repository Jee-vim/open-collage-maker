// Shared constants for the app.

export const PRESETS = [
  { value: 'instagram', label: 'Instagram Grid', opts: { layout: 'grid' }, slots: 9 },
  { value: 'pinterest', label: 'Pinterest Style', opts: { layout: 'masonry' }, slots: 6 },
  { value: 'contact', label: 'Contact Sheet', opts: { layout: 'contact-sheet' }, slots: 9 },
  { value: 'film', label: 'Film Strip', opts: { layout: 'horizontal' }, slots: 6 },
  { value: 'polaroid', label: 'Polaroid Stack', opts: { layout: 'grid' }, slots: 3 },
];

export function slotsFor(value) {
  const found = PRESETS.find((p) => p.value === value);
  return found ? found.slots : 0;
}

export const DEFAULT_SETTINGS = {
  background: '#ffffff',
};

// Hard-coded layout metrics (must match the backend).
export const GAP = 10;
export const OUTER_PADDING = 20;

export const MAX_FILES = 20;
