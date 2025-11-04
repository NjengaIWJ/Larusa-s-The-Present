import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import User from '../models/User';
import { verifyToken } from '../utils/jwt';

export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = (opts?: { allowGuest?: boolean }) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers?.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : undefined;

    if (!token) {
      if (opts?.allowGuest) return next();
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      // verifyToken will throw if token is invalid or missing required fields
      const payload = verifyToken(token);
      const user = await User.findById(payload.id).select('-password').lean();
      if (!user) {
        if (opts?.allowGuest) return next();
        return res.status(401).json({ message: 'Unauthorized' });
      }
      // attach minimal user info
      req.user = { _id: String(user._id), name: (user as any).name, email: (user as any).email, role: (user as any).role };
      return next();
    } catch (err) {
      if (opts?.allowGuest) return next();
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

// Backwards-compatible alias for single-use middleware without options
export const authMiddleware = requireAuth();

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
};
