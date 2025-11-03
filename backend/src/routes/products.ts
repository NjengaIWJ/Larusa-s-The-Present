import express from 'express';
import multer from 'multer';
import { authMiddleware, adminOnly } from '../middleware/auth';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/products.controller';
import { validateProductData, validateFileUpload } from '../middleware/validation';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: 'tmp/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.match(/^image\/(jpeg|png|jpg|gif)$/)) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public routes (no authentication required)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected admin routes
router.post('/',
  authMiddleware,
  adminOnly,
  upload.single('image'),
  validateProductData,
  validateFileUpload,
  createProduct
);

router.put('/:id',
  authMiddleware,
  adminOnly,
  upload.single('image'),
  validateProductData,
  updateProduct
);

router.delete('/:id',
  authMiddleware,
  adminOnly,
  deleteProduct
);

export default router;