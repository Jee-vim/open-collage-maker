import { PRESETS } from '../utils/constants.js';

function LayoutIcon({ preset }) {
  const cell = 'bg-fg border';
  const empty = 'bg-border';

  // Film Strip — 3 across
  if (preset === 'film') {
    return (
      <div className="flex gap-px w-full h-full p-1">
        <div className={`${cell} flex-1`} />
        <div className={`${cell} flex-1`} />
        <div className={`${cell} flex-1`} />
      </div>
    );
  }
  // Instagram — 3-col grid, 2 rows (last row partial)
  if (preset === 'instagram') {
    return (
      <div className="grid grid-cols-3 gap-px w-full h-full p-1">
        <div className={cell} /><div className={cell} /><div className={cell} />
        <div className={cell} /><div className={cell} /><div className={empty} />
      </div>
    );
  }
  // Pinterest — masonry 2-col, uneven heights
  if (preset === 'pinterest') {
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
  // Contact Sheet — dense 3x2 tile grid
  if (preset === 'contact') {
    return (
      <div className="grid grid-cols-3 gap-px w-full h-full p-1">
        <div className={cell} /><div className={cell} /><div className={cell} />
        <div className={cell} /><div className={cell} /><div className={cell} />
      </div>
    );
  }
  // Polaroid — 2 large + 1 small (stacked feel)
  if (preset === 'polaroid') {
    return (
      <div className="flex gap-px w-full h-full p-1">
        <div className={`${cell} flex-2`} />
        <div className="flex flex-col gap-px flex-1">
          <div className={`${cell} flex-1`} />
          <div className={`${empty} flex-1`} />
        </div>
      </div>
    );
  }
  return null;
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

export default function SettingsPanel({ settings, onChange, onPreset, presetValue }) {
  const set = (key, val) => onChange({ ...settings, [key]: val });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-1">
        <span className="text-fg-dim text-[11px] uppercase">Preset</span>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => onPreset(p.value)}
              className={`flex-shrink-0 w-28 h-24 overflow-hidden`}
              title={p.label}
            >
              <LayoutIcon preset={p.value} />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-fg-dim text-[11px] uppercase">Background</span>
        <div className="flex flex-wrap gap-1">
          {COLOR_PRESETS.map((c) => (
            <button
              key={c.value}
              onClick={() => set('background', c.value)}
              className={`w-9 h-9 border hover:border-accent ${settings.background === c.value ? 'border-accent ring-1 ring-accent' : 'border-border'}`}
              style={{ background: c.value }}
              title={c.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
