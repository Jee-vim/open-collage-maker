import { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import Dropzone from './components/Dropzone.jsx';
import ImageList from './components/ImageList.jsx';
import ImageSidebar from './components/ImageSidebar.jsx';
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


export default function App() {
  const [images, setImages] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  const applyPreset = (value) => {
    setPreset(value);
    setSidebarOpen(false);
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
      <Header onGenerate={generate} loading={loading} progress={progress} disabled={loading || images.length < 2} onMenu={() => setSidebarOpen((o) => !o)} />
      <Toast toast={toast} />

      <div className="flex flex-1 min-h-0">
        <aside className={`sidebar fixed top-14 bottom-0 left-0 z-40 w-80 -translate-x-full transition-transform md:static md:top-0 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : ''}`}>
          <div className="section"><SettingsPanel settings={settings} onChange={setSettings} onPreset={applyPreset} presetValue={preset} /></div>
          <div className="section"><Dropzone onAdd={addImages} /></div>
          <ImageSidebar images={images} onRemove={removeImage} onClear={() => setImages([])} onReorder={setImages} />
        </aside>
        {sidebarOpen && (
          <div className="fixed top-14 left-0 right-0 bottom-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <main>
          <ImageList
            items={images}
            layout={settings.layout}
            background={settings.background}
            slots={slots}
            cellSize={images.length ? uniformCell() : { w: 600, h: 600 }}
            onAddSlot={addAt}
          />
        </main>
      </div>
    </div>
  );
}
