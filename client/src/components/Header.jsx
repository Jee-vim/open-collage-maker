export default function Header({ theme, onToggle }) {
  return (
    <header className="flex items-center justify-between px-3 py-2 border-b border-[var(--border)] bg-[var(--bg-inset)]">
      <h1 className="text-xs font-bold uppercase tracking-widest">Collage Maker</h1>
      <button
        onClick={onToggle}
        className="px-2 py-0.5 text-[11px] border border-[var(--border)] hover:bg-[var(--border)]"
      >
        {theme === 'dark' ? 'LT' : 'DK'}
      </button>
    </header>
  );
}
