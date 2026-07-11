// Collage API routes.
import express from 'express';
import { uploadImages } from '../middleware/upload.js';
import { createCollage } from '../controllers/collageController.js';

const router = express.Router();

// POST /api/collage  multipart/form-data
router.post('/collage', uploadImages, createCollage);

export default router;
