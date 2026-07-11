// Static preview that mirrors the collage layout exactly.
import { useRef, useState, useEffect } from 'react';
import { GAP, OUTER_PADDING } from '../utils/constants.js';

function gridCols(count) {
  return Math.ceil(Math.sqrt(count));
}

function chunkRows(items, cols) {
  const rows = [];
  for (let i = 0; i < items.length; i += cols) rows.push(items.slice(i, i + cols));
  return rows;
}

function masonryColumns(items, cols) {
  const colsArr = Array.from({ length: cols }, () => []);
  items.forEach((it, i) => colsArr[i % cols].push(it));
  return colsArr;
}

function cellOf(it) {
  return it.size || { w: 200, h: 200 };
}

function stretchedSizes(items) {
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

function totals(items, layout) {
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
  const ss = stretchedSizes(items);
  const rows = chunkRows(items, gridCols(n));
  const rowW = rows.map((r) => r.reduce((s, it) => s + ss[items.indexOf(it)].w, 0) + g(r.length));
  const rowH = rows.map((r) => Math.max(...r.map((it) => ss[items.indexOf(it)].h)));
  return { width: Math.max(...rowW) + pad, height: rowH.reduce((s, h) => s + h, 0) + g(rows.length) + pad };
}

function Layout({ items, layout, background, total }) {
  const gap = { gap: `${GAP}px` };
  const row = { ...gap, display: 'flex', flexDirection: 'row', alignItems: 'flex-start' };
  const col = { ...gap, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
  const box = { background, padding: `${OUTER_PADDING}px`, width: total.width || '100%', height: total.height || 'auto' };

  if (layout === 'horizontal') {
    return <div style={{ ...box, ...row }}>{items.map((it) => <img key={it.id} src={it.preview} alt={it.name} style={{ width: cellOf(it).w, height: cellOf(it).h }} className="object-cover border border-[var(--border)]" draggable="false" />)}</div>;
  }
  if (layout === 'vertical') {
    return <div style={{ ...box, ...col }}>{items.map((it) => <img key={it.id} src={it.preview} alt={it.name} style={{ width: cellOf(it).w, height: cellOf(it).h }} className="object-cover border border-[var(--border)]" draggable="false" />)}</div>;
  }
  if (layout === 'masonry') {
    const cols = masonryColumns(items, gridCols(items.length));
    return (
      <div style={{ ...box, ...row }}>
        {cols.map((c, i) => (
          <div key={i} style={col}>{c.map((it) => <img key={it.id} src={it.preview} alt={it.name} style={{ width: cellOf(it).w, height: cellOf(it).h }} className="object-cover border border-[var(--border)]" draggable="false" />)}</div>
        ))}
      </div>
    );
  }
  if (layout === 'contact-sheet') {
    return (
      <div style={{ ...box, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 120px)', gap: `${GAP}px` }}>
        {items.map((it) => (
          <img key={it.id} src={it.preview} alt={it.name} style={{ width: 120, height: 120 }} className="object-cover border border-[var(--border)]" draggable="false" />
        ))}
      </div>
    );
  }
  const ss = stretchedSizes(items);
  const rows = chunkRows(items, gridCols(items.length));
  return (
    <div style={{ ...box, ...col }}>
      {rows.map((r, i) => (
        <div key={i} style={row}>
          {r.map((it) => <img key={it.id} src={it.preview} alt={it.name} style={{ width: ss[items.indexOf(it)].w, height: ss[items.indexOf(it)].h }} className="object-cover border border-[var(--border)]" draggable="false" />)}
        </div>
      ))}
    </div>
  );
}

export default function ImageList({ items, layout, background }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  const total = layout === 'contact-sheet' ? { width: 0, height: 0 } : totals(items, layout);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || total.width === 0) return;
    const parent = el.parentElement;
    const update = () => {
      const avail = parent ? parent.clientWidth : el.clientWidth;
      setScale(Math.min(1, (avail - 32) / total.width));
    };
    update();
    const ro = new ResizeObserver(update);
    if (parent) ro.observe(parent);
    return () => ro.disconnect();
  }, [total.width]);

  if (!items.length) return null;

  return (
    <div ref={wrapRef} className="inline-block">
      <div style={{ width: total.width ? total.width * scale : '100%', height: total.height ? total.height * scale : 'auto' }}>
        <div style={{ width: total.width || '100%', height: total.height || 'auto', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <Layout items={items} layout={layout} background={background} total={total} />
        </div>
      </div>
    </div>
  );
}
