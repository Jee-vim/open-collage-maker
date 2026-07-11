// Static preview that mirrors the collage layout exactly.
import { useRef, useState, useEffect } from 'react';
import { GAP, OUTER_PADDING } from '../utils/constants.js';
import { gridCols, chunkRows, masonryColumns, cellOf, stretchedSizes, totals } from '../utils/layout.js';

function Layout({ items, layout, background, total }) {
  const gap = { gap: `${GAP}px` };
  const row = { ...gap, display: 'flex', flexDirection: 'row', alignItems: 'flex-start' };
  const col = { ...gap, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
  const box = { background, padding: `${OUTER_PADDING}px`, width: total.width || '100%', height: total.height || 'auto' };

  if (layout === 'horizontal') {
    return <div style={{ ...box, ...row }}>{items.map((it) => <img key={it.id} src={it.preview} alt={it.name} style={{ width: cellOf(it).w, height: cellOf(it).h }} className="object-cover border border-border" draggable="false" />)}</div>;
  }
  if (layout === 'vertical') {
    return <div style={{ ...box, ...col }}>{items.map((it) => <img key={it.id} src={it.preview} alt={it.name} style={{ width: cellOf(it).w, height: cellOf(it).h }} className="object-cover border border-border" draggable="false" />)}</div>;
  }
  if (layout === 'masonry') {
    const cols = masonryColumns(items, gridCols(items.length));
    return (
      <div style={{ ...box, ...row }}>
        {cols.map((c, i) => (
          <div key={i} style={col}>{c.map((it) => <img key={it.id} src={it.preview} alt={it.name} style={{ width: cellOf(it).w, height: cellOf(it).h }} className="object-cover border border-border" draggable="false" />)}</div>
        ))}
      </div>
    );
  }
  if (layout === 'contact-sheet') {
    return (
      <div style={{ ...box, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 120px)', gap: `${GAP}px` }}>
        {items.map((it) => (
          <img key={it.id} src={it.preview} alt={it.name} style={{ width: 120, height: 120 }} className="object-cover border border-border" draggable="false" />
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
          {r.map((it) => <img key={it.id} src={it.preview} alt={it.name} style={{ width: ss[items.indexOf(it)].w, height: ss[items.indexOf(it)].h }} className="object-cover border border-border" draggable="false" />)}
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
