import express, { Request, Response } from 'express';
import Order from '../models/Order';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Create order (checkout without payment)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { items, total } = req.body as { items: any[]; total: number };
  if (!items || typeof total !== 'number') return res.status(400).json({ message: 'Missing order data' });
  const order = new Order({ user: req.user!._id, items, total });
  await order.save();
  res.json(order);
});

// Get user's orders
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const orders = await Order.find({ user: req.user!._id }).populate('items.product');
  res.json(orders);
});

export default router;
