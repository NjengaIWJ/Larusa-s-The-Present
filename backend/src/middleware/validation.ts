import { Request, Response, NextFunction } from 'express';

export const validateProductData = (req: Request, res: Response, next: NextFunction) => {
  const { name, price, category } = req.body;

  const errors: Record<string, string> = {};

  if (!name?.trim()) {
    errors.name = 'Product name is required';
  }

  if (typeof price !== 'number' || price <= 0) {
    errors.price = 'Valid price is required';
  }

  if (!category?.trim()) {
    errors.category = 'Category is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      message: 'Invalid product data', 
      errors 
    });
  }

  next();
};

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  const files = (req as any).files as Express.Multer.File[] | undefined;
  const single = (req as any).file as Express.Multer.File | undefined;

  if ((!files || !files.length) && !single) {
    return res.status(400).json({ 
      message: 'No file uploaded',
      errors: { file: 'Image file is required' }
    });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const checkFile = (f: Express.Multer.File) => {
    if (!allowedTypes.includes(f.mimetype)) return 'Only JPG, PNG and GIF images are allowed';
    if (f.size > maxSize) return 'File size must be less than 5MB';
    return null;
  }

  const allFiles = files && files.length ? files : (single ? [single] : []);
  for (const f of allFiles) {
    const err = checkFile(f);
    if (err) return res.status(400).json({ message: 'Invalid file upload', errors: { file: err } });
  }

  next();
};

export const validateOrderItems = (req: Request, res: Response, next: NextFunction) => {
  const { items } = req.body;

  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ 
      message: 'Invalid order data',
      errors: { items: 'Order must contain at least one item' }
    });
  }

  const validItems = items.every(item => 
    item.product && 
    typeof item.quantity === 'number' && 
    item.quantity > 0
  );

  if (!validItems) {
    return res.status(400).json({ 
      message: 'Invalid items data',
      errors: { items: 'Each item must have a valid product ID and quantity' }
    });
  }

  next();
};

export const validateOrderStatus = (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: 'Invalid status',
      errors: { 
        status: `Status must be one of: ${validStatuses.join(', ')}` 
      }
    });
  }

  next();
};

export const validateRegisterInput = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;

  const errors: Record<string, string> = {};

  if (!name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!email?.trim()) {
    errors.email = 'Email is required';
  } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }

  if (role && !['customer', 'vendor', 'admin'].includes(role)) {
    errors.role = 'Role must be customer, vendor, or admin';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }

  next();
};

export const validateLoginInput = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const errors: Record<string, string> = {};

  if (!email?.trim()) {
    errors.email = 'Email is required';
  } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ 
      message: 'Validation failed',
      errors 
    });
  }

  next();
};