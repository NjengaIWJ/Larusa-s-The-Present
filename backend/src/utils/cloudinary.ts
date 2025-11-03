import cloudinary from 'cloudinary';
import { unlink } from 'fs/promises';
import { CLOUDINARY } from '../config';

cloudinary.v2.config({
  cloud_name: CLOUDINARY.cloud_name,
  api_key: CLOUDINARY.api_key,
  api_secret: CLOUDINARY.api_secret
});

export const uploadToCloudinary = async (filePath: string) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath);
    await unlink(filePath); // Clean up the temp file
    return result;
  } catch (error) {
    await unlink(filePath).catch(() => { }); // Clean up even on error
    throw error;
  }
};

export const deleteFromCloudinary = async (imageUrl: string) => {
  if (!imageUrl) return;

  try {
    const parts = imageUrl.split('/');
    const lastPart = parts[parts.length - 1];
    if (!lastPart) return;

    const publicId = lastPart.split('.')[0];
    if (publicId) {
      await cloudinary.v2.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary.v2;
