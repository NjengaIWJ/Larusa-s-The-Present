import express, { Request, Response } from 'express';
import Product from '../models/Product';
import { authMiddleware, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Public: list products
router.get('/', async (_req: Request, res: Response) => {
  const products = await Product.find();
  res.json(products);
});

// Public: get product
router.get('/:id', async (req: Request, res: Response) => {
  const p = await Product.findById(req.params.id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// Admin: create product
router.post('/', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  const { name, description, price, images, category } = req.body as {
    name: string; description?: string; price: number; images?: string[]; category?: string
  };
  const product = new Product({ name, description, price, images: images || [], category });
  await product.save();
  res.json(product);
});

// Admin: update
router.put('/:id', authMiddleware, adminOnly, async (req: AuthRequest, res: Response) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!p) return res.status(404).json({ message: 'Not found' });
  res.json(p);
});

// Admin: delete
router.delete('/:id', authMiddleware, adminOnly, async (_req: AuthRequest, res: Response) => {
  await Product.findByIdAndDelete(_req.params.id);
  res.json({ ok: true });
});

export default router;
