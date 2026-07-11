export default function Header({ onGenerate, loading, progress, disabled }) {
  return (
    <header className="flex items-center justify-between px-4 h-14 border-b bg-bg">
      <h1 className="text-sm font-semibold">Photo Collage</h1>
      <button onClick={onGenerate} disabled={disabled} className="btn btn-primary">
        {loading ? `${progress}%` : 'Generate'}
      </button>
    </header>
  );
}
