// Generated result preview with actions.
import { useState } from 'react';

export default function ResultPanel({ result, live }) {
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const url = result.imageUrl;
  const full = `${window.location.origin}${url}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 rounded-lg border border-slate-300 dark:border-slate-600">
      <span className="text-xs px-2 py-1 rounded border border-slate-300 dark:border-slate-600">
        {live ? 'Live Preview' : 'Saved'}
      </span>
      <img src={url} alt="collage" className="max-w-full max-h-[60vh] rounded-md" />
      <div className="flex gap-2">
        <a
          href={url}
          download
          className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600"
        >
          Download
        </a>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600"
        >
          Open
        </a>
        <button
          onClick={copy}
          className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-600"
        >
          {copied ? 'Copied' : 'Copy URL'}
        </button>
      </div>
    </div>
  );
}
