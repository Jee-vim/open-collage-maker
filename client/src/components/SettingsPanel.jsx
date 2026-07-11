import { PRESETS } from '../utils/constants.js';

// Mini visual preview for each preset layout
function LayoutIcon({ layout }) {
  const cell = 'bg-[var(--text)]';
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

function ColorInput({ value, onChange }) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-[11px] text-[var(--text-muted)] uppercase">BG</span>
      <input
        type="color"
        value={value || '#ffffff'}
        onChange={(e) => onChange(e.target.value)}
        className="w-5 h-5 border border-[var(--border)] p-0 cursor-pointer"
      />
      <span className="text-[11px] text-[var(--text-muted)]">{value}</span>
    </label>
  );
}

export default function SettingsPanel({ settings, onChange, onPreset, presetValue }) {
  const set = (key, val) => onChange({ ...settings, [key]: val });

  return (
    <div className="flex flex-col gap-2">
      {/* Preset selector — visual cards */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {/* None option */}
        <button
          onClick={() => onPreset('')}
          className={`flex-shrink-0 w-16 h-12 border flex flex-col items-center justify-center text-[10px] text-[var(--text-muted)] hover:border-[var(--accent)] ${!presetValue ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}
        >
          <span>None</span>
        </button>
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => onPreset(p.value)}
            className={`flex-shrink-0 w-16 h-12 border overflow-hidden hover:border-[var(--accent)] ${presetValue === p.value ? 'border-[var(--accent)]' : 'border-[var(--border)]'}`}
            style={{ background: p.opts.background || '#fff' }}
            title={p.label}
          >
            <LayoutIcon layout={p.opts.layout} />
          </button>
        ))}
      </div>

      {/* Background color */}
      <ColorInput value={settings.background} onChange={(v) => set('background', v)} />
    </div>
  );
}
