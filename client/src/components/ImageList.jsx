// Interactive layout board. Shows fixed slots for the chosen layout;
// empty slots expose a "+" to add an image.
import { useRef, useState, useEffect } from 'react';
import { GAP, OUTER_PADDING } from '../utils/constants.js';
import { gridCols, chunkRows, masonryColumns, cellOf, stretchedSizes, totals } from '../utils/layout.js';

function cellSize(it, layout) {
  if (layout === 'contact-sheet') return { w: 120, h: 120 };
  return cellOf(it);
}

function Slot({ index, size, onAdd }) {
  return (
    <button
      onClick={() => onAdd(index)}
      style={{ width: size.w, height: size.h }}
      className="slot"
      title="Add image"
      type="button"
    >
      <span className="slot-plus">+</span>
    </button>
  );
}

function Cell({ it, index, size, onAdd }) {
  if (it.placeholder) {
    return <Slot index={index} size={size} onAdd={onAdd} />;
  }
  return (
    <div className="cell-filled" style={{ width: size.w, height: size.h }}>
      <img src={it.preview} alt={it.name} className="object-cover absolute inset-0 w-full h-full block" draggable="false" />
    </div>
  );
}

function Layout({ cells, layout, background, total, onAdd, backgroundImage }) {
  const gap = { gap: `${GAP}px` };
  const row = { ...gap, display: 'flex', flexDirection: 'row', alignItems: 'flex-start' };
  const col = { ...gap, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
  const box = { background, padding: `${OUTER_PADDING}px`, width: total.width || '100%', height: total.height || 'auto' };
  if (backgroundImage) {
    box.backgroundImage = `url(${backgroundImage})`;
    box.backgroundSize = 'cover';
    box.backgroundPosition = 'center';
    box.backgroundRepeat = 'no-repeat';
  }
  const sizeOf = (it, i) => cellSize(it, layout);

  if (layout === 'horizontal') {
    return (
      <div style={{ ...box, ...row }}>
        {cells.map((it, i) => <Cell key={i} it={it} index={i} size={sizeOf(it, i)} onAdd={onAdd} />)}
      </div>
    );
  }
  if (layout === 'vertical') {
    return (
      <div style={{ ...box, ...col }}>
        {cells.map((it, i) => <Cell key={i} it={it} index={i} size={sizeOf(it, i)} onAdd={onAdd} />)}
      </div>
    );
  }
  if (layout === 'masonry') {
    const cols = masonryColumns(cells, gridCols(cells.length));
    return (
      <div style={{ ...box, ...row }}>
        {cols.map((c, i) => (
          <div key={i} style={col}>
            {c.map((it) => {
              const idx = cells.indexOf(it);
              return <Cell key={idx} it={it} index={idx} size={sizeOf(it, idx)} onAdd={onAdd} />;
            })}
          </div>
        ))}
      </div>
    );
  }
  if (layout === 'contact-sheet') {
    return (
      <div style={{ ...box, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 120px)', gap: `${GAP}px` }}>
        {cells.map((it, i) => <Cell key={i} it={it} index={i} size={sizeOf(it, i)} onAdd={onAdd} />)}
      </div>
    );
  }
  const ss = stretchedSizes(cells);
  const rows = chunkRows(cells, gridCols(cells.length));
  return (
    <div style={{ ...box, ...col }}>
      {rows.map((r, i) => (
        <div key={i} style={row}>
          {r.map((it) => {
            const idx = cells.indexOf(it);
            return <Cell key={idx} it={it} index={idx} size={ss[idx]} onAdd={onAdd} />;
          })}
        </div>
      ))}
    </div>
  );
}

export default function ImageList({ items, layout, background, slots, cellSize, onAddSlot, backgroundImage }) {
  const wrapRef = useRef(null);
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [scale, setScale] = useState(1);

  const cells = Array.from({ length: slots }, (_, i) =>
    items[i] || { id: `slot_${i}`, placeholder: true, index: i, size: cellSize }
  );

  const total = layout === 'contact-sheet' ? { width: 0, height: 0 } : totals(cells, layout);

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

  const openPicker = (target) => {
    setPending(target);
    fileRef.current?.click();
  };

  const onFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    if (!files.length) return;
    if (typeof pending === 'number') onAddSlot(pending, files);
    setPending(null);
  };

  if (!items.length && slots === 0) return null;

  return (
    <div ref={wrapRef} className="inline-block">
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onFiles} />
      <div style={{ width: total.width ? total.width * scale : '100%', height: total.height ? total.height * scale : 'auto' }}>
          <div style={{ width: total.width || '100%', height: total.height || 'auto', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <Layout cells={cells} layout={layout} background={background} total={total} onAdd={openPicker} backgroundImage={backgroundImage} />
          </div>
        </div>
    </div>
  );
}
