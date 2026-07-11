export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed top-14 right-3 z-50 px-3 py-1.5 text-xs border border-border bg-bg shadow-sm">
      {toast.message}
    </div>
  );
}
