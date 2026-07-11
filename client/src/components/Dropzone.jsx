// Drag & drop / browse upload zone.
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { MAX_FILES } from '../utils/constants.js';

const ACCEPT = { 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] };

export default function Dropzone({ onAdd }) {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length) onAdd(accepted);
    },
    [onAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: MAX_FILES,
  });

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center p-10 rounded-lg border-2 border-dashed cursor-pointer ${
        isDragActive ? 'border-slate-700 dark:border-slate-200' : 'border-slate-300 dark:border-slate-600'
      }`}
    >
      <input {...getInputProps()} />
      <p className="text-center">Drag &amp; drop images here, or click to browse</p>
      <p className="text-xs mt-2 text-slate-500">JPG, PNG, WEBP - up to {MAX_FILES} images</p>
    </div>
  );
}
