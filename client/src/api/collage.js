// API client for the collage backend.
import axios from 'axios';

const base = import.meta.env.VITE_API_URL || '';
const client = axios.create({ baseURL: base ? `${base}/api` : '/api' });

export async function generateCollage(payload, onProgress) {
  const form = new FormData();
  payload.images.forEach((file) => form.append('images[]', file));
  form.append('layout', payload.layout || 'grid');
  form.append('preset', payload.preset || payload.layout || 'collage');
  form.append('gap', payload.gap);
  form.append('background', payload.background || '#ffffff');
  form.append('format', payload.format || 'png');
  if (payload.backgroundImage) form.append('backgroundImage', payload.backgroundImage);
  if (payload.sizes) form.append('sizes', JSON.stringify(payload.sizes));

  const res = await client.post('/collage', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return res.data;
}

export async function checkHealth() {
  const res = await client.get('/health');
  return res.data;
}
