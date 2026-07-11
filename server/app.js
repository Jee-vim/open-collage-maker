// Express application entry point.
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import config from './config.js';
import collageRoutes from './routes/collage.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve generated collages as static files.
app.use('/output', express.static(config.outputDir));

app.use('/api', collageRoutes);

// Health check.
app.get('/api/health', (req, res) => {
  res.json({ success: true, magick: config.magickPath });
});

// Ensure required directories exist.
[config.uploadDir, config.outputDir, config.tempDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 404 handler.
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Error handler (multer / filter errors).
app.use((err, req, res, next) => {
  res.status(400).json({ success: false, message: err.message || 'Bad request' });
});

const port = config.port;
app.listen(port, () => {
  console.log(`[INFO] Server listening on http://localhost:${port}`);
});

export default app;
