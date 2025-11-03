import { Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Order from '../models/Order';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

// Get all orders for admin
export const getAllOrders = async (req: AuthRequest, res: Response) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name price imageUrl')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    logger.error('Failed to fetch orders', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get user's orders
export const getUserOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name price imageUrl')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    logger.error('Failed to fetch user orders', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

// Get single order
export const getOrderById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findById(id)
      .populate('user', 'name email')
      .populate('items.product', 'name price imageUrl');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is admin or order owner
    if (req.user?.role !== 'admin' && order.user.toString() !== req.user?._id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    logger.error('Failed to fetch order', error);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
};

interface OrderItem {
  product: string;
  quantity: number;
}

interface CreateOrderRequest {
  items: OrderItem[];
}

// Create new order
export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { items } = req.body as CreateOrderRequest;

    if (!items || !items.length) {
      return res.status(400).json({ message: 'Order must contain at least one item' });
    }

    // Compute total from items (price * quantity) and validate items shape
    let total = 0;
    const normalizedItems = items.map((it) => {
      const quantity = typeof it.quantity === 'number' && it.quantity > 0 ? it.quantity : 1;
      const price = typeof (it as any).price === 'number' && (it as any).price >= 0 ? (it as any).price : 0;
      total += price * quantity;
      return {
        product: it.product,
        quantity,
        price
      };
    });

    const order = new Order({
      user: req.user._id,
      items: normalizedItems,
      total,
      status: 'pending'
    });

    await order.save();
    
    const populatedOrder = await Order.findById(order._id)
      .populate('items.product', 'name price imageUrl')
      .populate('user', 'name email');

    logger.info('Order created successfully', { 
      orderId: order._id, 
      userId: req.user._id 
    });
    
    res.status(201).json(populatedOrder);
  } catch (error) {
    logger.error('Failed to create order', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' };

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    logger.info('Order status updated', { 
      orderId: id, 
      status,
      updatedBy: req.user?._id 
    });

    res.json(order);
  } catch (error) {
    logger.error('Failed to update order status', error);
    res.status(500).json({ message: 'Failed to update order status' });
  }
};