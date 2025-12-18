import {v2 as cloudinary} from "cloudinary"
import {CloudinaryStorage} from 'multer-storage-cloudinary'
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: 'chat',
      resource_type: 'auto',
    };
  },
});
export default storage