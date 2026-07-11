// Collage settings form. Radix-based controls, centered, no shadow.
import Slider from './ui/Slider.jsx';
import Select from './ui/Select.jsx';
import { PRESETS } from '../utils/constants.js';

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

export default function SettingsPanel({ settings, onChange, onPreset, presetValue }) {
  const set = (key, value) => onChange({ ...settings, [key]: value });

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border border-slate-300 dark:border-slate-600">
      <Field label="Preset">
        <Select
          label="preset"
          value={presetValue || ''}
          onValueChange={(v) => onPreset(v)}
          options={[{ value: '', label: 'None' }, ...PRESETS]}
        />
      </Field>

      <Field label="Background">
        <input
          type="color"
          className="w-16 h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-transparent"
          value={settings.background.startsWith('#') ? settings.background : '#ffffff'}
          onChange={(e) => set('background', e.target.value)}
        />
      </Field>
    </div>
  );
}
