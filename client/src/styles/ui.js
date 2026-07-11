// Reusable style patterns — single source of truth.
// Edit here to change the entire app's look.

export const ui = {
  // Layout
  sidebar: 'w-80 flex-shrink-0 border-r border-border flex flex-col overflow-y-auto',
  main: 'flex-1 min-w-0 flex items-center justify-center p-8 overflow-auto bg-bg-1',

  // Sections
  section: 'p-4 border-b border-border',
  sectionLabel: 'text-xs text-fg-dim',

  // Buttons
  btn: 'h-8 px-4 text-sm font-medium',
  btnPrimary: 'bg-accent text-accent-fg hover:opacity-90 disabled:opacity-30',
  btnGhost: 'text-fg-dim hover:text-fg',

  // Cards / Tiles
  tile: 'overflow-hidden hover:bg-border border',
  tileActive: 'border-accent',

  // Form
  dropzone: 'border border-dashed cursor-pointer text-center py-6 text-sm text-fg-dim hover:bg-bg-2',

  // List
  listItem: 'group flex items-center gap-3 p-2 hover:bg-bg-2',
  listItemRemove: 'text-fg-dim hover:text-fg opacity-0 group-hover:opacity-100 transition-opacity',

  // Image
  thumb: 'w-10 h-10 object-cover flex-shrink-0',
  previewImg: 'object-cover border border-border',
};
