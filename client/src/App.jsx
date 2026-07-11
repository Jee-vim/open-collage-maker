import { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import Dropzone from './components/Dropzone.jsx';
import ImageList from './components/ImageList.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
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
  const reorder = (next) => setImages(next);

  const applyPreset = (value) => {
    setPreset(value);
    if (!value) return setSettings({ ...DEFAULT_SETTINGS });
    const found = PRESETS.find((p) => p.value === value);
    if (found) setSettings({ ...DEFAULT_SETTINGS, ...found.opts });
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
      <Header theme={theme} onToggle={toggle} />
      <Toast toast={toast} />

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full">
        {/* Upload */}
        <div className="section">
          <div className="section-header">Upload</div>
          <div className="section-body">
            <Dropzone onAdd={addImages} />
          </div>
        </div>

        {/* Settings */}
        <div className="section mt-px">
          <div className="section-header">Settings</div>
          <div className="section-body">
            <SettingsPanel settings={settings} onChange={setSettings} onPreset={applyPreset} presetValue={preset} />
          </div>
        </div>

        {/* Preview */}
        {images.length > 0 && (
          <div className="section mt-px">
            <div className="section-header flex justify-between items-center">
              <span>Preview — {images.length} images</span>
              <button
                onClick={generate}
                disabled={loading || images.length < 2}
                className="px-3 py-0.5 text-xs font-semibold border border-[var(--border)] bg-[var(--accent)] text-[var(--accent-fg)] hover:opacity-90 disabled:opacity-40"
              >
                {loading ? `${progress}%` : 'Generate'}
              </button>
            </div>
            <div className="section-body">
              <ImageList
                items={images}
                layout={settings.layout}
                background={settings.background}
                onReorder={reorder}
                onRemove={removeImage}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
