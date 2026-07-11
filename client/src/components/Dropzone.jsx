import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export default function Dropzone({ onAdd }) {
  const onDrop = useCallback((accepted) => {
    if (accepted.length) onAdd(accepted);
  }, [onAdd]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      className={`border border-dashed cursor-pointer text-center py-4 text-[11px] uppercase tracking-wider text-[var(--text-muted)] hover:bg-[var(--bg-inset)] ${isDragActive ? 'bg-[var(--bg-inset)] border-[var(--accent)]' : 'border-[var(--border)]'}`}
    >
      <input {...getInputProps()} />
      {isDragActive ? 'Drop here' : 'Click or drag images'}
    </div>
  );
}
