// Multer upload middleware with size and count limits.
import multer from 'multer';
import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs';
import config from '../config.js';
import { validateFile } from '../utils/validate.js';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir(config.tempDir);
    cb(null, config.tempDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: config.maxUploadSize, files: config.maxFiles },
  fileFilter: (req, file, cb) => {
    const err = validateFile(file);
    if (err) cb(new Error(err));
    else cb(null, true);
  },
});

export const uploadImages = upload.fields([
  { name: 'images[]', maxCount: config.maxFiles },
  { name: 'backgroundImage', maxCount: 1 },
]);
export default upload;
