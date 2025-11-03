import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { isValidObjectId } from 'mongoose';
import User from '../models/User';
import { JWT_SECRET } from '../config';
import logger from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'customer' | 'vendor' | 'admin';
}

interface LoginRequest {
  email: string;
  password: string;
}

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role = 'customer' } = req.body as RegisterRequest;

    logger.info('Registering user', { email, name, role });

    const existing = await User.findOne({ email });
    if (existing) {
      logger.info('Registration failed: Email in use', { email });
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password: hashed, 
      role 
    });
    await user.save();

    const token = jwt.sign(
      { id: user._id }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    logger.info('User registered successfully', { email, role });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    logger.error('Registration failed', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginRequest;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      logger.info('Login failed: User not found', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.info('Login failed: Invalid password', { email });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info('User logged in successfully', { email, role: user.role });
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login failed', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const getCurrentUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user?._id || !isValidObjectId(req.user._id)) {
      return res.status(401).json({ message: 'Invalid user session' });
    }

    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Get current user failed', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server error while fetching user data' });
  }
};