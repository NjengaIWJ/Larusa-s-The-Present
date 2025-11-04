import dotenv from 'dotenv';
dotenv.config();

export const MONGODB_URI = process.env.MONGODB_URI as string;

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  // Fail fast during application startup if JWT secret is not provided
  throw new Error('Environment variable JWT_SECRET is required');
}
export const JWT_SECRET: string = jwtSecret;

export const PORT = Number(process.env.PORT || 3000);

export const CLOUDINARY = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || ''
};

// Optional: restrict CORS to known frontend origins in production
// Allow multiple origins (comma-separated) for multi-environment setups
const rawOrigins = process.env.ALLOWED_ORIGINS || process.env.FRONTEND_URL || '';
export const ALLOWED_ORIGINS = rawOrigins.split(',').map(origin => origin.trim()).filter(Boolean);

