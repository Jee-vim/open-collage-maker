import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root when running from server dir.
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const isAbs = (p) => path.isAbsolute(p);

const ROOT = path.resolve(__dirname, '..');

export const config = {
  port: Number(process.env.PORT) || 3000,
  uploadDir: isAbs(process.env.UPLOAD_DIR || 'uploads')
    ? process.env.UPLOAD_DIR
    : path.join(__dirname, process.env.UPLOAD_DIR || 'uploads'),
  outputDir: isAbs(process.env.OUTPUT_DIR || 'output')
    ? process.env.OUTPUT_DIR
    : path.join(__dirname, process.env.OUTPUT_DIR || 'output'),
  tempDir: isAbs(process.env.TEMP_DIR || 'temp')
    ? process.env.TEMP_DIR
    : path.join(__dirname, process.env.TEMP_DIR || 'temp'),
  maxUploadSize: Number(process.env.MAX_UPLOAD_SIZE) || 10485760,
  maxFiles: Number(process.env.MAX_FILES) || 20,
  magickPath: process.env.MAGICK_PATH || 'magick',
  root: ROOT,
};

export default config;
