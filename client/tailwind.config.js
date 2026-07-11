/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        'bg-1': 'var(--bg1)',
        'bg-2': 'var(--bg2)',
        fg: 'var(--fg)',
        'fg-dim': 'var(--fg-dim)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
      },
    },
  },
  plugins: [],
};
