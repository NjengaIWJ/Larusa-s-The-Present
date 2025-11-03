import express, { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import cloudinary from '../utils/cloudinary';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

// Create tmp directory if it doesn't exist
const tmpDir = path.join(__dirname, '../../tmp');
fs.mkdir(tmpDir, { recursive: true }).catch(err => {
  logger.error('Failed to create tmp directory:', err);
});

// Configure multer with file size and type validation
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tmpDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
  },
  fileFilter
});

const router = express.Router();

interface AuthRequestWithFile extends AuthRequest {
  file?: Express.Multer.File | undefined;
}

// Upload an image (admin only for product images)
router.post(
  '/image',
  authMiddleware,
  adminOnly,
  upload.single('file'),
  async (req: AuthRequestWithFile, res: Response) => {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    try {
      // Upload to Cloudinary with automatic optimization
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'the_present',
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' }
        ]
      });

      // Cleanup temp file
      await fs.unlink(file.path);

      res.json({
        url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format
      });
    } catch (err) {
      // Attempt to cleanup temp file even on error
      fs.unlink(file.path).catch(unlinkErr => {
        logger.error('Failed to cleanup temp file:', unlinkErr);
      });

      logger.error('Upload error:', err);
      res.status(500).json({ message: 'Failed to upload file to cloud storage' });
    }
  }
);

// Error handling middleware for multer
router.use((err: any, _req: express.Request, res: Response, _next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message });
});

export default router;
