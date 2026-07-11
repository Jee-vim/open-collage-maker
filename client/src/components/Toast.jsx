// Minimal toast notifications.
export default function Toast({ toast }) {
  if (!toast) return null;
  const color =
    toast.type === 'error'
      ? 'border-red-400 text-red-600'
      : toast.type === 'success'
      ? 'border-green-400 text-green-600'
      : 'border-slate-400';
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded-md border bg-white dark:bg-slate-800 ${color}`}>
        {toast.message}
      </div>
    </div>
  );
}
