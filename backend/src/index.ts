import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { MONGODB_URI, PORT, ALLOWED_ORIGINS } from './config';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import uploadRoutes from './routes/upload';
import logger from './utils/logger';

const app = express();

// Log selected environment configuration at startup (mask sensitive values)
const mask = (s?: string) => {
  if (!s) return ''
  if (s.includes('://')) {
    // try to mask credentials in a URI (e.g. mongodb://user:pass@host)
    return s.replace(/(https?:\/\/|mongodb(?:\+srv)?:\/\/)([^@]*?)@/, (m, p1) => `${p1}****@`)
  }
  if (s.length <= 4) return '****'
  return `${s.slice(0, 2)}****${s.slice(-2)}`
}

const logEnvSummary = () => {
  try {
    logger.info('Environment summary:', {
      NODE_ENV: process.env.NODE_ENV || 'development',
      PORT,
      ALLOWED_ORIGINS,
      MONGODB_URI: mask(MONGODB_URI),
      CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
      CLOUDINARY_API_KEY: mask(process.env.CLOUDINARY_API_KEY),
      JWT_SECRET: mask(process.env.JWT_SECRET),
    })
  } catch (e) {
    // do not fail startup on logging
    logger.warn('Failed to log environment summary')
  }
}

logEnvSummary()

// When running behind a proxy (Render, Heroku), trust the first proxy so IPs and secure cookies work
app.set('trust proxy', 1);

// CORS: allow configured origins (Vercel frontend + others). Fallback to open for dev.
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check against allowed origins
    const allowed = ALLOWED_ORIGINS.some(allowed => {
      // Exact match or wildcard subdomain match
      return origin === allowed || 
             (allowed.startsWith('*.') && origin.endsWith(allowed.slice(1)));
    });
    
    if (allowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

logger.info('CORS allowed origins:', { origins: ALLOWED_ORIGINS });
app.use(cors(corsOptions));

// Accept reasonably sized JSON payloads; uploads handled via multer
app.use(express.json({ limit: '1mb' }));

// Simple security headers (lightweight helmet alternative without extra deps)
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade')
  res.setHeader('Permissions-Policy', 'interest-cohort=()')
  res.setHeader('X-XSS-Protection', '0')
  next()
})

// Lightweight in-memory rate limiter to avoid third-party deps in this repo.
const rateMap = new Map<string, { count: number; reset: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 300 // requests per window
app.use((req, res, next) => {
  try {
    const key = (req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown') as string
    const now = Date.now()
    const entry = rateMap.get(key)
    if (!entry || entry.reset < now) {
      rateMap.set(key, { count: 1, reset: now + RATE_LIMIT_WINDOW })
    } else {
      entry.count += 1
      if (entry.count > RATE_LIMIT_MAX) {
        res.setHeader('Retry-After', String(Math.ceil((entry.reset - now) / 1000)))
        return res.status(429).json({ message: 'Too many requests' })
      }
    }
  } catch (e) {
    // swallow rate limiter errors
  }
  next()
})

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.send({ ok: true, message: 'The Present API' })
  logger.info('Health check endpoint called');
})

app.use((err: any, _req: Request, res: Response, _next: any) => {
  logger.error('Unhandled error:', err?.stack || err);
  res.status(500).json({ message: 'Internal server error' });
});

async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
    const server = app.listen(PORT, () => logger.info(`Server listening on port ${PORT}`));

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...')
      server.close(() => {
        logger.info('HTTP server closed')
        mongoose.disconnect().then(() => {
          logger.info('MongoDB disconnected')
          process.exit(0)
        })
      })
      setTimeout(() => process.exit(1), 10000)
    }
    process.on('SIGTERM', shutdown)
    process.on('SIGINT', shutdown)
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
