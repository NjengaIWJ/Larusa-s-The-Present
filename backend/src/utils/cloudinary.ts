import cloudinary from 'cloudinary';
import { CLOUDINARY } from '../config';

cloudinary.v2.config({
  cloud_name: CLOUDINARY.cloud_name,
  api_key: CLOUDINARY.api_key,
  api_secret: CLOUDINARY.api_secret
});

export default cloudinary.v2;
