import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary.js';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary is not configured on the backend' });
    }

    const file = (req as Request & { file?: { mimetype: string; buffer: Buffer } }).file;

    if (!file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const base64Image = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'flatmate',
      resource_type: 'image',
    });

    return res.status(200).json({
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
    } catch (error) {
    console.error('Cloudinary upload failed:', error); // check your terminal for the real error
    return res.status(500).json({ 
      error: 'Image upload failed',
      details: error instanceof Error ? error.message : String(error) // add this
    });
  }
  }