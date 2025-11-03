import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth';
import {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} from '../controllers/orders.controller';
import { validateOrderItems, validateOrderStatus } from '../middleware/validation';

const router = express.Router();

// Public routes - none

// Protected customer routes
router.get('/my-orders', authMiddleware, getUserOrders);
router.post('/', authMiddleware, validateOrderItems, createOrder);

// Protected admin routes
router.get('/all', authMiddleware, adminOnly, getAllOrders);
router.get('/:id', authMiddleware, getOrderById);
router.patch('/:id/status', authMiddleware, adminOnly, validateOrderStatus, updateOrderStatus);

export default router;
