// Radix select wrapper. Centered, no shadow.
import * as RSelect from '@radix-ui/react-select';

export default function Select({ value, onValueChange, options, label }) {
  return (
    <RSelect.Root value={value} onValueChange={onValueChange}>
      <RSelect.Trigger
        className="inline-flex items-center justify-between w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none"
        aria-label={label}
      >
        <RSelect.Value />
        <RSelect.Icon>▾</RSelect.Icon>
      </RSelect.Trigger>
      <RSelect.Portal>
        <RSelect.Content
          className="overflow-hidden rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 z-50"
          position="popper"
        >
          <RSelect.Viewport className="p-1">
            {options.map((opt) => (
              <RSelect.Item
                key={opt.value}
                value={opt.value}
                className="rounded px-3 py-2 outline-none data-[highlighted]:bg-slate-200 dark:data-[highlighted]:bg-slate-700 cursor-pointer"
              >
                <RSelect.ItemText>{opt.label}</RSelect.ItemText>
              </RSelect.Item>
            ))}
          </RSelect.Viewport>
        </RSelect.Content>
      </RSelect.Portal>
    </RSelect.Root>
  );
}
