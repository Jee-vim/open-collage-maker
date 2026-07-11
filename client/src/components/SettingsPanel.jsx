import { ui } from '../styles/ui.js';
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
  { value: '#888888', label: 'Gray' },
  { value: '#333333', label: 'Dark' },
  { value: '#000000', label: 'Black' },
  { value: '#fbbf24', label: 'Yellow' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#22c55e', label: 'Green' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#a855f7', label: 'Purple' },
];

export default function SettingsPanel({ settings, onChange, onPreset, presetValue }) {
  const set = (key, val) => onChange({ ...settings, [key]: val });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className={ui.sectionLabel}>Layout</span>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPreset(p.value)}
              className={`flex-shrink-0 w-24 h-20 bg-bg-2 ${ui.tile} ${presetValue === p.value ? ui.tileActive : ''}`}
              title={p.label}
            >
              <LayoutIcon preset={p.value} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className={ui.sectionLabel}>Background</span>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => set('background', c.value)}
              className={`flex-shrink-0 w-8 h-8 border hover:border-fg ${settings.background === c.value ? 'border-fg' : 'border-border'}`}
              style={{ background: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
