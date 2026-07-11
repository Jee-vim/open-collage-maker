// Reorderable preview that mirrors the collage layout exactly.
import { useRef, useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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

// Stretch a partial last grid row so it fills the full row width (no blank cells).
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
  // grid — stretched last row fills full width
  const ss = stretchedSizes(items);
  const rows = chunkRows(items, gridCols(n));
  const rowW = rows.map((r) => r.reduce((s, it) => s + ss[items.indexOf(it)].w, 0) + g(r.length));
  const rowH = rows.map((r) => Math.max(...r.map((it) => ss[items.indexOf(it)].h)));
  return { width: Math.max(...rowW) + pad, height: rowH.reduce((s, h) => s + h, 0) + g(rows.length) + pad };
}

function Thumb({ item, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const size = item.size || { w: 200, h: 200 };

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, width: size.w, height: size.h }}
      className="relative flex-shrink-0 rounded outline-none"
    >
      <img src={item.preview} alt={item.name} className="w-full h-full object-cover rounded" />
      <button {...attributes} {...listeners} className="absolute top-0 left-0 px-1 text-xs bg-slate-900/70 text-white rounded cursor-grab" title="Drag to reorder">⠿</button>
      <button onClick={() => onRemove(item.id)} className="absolute top-0 right-0 px-1 text-xs bg-slate-900/70 text-white rounded">✕</button>
    </div>
  );
}

function Layout({ items, layout, background, onRemove, total }) {
  const row = 'flex flex-row items-start';
  const col = 'flex flex-col items-start';
  const box = { background, gap: `${GAP}px`, padding: `${OUTER_PADDING}px`, width: total.width || '100%', height: total.height || 'auto' };

  if (layout === 'horizontal') {
    return <div style={box} className={row}>{items.map((it) => <Thumb key={it.id} item={it} onRemove={onRemove} />)}</div>;
  }
  if (layout === 'vertical') {
    return <div style={box} className={col}>{items.map((it) => <Thumb key={it.id} item={it} onRemove={onRemove} />)}</div>;
  }
  if (layout === 'masonry') {
    const cols = masonryColumns(items, gridCols(items.length));
    return (
      <div style={box} className={row}>
        {cols.map((c, i) => (
          <div key={i} className={col}>{c.map((it) => <Thumb key={it.id} item={it} onRemove={onRemove} />)}</div>
        ))}
      </div>
    );
  }
  if (layout === 'contact-sheet') {
    return (
      <div style={{ ...box, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 120px)' }}>
        {items.map((it) => (
          <div key={it.id} style={{ width: 120, height: 120 }} className="relative flex-shrink-0">
            <img src={it.preview} alt={it.name} className="w-full h-full object-cover rounded" />
            <button onClick={() => onRemove(it.id)} className="absolute top-0 right-0 px-1 text-xs bg-slate-900/70 text-white rounded">✕</button>
          </div>
        ))}
      </div>
    );
  }
  // grid — last partial row stretched to fill full row width
  const ss = stretchedSizes(items);
  const rows = chunkRows(items, gridCols(items.length));
  return (
    <div style={box} className={col}>
      {rows.map((r, i) => (
        <div key={i} className={row}>
          {r.map((it) => <Thumb key={it.id} item={{ ...it, size: ss[items.indexOf(it)] }} onRemove={onRemove} />)}
        </div>
      ))}
    </div>
  );
}

export default function ImageList({ items, layout, background, onReorder, onRemove }) {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(1);

  const total = layout === 'contact-sheet' ? { width: 0, height: 0 } : totals(items, layout);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || total.width === 0) return;
    const update = () => {
      const avail = el.clientWidth;
      setScale(Math.min(1, avail / total.width));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [total.width]);

  if (!items.length) return null;

  const handleEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  return (
    <div ref={wrapRef} className="w-full overflow-x-auto">
      <div style={{ width: total.width ? total.width * scale : '100%', height: total.height ? total.height * scale : 'auto' }}>
        <div style={{ width: total.width || '100%', height: total.height || 'auto', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <DndContext collisionDetection={closestCenter} onDragEnd={handleEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <Layout items={items} layout={layout} background={background} onRemove={onRemove} total={total} />
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
}
