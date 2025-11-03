import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import Product from '../models/Product';
import logger from '../utils/logger';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

interface ProductRequest {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  images?: string[];
  imageUrls?: string[];
}

function validateObjectId(id: string | undefined, res: Response): boolean {
  if (!id || !isValidObjectId(id)) {
    res.status(400).json({ message: 'Invalid product ID' });
    return false;
  }
  return true;
}

async function uploadFilesAndCollectUrls(files: Express.Multer.File[] | undefined): Promise<string[]> {
  const urls: string[] = [];
  if (files && files.length) {
    for (const f of files) {
      const result = await uploadToCloudinary(f.path);
      urls.push(result.secure_url);
    }
  }
  return urls;
}

/**
 * Public – Get all products
 */
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    logger.error('Failed to fetch products', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

/**
 * Public – Get single product by ID
 */
export const getProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!validateObjectId(id, res)) return;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    logger.error('Failed to fetch product', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

/**
 * Admin – Create new product
 */
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category } = req.body as ProductRequest;
    const files = (req as any).files as Express.Multer.File[] | undefined;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const uploadedUrls = await uploadFilesAndCollectUrls(files);

    const imagesFromBody = Array.isArray(req.body.images || req.body.imageUrls)
      ? (req.body.images || req.body.imageUrls) as string[]
      : [];

    const allImageUrls = [
      ...uploadedUrls,
      ...imagesFromBody.filter(u => typeof u === 'string' && u.length),
    ];

    const product = new Product({
      name,
      description,
      price,
      category,
      images: allImageUrls.map(url => ({ url })),
    });

    await product.save();
    logger.info('Product created successfully', { productId: product._id });
    res.status(201).json(product);
  } catch (error: any) {
    logger.error('Failed to create product', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ message: 'Failed to create product' });
  }
};

/**
 * Admin – Update product
 */
export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!validateObjectId(id, res)) return;

  try {
    const { name, description, price, category, images: imagesBody, imageUrls } = req.body as ProductRequest;
    const files = (req as any).files as Express.Multer.File[] | undefined;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Handle image replacement
    const newUploadedUrls = await uploadFilesAndCollectUrls(files);
    if (newUploadedUrls.length > 0) {
      // delete previous ones
      if (product.images && product.images.length) {
        for (const img of product.images) {
          const url = typeof img === 'string' ? img : (img as any).url || (img as any).secure_url;
          if (url) {
            try {
              await deleteFromCloudinary(url);
            } catch (e) {
              logger.error('Failed to delete old image', e);
            }
          }
        }
      }
      // set new ones
      product.images = newUploadedUrls.map(url => ({ url }));
    } else {
      // no new files: check if frontend supplied image URLs to replace
      const urlsFromBody = Array.isArray(imagesBody || imageUrls)
        ? (imagesBody || imageUrls) as string[]
        : [];

      if (urlsFromBody.length > 0) {
        product.images = urlsFromBody.filter(u => typeof u === 'string' && u.length)
          .map(u => ({ url: u }));
      }
      // else: keep existing images untouched
    }

    // Update other fields
    if (name) product.name = name;
    if (description) product.description = description;
    if (typeof price === 'number') product.price = price;
    if (category) product.category = category;

    await product.save();
    logger.info('Product updated successfully', { productId: id });
    res.json(product);

  } catch (error: any) {
    logger.error('Failed to update product', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ message: 'Failed to update product' });
  }
};

/**
 * Admin – Delete product
 */
export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!validateObjectId(id, res)) return;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.images && product.images.length) {
      for (const img of product.images) {
        const url = typeof img === 'string' ? img : (img as any).url || (img as any).secure_url;
        if (url) {
          try {
            await deleteFromCloudinary(url);
          } catch (e) {
            logger.error('Failed to delete image during product delete', e);
          }
        }
      }
    }

    await Product.findByIdAndDelete(id);
    logger.info('Product deleted successfully', { productId: id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete product', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};
