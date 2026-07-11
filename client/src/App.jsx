import { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import Dropzone from './components/Dropzone.jsx';
import ImageList from './components/ImageList.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import Toast from './components/Toast.jsx';
import { useTheme } from './hooks/useTheme.js';
import { generateCollage } from './api/collage.js';
import { DEFAULT_SETTINGS, MAX_FILES, PRESETS } from './utils/constants.js';

let idSeq = 0;
const nextId = () => `img_${Date.now()}_${idSeq++}`;

export default function App() {
  const { theme, toggle } = useTheme();
  const [images, setImages] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
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
      if (files.length > room) notify(`Limited to ${MAX_FILES} images`, 'error');
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
  const reorder = (next) => setImages(next);;

  const applyPreset = (value) => {
    setPreset(value);
    if (!value) return setSettings({ ...DEFAULT_SETTINGS });
    const found = PRESETS.find((p) => p.value === value);
    if (found) setSettings({ ...DEFAULT_SETTINGS, ...found.opts });
  };

  const generate = async () => {
    if (images.length < 2) return notify('Upload at least 2 images', 'error');
    setLoading(true);
    setProgress(0);
    setResult(null);
    try {
      const res = await generateCollage(
        { ...settings, images: images.map((i) => i.file), sizes: images.map((i) => i.size) },
        setProgress
      );
      if (res.success) {
        setResult(res);
        notify('Collage generated', 'success');
      } else {
        notify(res.message || 'Generation failed', 'error');
      }
    } catch (err) {
      notify(err.response?.data?.message || 'Generation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center">
      <Header theme={theme} onToggle={toggle} />
      <Toast toast={toast} />

      <main className="w-full max-w-5xl mx-auto flex flex-col gap-6 px-4 pb-12">
        <section>
          <h2 className="text-lg font-semibold mb-2 text-center">Upload Images</h2>
          <Dropzone onAdd={addImages} />
        </section>

        {images.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-2 text-center">Preview</h2>
            <p className="text-center text-sm text-slate-500 mb-2">Drag thumbnails to reorder</p>
            <ImageList
              items={images}
              layout={settings.layout}
              background={settings.background}
              onReorder={reorder}
              onRemove={removeImage}
            />
          </section>
        )}

        <section>
          <h2 className="text-lg font-semibold mb-2 text-center">Settings</h2>
          <SettingsPanel settings={settings} onChange={setSettings} onPreset={applyPreset} presetValue={preset} />
        </section>

        <section className="flex flex-col items-center gap-3">
          <button
            onClick={generate}
            disabled={loading || images.length < 2}
            className="px-6 py-3 rounded-md bg-slate-700 text-white dark:bg-slate-200 dark:text-slate-900 disabled:opacity-50"
          >
            {loading ? `Generating ${progress}%` : 'Generate Collage'}
          </button>
          {loading && <div className="w-48 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />}
        </section>

        <section>
          <ResultPanel result={result} />
        </section>
      </main>
    </div>
  );
}
