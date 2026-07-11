// Top header with title and theme toggle.
export default function Header({ theme, onToggle }) {
  return (
    <header className="flex items-center justify-between w-full max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-center flex-1">Photo Collage Maker</h1>
      <button
        onClick={onToggle}
        className="px-3 py-1 rounded-md border border-slate-300 dark:border-slate-600"
        aria-label="toggle theme"
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </header>
  );
}
