import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  description: { type: String, required: true, default: '' },
  price: { type: Number, required: true },
  imageUrl: { type: String, default: '' },
  category: { type: String, required: true, default: 'uncategorized' }
}, { timestamps: true });

export default mongoose.model<IProduct>('Product', ProductSchema);
