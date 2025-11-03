import { Request, Response } from 'express';
import { isValidObjectId } from 'mongoose';
import Product from '../models/Product';
import logger from '../utils/logger';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinary';

interface ProductRequest {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
}

// Get all products (public)
export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    logger.error('Failed to fetch products', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get single product by ID (public)
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

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

// Create new product (admin only)
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, category } = req.body as ProductRequest;
    const file = req.file;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let imageUrl = '';
    if (file) {
      const uploadResult = await uploadToCloudinary(file.path);
      imageUrl = uploadResult.secure_url;
    }

    const product = new Product({
      name,
      description,
      price,
      category,
      imageUrl
    });

    await product.save();
    logger.info('Product created successfully', { productId: product._id });
    res.status(201).json(product);
  } catch (error) {
    logger.error('Failed to create product', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// Update product (admin only)
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, category } = req.body as ProductRequest;
    const file = req.file;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (file) {
      if (product.imageUrl) {
        // Delete old image from Cloudinary
        await deleteFromCloudinary(product.imageUrl);
      }
      const uploadResult = await uploadToCloudinary(file.path);
      product.imageUrl = uploadResult.secure_url;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;

    await product.save();
    logger.info('Product updated successfully', { productId: id });
    res.json(product);
  } catch (error) {
    logger.error('Failed to update product', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.imageUrl) {
      await deleteFromCloudinary(product.imageUrl);
    }

    await Product.findByIdAndDelete(id);
    logger.info('Product deleted successfully', { productId: id });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete product', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};