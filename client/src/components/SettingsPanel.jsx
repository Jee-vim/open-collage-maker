import { PRESETS } from '../utils/constants.js';

// Mini visual preview for each preset layout
function LayoutIcon({ layout }) {
  const cell = 'bg-[var(--text)] border';
  const empty = 'bg-[var(--border)]';

  if (layout === 'film') {
    return (
      <div className="flex gap-px w-full h-full p-1">
        <div className={`${cell} flex-1`} />
        <div className={`${cell} flex-1`} />
        <div className={`${cell} flex-1`} />
      </div>
    );
  }
  if (layout === 'instagram') {
    return (
      <div className="grid grid-cols-2 gap-px w-full h-full p-1">
        <div className={cell} /><div className={cell} />
        <div className={cell} /><div className={empty} />
      </div>
    );
  }
  if (layout === 'masonry') {
    return (
      <div className="flex gap-px w-full h-full p-1">
        <div className="flex flex-col gap-px flex-1">
          <div className={`${cell} flex-1`} />
          <div className={`${cell} flex-2`} />
        </div>
        <div className="flex flex-col gap-px flex-1">
          <div className={`${cell} flex-2`} />
          <div className={`${cell} flex-1`} />
        </div>
      </div>
    );
  }
  if (layout === 'contact-sheet') {
    return (
      <div className="grid grid-cols-3 gap-px w-full h-full p-1">
        <div className={cell} /><div className={cell} /><div className={cell} />
        <div className={cell} /><div className={cell} /><div className={cell} />
      </div>
    );
  }
  // default grid
  return (
    <div className="grid grid-cols-2 gap-px w-full h-full p-1">
      <div className={cell} /><div className={cell} />
      <div className={cell} /><div className={cell} />
    </div>
  );
}

const COLOR_PRESETS = [
  { value: '#ffffff', label: 'White' },
  { value: '#e2e8f0', label: 'Slate 200' },
  { value: '#94a3b8', label: 'Slate 400' },
  { value: '#000000', label: 'Black' },
  { value: '#fef3c7', label: 'Amber' },
  { value: '#dbeafe', label: 'Blue' },
  { value: '#dcfce7', label: 'Green' },
  { value: '#fce7f3', label: 'Pink' },
  { value: '#f3e8ff', label: 'Purple' },
];

function ColorPresets({ value, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-[var(--text-muted)] uppercase">Background</span>
      <div className="flex flex-wrap gap-1">
        {COLOR_PRESETS.map((c) => (
          <button
            key={c.value}
            onClick={() => onChange(c.value)}
            className={`w-9 h-9 border hover:border-[var(--accent)] ${value === c.value ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-[var(--border)]'}`}
            style={{ background: c.value }}
            title={c.label}
          />
        ))}
      </div>
    </div>
  );
}

export default function SettingsPanel({ settings, onChange, onPreset, presetValue }) {
  const set = (key, val) => onChange({ ...settings, [key]: val });

  return (
    <div className="flex flex-col gap-2">
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-[var(--text-muted)] uppercase">Preset</span>
      <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPreset(p.value)}
            className={`flex-shrink-0 w-28 h-24 border overflow-hidden hover:border-[var(--accent)] ${presetValue === p.value ? 'border-[var(--accent)] ring-1 ring-[var(--accent)]' : 'border-[var(--border)]'}`}
            style={{ background: p.opts.background || '#fff' }}
            title={p.label}
          >
            <LayoutIcon layout={p.opts.layout} />
          </button>
        ))}
      </div>
      </div>

      {/* Background color */}
      <ColorPresets value={settings.background} onChange={(v) => set('background', v)} />
    </div>
  );
}
