// Layout calculation functions — shared between preview and backend logic.
import { GAP, OUTER_PADDING } from './constants.js';

export function gridCols(count) {
  return Math.ceil(Math.sqrt(count));
}

export function chunkRows(items, cols) {
  const rows = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return rows;
}

export function masonryColumns(items, cols) {
  const colsArr = Array.from({ length: cols }, () => []);
  items.forEach((it, i) => colsArr[i % cols].push(it));
  return colsArr;
}

export function cellOf(it) {
  return it.size || { w: 200, h: 200 };
}

// Stretch a partial last grid row to fill the full row width (no blanks).
export function stretchedSizes(items) {
  const sizes = items.map((i) => cellOf(i));
  const cols = gridCols(items.length);
  const rows = chunkRows(items, cols);
  if (rows.length < 2) return sizes;
  const lastRow = rows[rows.length - 1];
  if (lastRow.length === cols) return sizes;
  const fullRowWidth = rows[0].reduce((s, it) => s + cellOf(it).w, 0) + GAP * (cols - 1);
  const lastCount = lastRow.length;
  const stretchedW = Math.round((fullRowWidth - GAP * (lastCount - 1)) / lastCount);
  return items.map((it) =>
    lastRow.some((x) => x.id === it.id) ? { w: stretchedW, h: cellOf(it).h } : cellOf(it)
  );
}

// Total pixel dimensions for a given layout.
export function totals(items, layout) {
  const n = items.length;
  const g = (k) => GAP * Math.max(0, k - 1);
  const pad = OUTER_PADDING * 2;

  if (layout === 'horizontal') {
    return {
      width: items.reduce((s, it) => s + cellOf(it).w, 0) + g(n) + pad,
      height: Math.max(...items.map((it) => cellOf(it).h)) + pad,
    };
  }
  if (layout === 'vertical') {
    return {
      width: Math.max(...items.map((it) => cellOf(it).w)) + pad,
      height: items.reduce((s, it) => s + cellOf(it).h, 0) + g(n) + pad,
    };
  }
  if (layout === 'masonry') {
    const cols = masonryColumns(items, gridCols(n));
    const colW = cols.map((c) => Math.max(...c.map((it) => cellOf(it).w)));
    const colH = cols.map((c) => c.reduce((s, it) => s + cellOf(it).h, 0) + g(c.length));
    return { width: colW.reduce((s, w) => s + w, 0) + g(cols.length) + pad, height: Math.max(...colH) + pad };
  }
  // grid — stretched last row fills full width
  const ss = stretchedSizes(items);
  const rows = chunkRows(items, gridCols(n));
  const rowW = rows.map((r) => r.reduce((s, it) => s + ss[items.indexOf(it)].w, 0) + g(r.length));
  const rowH = rows.map((r) => Math.max(...r.map((it) => ss[items.indexOf(it)].h)));
  return { width: Math.max(...rowW) + pad, height: rowH.reduce((s, h) => s + h, 0) + g(rows.length) + pad };
}
