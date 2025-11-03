import express from 'express';
import { registerUser, loginUser, getCurrentUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validateRegisterInput, validateLoginInput } from '../middleware/validation';

const router = express.Router();

// Public routes
router.post('/register', validateRegisterInput, registerUser);
router.post('/login', validateLoginInput, loginUser);

// Protected routes
router.get('/me', authMiddleware, getCurrentUser);

export default router;

