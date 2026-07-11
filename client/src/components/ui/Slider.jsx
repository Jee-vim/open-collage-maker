// Radix slider wrapper. Centered, no shadow.
import * as RSlider from '@radix-ui/react-slider';

export default function Slider({ value, min, max, step = 1, onValueChange }) {
  return (
    <RSlider.Root
      className="relative flex items-center w-full h-5 select-none"
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onValueChange(v[0])}
    >
      <RSlider.Track className="bg-slate-300 dark:bg-slate-700 relative grow rounded-full h-1">
        <RSlider.Range className="absolute bg-slate-700 dark:bg-slate-300 rounded-full h-full" />
      </RSlider.Track>
      <RSlider.Thumb
        className="block w-4 h-4 rounded-full bg-slate-700 dark:bg-slate-200 outline-none"
        aria-label="value"
      />
    </RSlider.Root>
  );
}
