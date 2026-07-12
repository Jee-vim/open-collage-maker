export default function Header({ onGenerate, loading, progress, disabled, onMenu }) {
  return (
    <header className="relative z-50 flex items-center justify-between px-4 h-14 border-b bg-bg">
      <div className="flex items-center gap-2">
        <button onClick={onMenu} className="btn btn-ghost md:hidden" type="button" aria-label="Toggle menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <h1 className="text-sm font-semibold">Photo Collage</h1>
      </div>
      <button onClick={onGenerate} disabled={disabled} className="btn btn-primary">
        {loading ? (progress >= 100 ? 'Generating…' : `${progress}%`) : 'Generate'}
      </button>
    </header>
  );
}
