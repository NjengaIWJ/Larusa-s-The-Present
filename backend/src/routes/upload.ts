import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cloudinary from '../utils/cloudinary';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();
const tmpDir = path.join(__dirname, '../../tmp');
const upload = multer({ dest: tmpDir });

// Upload an image (admin only for product images)
router.post('/image', authMiddleware, adminOnly, upload.single('file'), async (req: any, res: Response) => {
  const file: Express.Multer.File | undefined = req.file;
  if (!file) return res.status(400).json({ message: 'No file' });
  try {
    const result = await cloudinary.uploader.upload(file.path, { folder: 'the_present' });
    // cleanup
    fs.unlink(file.path, () => {});
    res.json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

export default router;
