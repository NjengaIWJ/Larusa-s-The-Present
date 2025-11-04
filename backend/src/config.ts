import dotenv from 'dotenv';
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/the_present';
export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
export const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

export const CLOUDINARY = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
};

// Optional: restrict CORS to a known frontend origin in production
export const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || process.env.FRONTEND_URL || ''
