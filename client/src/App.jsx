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
import { DEFAULT_SETTINGS, MAX_FILES, PRESETS } from './utils/constants.js';

let idSeq = 0;
const nextId = () => `img_${Date.now()}_${idSeq++}`;

function SidebarItem({ item, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 border border-border p-2"
      {...attributes}
    >
      <span className="text-sm text-fg-dim cursor-grab select-none" {...listeners}>⠿</span>
      <img src={item.preview} alt={item.name} className="w-12 h-12 object-cover flex-shrink-0" draggable="false" />
      <span className="text-xs truncate flex-1">{item.name}</span>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove(item.id)}
        className="px-1.5 py-0.5 text-[10px] border border-border hover:bg-bg-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >✕</button>
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

  const notify = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const autoPreset = (n) => {
    if (n <= 3) return 'film';
    if (n <= 6) return 'instagram';
    if (n <= 12) return 'pinterest';
    return 'contact';
  };

  const addImages = useCallback(
    (files) => {
      const wasEmpty = images.length === 0;
      const room = Math.max(0, MAX_FILES - images.length);
      const accepted = files.slice(0, room);
      if (files.length > room) notify(`Limited to ${MAX_FILES}`, 'error');
      const items = accepted.map((f) => {
        const id = nextId();
        const url = URL.createObjectURL(f);
        return { id, file: f, name: f.name, preview: url, size: { w: 200, h: 200 } };
      });
      setImages((prev) => [...prev, ...items]);
      if (wasEmpty && items.length > 0) {
        const p = autoPreset(items.length);
        setPreset(p);
        const found = PRESETS.find((x) => x.value === p);
        if (found) setSettings({ ...DEFAULT_SETTINGS, ...found.opts });
      }
    },
    [images.length, notify]
  );

  const removeImage = (id) => setImages((prev) => prev.filter((i) => i.id !== id));

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
    if (found) setSettings((prev) => ({ ...prev, ...found.opts }));
  };

  const generate = async () => {
    if (images.length < 2) return notify('Min 2 images', 'error');
    setLoading(true);
    setProgress(0);
    try {
      const res = await generateCollage(
        { ...settings, images: images.map((i) => i.file), sizes: images.map((i) => i.size) },
        setProgress
      );
      if (res.success) notify('Saved to output/', 'success');
      else notify(res.message || 'Failed', 'error');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header onGenerate={generate} loading={loading} progress={progress} disabled={loading || images.length < 2} />
      <Toast toast={toast} />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-96 flex-shrink-0 border-r border-border flex flex-col overflow-y-auto">
          {/* Upload */}
          <div className="border-b border-border">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-dim bg-bg-1">Upload</div>
            <div className="p-2"><Dropzone onAdd={addImages} /></div>
          </div>

          {/* Settings */}
          <div className="border-b border-border">
            <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-dim bg-bg-1">Settings</div>
            <div className="p-2">
              <SettingsPanel settings={settings} onChange={setSettings} onPreset={applyPreset} presetValue={preset} />
            </div>
          </div>

          {/* Image list */}
          {images.length > 0 && (
            <div className="flex-1 min-h-0">
              <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-dim bg-bg-1 flex justify-between items-center">
                <span>Images ({images.length})</span>
                <button onClick={() => setImages([])} className="px-1.5 py-0.5 text-[10px] border border-border hover:bg-bg-2">Clear</button>
              </div>
              <div className="p-2 overflow-y-auto">
                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
                    <div className="flex flex-col gap-1">
                      {images.map((it) => (
                        <SidebarItem key={it.id} item={it} onRemove={removeImage} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            </div>
          )}
        </aside>

        {/* Main preview */}
        <main className="flex-1 min-w-0 flex items-center justify-center p-4 overflow-auto bg-bg-2">
          {images.length > 0 ? (
            <ImageList items={images} layout={settings.layout} background={settings.background} />
          ) : (
            <div className="text-[11px] text-fg-dim uppercase tracking-wider">Upload images to preview</div>
          )}
        </main>
      </div>
    </div>
  );
}
