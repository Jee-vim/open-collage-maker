import { useState, useEffect } from 'react';
import { PRESETS } from '../utils/constants.js';

function LayoutIcon({ preset }) {
  const cell = 'bg-fg';
  const empty = 'bg-border';

  const icons = {
    film: (
      <div className="flex gap-px w-full h-full p-1.5">
        <div className={`${cell} flex-1`} />
        <div className={`${cell} flex-1`} />
        <div className={`${cell} flex-1`} />
      </div>
    ),
    instagram: (
      <div className="grid grid-cols-3 gap-px w-full h-full p-1.5">
        <div className={cell} /><div className={cell} /><div className={cell} />
        <div className={cell} /><div className={cell} /><div className={empty} />
      </div>
    ),
    pinterest: (
      <div className="flex gap-px w-full h-full p-1.5">
        <div className="flex flex-col gap-px flex-1">
          <div className={`${cell} flex-1`} />
          <div className={`${cell} flex-[2]`} />
        </div>
        <div className="flex flex-col gap-px flex-1">
          <div className={`${cell} flex-[2]`} />
          <div className={`${cell} flex-1`} />
        </div>
      </div>
    ),
    contact: (
      <div className="grid grid-cols-3 gap-px w-full h-full p-1.5">
        <div className={cell} /><div className={cell} /><div className={cell} />
        <div className={cell} /><div className={cell} /><div className={cell} />
      </div>
    ),
    polaroid: (
      <div className="flex gap-px w-full h-full p-1.5">
        <div className={`${cell} flex-[2]`} />
        <div className="flex flex-col gap-px flex-1">
          <div className={`${cell} flex-1`} />
          <div className={`${empty} flex-1`} />
        </div>
      </div>
    ),
  };

  return icons[preset] || null;
}

const COLORS = [
  { value: '#ffffff', label: 'White' },
  { value: '#fcfbfa', label: 'Alabaster' }, // Warm, soft off-white
  { value: '#f3f4f6', label: 'Cool Gray' },  // Light gray (Tailwind gray-100)
  { value: '#e7e5e4', label: 'Stone' },      // Warm gray (Tailwind stone-200)
  { value: '#292524', label: 'Dark Stone' }, // Soft black/dark charcoal
  { value: '#000000', label: 'Black' },

  { value: '#fef08a', label: 'Cream' },      // Soft, desaturated yellow
  { value: '#ffedd5', label: 'Apricot' },    // Warm, muted orange/flesh tone
];

export default function SettingsPanel({ settings, onChange, onPreset, presetValue }) {
  const [showCustom, setShowCustom] = useState(false);
  const [bgPreview, setBgPreview] = useState(null);
  const set = (key, val) => onChange({ ...settings, [key]: val });

  useEffect(() => {
    if (settings.backgroundImage) {
      const url = URL.createObjectURL(settings.backgroundImage);
      setBgPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setBgPreview(null);
  }, [settings.backgroundImage]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="section-label">Layout</span>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPreset(p.value)}
              className={`tile flex-shrink-0 w-24 h-20 bg-bg-2 ${presetValue === p.value ? 'tile-active' : ''}`}
              title={p.label}
            >
              <LayoutIcon preset={p.value} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="section-label">Background</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowCustom((v) => !v)}
              title="Custom background"
              className={`w-5 h-5 border flex items-center justify-center text-sm leading-none ${showCustom ? 'border-fg text-fg' : 'border-border text-fg/60 hover:border-fg'}`}
            >
              {showCustom ? '−' : '+'}
            </button>
            {showCustom && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCustom(false)} />
                <div
                  className="absolute right-0 top-full mt-2 z-50 bg-bg-2 border border-border p-4 rounded w-64 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="section-label">Custom Background</span>
                    <button
                      type="button"
                      onClick={() => setShowCustom(false)}
                      className="w-5 h-5 border border-border flex items-center justify-center text-sm leading-none hover:border-fg"
                      title="Close"
                    >
                      ×
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      value={settings.background || ''}
                      onChange={(e) => set('background', e.target.value)}
                      placeholder="#1f1f1f"
                      className="w-28 px-2 py-1 text-xs bg-bg-2 border border-border rounded text-fg"
                    />
                    <input
                      type="color"
                      value={/^#[0-9a-fA-F]{6}$/.test(settings.background || '') ? settings.background : '#ffffff'}
                      onChange={(e) => set('background', e.target.value)}
                      className="w-7 h-7 p-0 bg-transparent border border-border rounded cursor-pointer"
                      title="Pick color"
                    />
                  </div>
                  {!bgPreview && (
                    <label
                      title="Add background image"
                      className="btn-ghost text-sm cursor-pointer inline-flex items-center justify-center p-1.5"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                      </svg>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => set('backgroundImage', e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                  {bgPreview && (
                    <div className="group relative inline-block mt-3">
                      <img src={bgPreview} alt="background" className="w-20 h-20 object-cover" />
                      <button
                        type="button"
                        onClick={() => set('backgroundImage', null)}
                        className="hidden group-hover:flex group-hover:bg-bg absolute top-1 right-1 w-5 h-5 items-center justify-center text-base leading-none text-white drop-shadow"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => set('background', c.value)}
              className={`flex-shrink-0 w-8 h-8 border hover:border-fg ${settings.background === c.value ? 'border-fg' : ''}`}
              style={{ background: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
