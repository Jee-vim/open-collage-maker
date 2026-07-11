export default function Header({ onGenerate, loading, progress, disabled }) {
  return (
    <header className="flex items-center justify-between px-3 py-2 border-b border-border bg-bg-1">
      <h1 className="text-xs font-bold uppercase tracking-widest">Collage Maker</h1>
      <button
        onClick={onGenerate}
        disabled={disabled}
        className="px-3 py-1 text-xs font-semibold border border-accent text-accent hover:bg-accent hover:text-accent-fg disabled:opacity-40"
      >
        {loading ? `${progress}%` : 'Generate'}
      </button>
    </header>
  );
}
