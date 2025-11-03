import mongoose, { Document, Schema } from 'mongoose';

export interface IProductImage {
  url: string;
  publicId?: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  images: IProductImage[];
  category: string;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true, default: '' },
  price: { type: Number, required: true },
  images: { type: [{ url: String, publicId: String }], default: [] },
  category: { type: String, required: true, default: 'uncategorized' }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
