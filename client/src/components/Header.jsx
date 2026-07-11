import { ui } from '../styles/ui.js';

export default function Header({ onGenerate, loading, progress, disabled }) {
  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-border bg-bg">
      <h1 className="text-sm font-semibold">Photo Collage</h1>
      <button onClick={onGenerate} disabled={disabled} className={`${ui.btn} ${ui.btnPrimary}`}>
        {loading ? `${progress}%` : 'Generate'}
      </button>
    </header>
  );
}
