import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { MONGODB_URI, PORT } from './config';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';
import logger from './utils/logger';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send({ ok: true, message: 'The Present API' })
  logger.info('Health check endpoint called');
})

app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled error:', err);
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
    app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
