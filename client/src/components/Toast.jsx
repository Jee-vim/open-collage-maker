export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 px-4 py-2 text-sm border bg-bg shadow-lg">
      {toast.message}
    </div>
  );
}
