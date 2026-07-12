import { useState, useCallback } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Header from './components/Header.jsx';
import Dropzone from './components/Dropzone.jsx';
import ImageList from './components/ImageList.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Toast from './components/Toast.jsx';
import { generateCollage } from './api/collage.js';
import { DEFAULT_SETTINGS, slotsFor, PRESETS } from './utils/constants.js';

let idSeq = 0;
const nextId = () => `img_${Date.now()}_${idSeq++}`;

const MAX_CELL = 2400;
async function imageSize(file) {
  try {
    const bmp = await createImageBitmap(file);
    const { width, height } = bmp;
    bmp.close?.();
    const longest = Math.max(width, height);
    if (longest > MAX_CELL) {
      const k = MAX_CELL / longest;
      return { w: Math.round(width * k), h: Math.round(height * k) };
    }
    return { w: width, h: height };
  } catch {
    return { w: 200, h: 200 };
  }
}

// Fixed SQUARE cell size applied to every photo, so all cells are identical
// and each is cover-cropped to fill (no blanks, tidy, sharp).
const CELL_SIZE = 1080;
function uniformCell() {
  return { w: CELL_SIZE, h: CELL_SIZE };
}

function SidebarItem({ item, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="!px-4 list-item group" {...attributes}>
      <span className="text-fg-dim cursor-grab select-none" {...listeners}>⠿</span>
      <div className="thumb-wrap">
        <img src={item.preview} alt={item.name} className="thumb" draggable="false" />
        <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onRemove(item.id)} className="thumb-remove" title="Remove" type="button">✕</button>
      </div>
    </div>
  );
}

export default function App() {
  const [images, setImages] = useState([]);
  const [settings, setSettings] = useState({ ...DEFAULT_SETTINGS, ...PRESETS[0].opts });
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preset, setPreset] = useState(PRESETS[0].value);
  const [toast, setToast] = useState(null);

  const slots = slotsFor(preset);

  const notify = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const removeImage = (id) => setImages((prev) => prev.filter((i) => i.id !== id));
  const addImages = useCallback(async (files) => {
    if (!slots) return;
    const room = Math.max(0, slots - images.length);
    const accepted = files.slice(0, room);
    if (files.length > room) notify(`Layout holds ${slots} images`);
    const items = await Promise.all(accepted.map(async (f) => ({
      id: nextId(), file: f, name: f.name,
      preview: URL.createObjectURL(f),
      size: await imageSize(f),
    })));
    setImages((prev) => {
      const merged = [...prev, ...items].slice(0, slots);
      const cell = uniformCell(merged);
      return merged.map((it) => ({ ...it, size: cell }));
    });
  }, [slots]);

  const addAt = useCallback(async (index, files) => {
    if (!slots) return;
    const accepted = files.slice(0, slots - index);
    const items = await Promise.all(accepted.map(async (f) => ({
      id: nextId(), file: f, name: f.name,
      preview: URL.createObjectURL(f),
      size: await imageSize(f),
    })));
    setImages((prev) => {
      const next = [...prev];
      items.forEach((it, k) => { next[index + k] = it; });
      const cell = uniformCell(next);
      return next.map((it) => ({ ...it, size: cell }));
    });
  }, [slots]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((i) => i.id === active.id);
      const newIndex = images.findIndex((i) => i.id === over.id);
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  const applyPreset = (value) => {
    setPreset(value);
    if (!value) return setSettings({ ...DEFAULT_SETTINGS });
    const found = PRESETS.find((p) => p.value === value);
    if (found) {
      setSettings((prev) => ({ ...prev, ...found.opts }));
      setImages((prev) => prev.slice(0, found.slots));
    }
  };

  const generate = async () => {
    if (images.length < 2) return notify('Min 2 images');
    setLoading(true);
    setProgress(0);
    try {
      const res = await generateCollage(
        { ...settings, preset, images: images.map((i) => i.file), sizes: images.map((i) => i.size) },
        setProgress
      );
      if (res.success) {
        const base = import.meta.env.VITE_API_URL || '';
        const url = base + res.imageUrl;
        try {
          const blob = await (await fetch(url)).blob();
          const obj = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = obj;
          a.download = res.imageUrl.split('/').pop() || 'collage.png';
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(obj);
          notify('Downloading collage');
        } catch {
          notify('Download failed');
        }
      } else {
        notify(res.message || 'Failed');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onGenerate={generate} loading={loading} progress={progress} disabled={loading || images.length < 2} />
      <Toast toast={toast} />

      <div className="flex flex-1 min-h-0">
        <aside className="sidebar">
          <div className="section"><SettingsPanel settings={settings} onChange={setSettings} onPreset={applyPreset} presetValue={preset} /></div>
          {preset && (
            <>
              <div className="section"><Dropzone onAdd={addImages} /></div>
              {images.length > 0 && (
                <div className="flex-1 min-h-0">
                  <div className="section flex justify-between items-center">
                    <span className="section-label"> Images ({images.length})</span>
                    <button onClick={() => setImages([])} className="btn-ghost text-sm">Clear</button>
                  </div>
                  <div className="overflow-y-auto">
                    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
                        <div className="divide-y divide-border">
                          {images.map((it) => <SidebarItem key={it.id} item={it} onRemove={removeImage} />)}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </div>
              )}
            </>
          )}
        </aside>

        <main className="main">
          {preset ? (
            <div className="board-scroll">
              <ImageList
                items={images}
                layout={settings.layout}
                background={settings.background}
                slots={slots}
                cellSize={images.length ? uniformCell() : { w: 600, h: 600 }}
                onAddSlot={addAt}
              />
            </div>
          ) : (
            <div className="text-sm text-fg-dim">Select a layout to begin</div>
          )}
        </main>
      </div>
    </div>
  );
}
