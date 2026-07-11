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
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [preset, setPreset] = useState('');
  const [toast, setToast] = useState(null);

  const slots = slotsFor(preset);

  const notify = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const removeImage = (id) => setImages((prev) => prev.filter((i) => i.id !== id));
  const removeAt = useCallback((index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }, []);
  const addImages = useCallback((files) => {
    if (!slots) return;
    setImages((prev) => {
      const room = Math.max(0, slots - prev.length);
      const accepted = files.slice(0, room);
      if (files.length > room) notify(`Layout holds ${slots} images`);
      const items = accepted.map((f) => ({
        id: nextId(), file: f, name: f.name,
        preview: URL.createObjectURL(f), size: { w: 200, h: 200 },
      }));
      return [...prev, ...items];
    });
  }, [slots]);

  const addAt = useCallback((index, files) => {
    if (!slots) return;
    setImages((prev) => {
      const next = [...prev];
      files.slice(0, slots - index).forEach((f, k) => {
        next[index + k] = {
          id: nextId(), file: f, name: f.name,
          preview: URL.createObjectURL(f), size: { w: 200, h: 200 },
        };
      });
      return next;
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
        { ...settings, images: images.map((i) => i.file), sizes: images.map((i) => i.size) },
        setProgress
      );
      if (res.success) notify('Saved to output/');
      else notify(res.message || 'Failed');
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
                onAddSlot={addAt}
                onRemoveSlot={removeAt}
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
