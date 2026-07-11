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
    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'bg-bg-2 border-fg' : 'border-border'}`}>
      <input {...getInputProps()} />
      {isDragActive ? 'Drop here' : 'Drop images or click to upload'}
    </div>
  );
}
