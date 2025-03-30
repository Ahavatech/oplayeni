import dotenv from 'dotenv';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config(); // Load environment variables

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dawbehmur',
  api_key: process.env.CLOUDINARY_API_KEY || '823436569744459',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'APfSry4-fGljNiCuNTSEIbZBYyA'
});

// Configure Cloudinary storage for profile photos
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'profile-photos',
    format: 'auto',
    resource_type: 'image',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{
      width: 500,
      height: 500,
      crop: 'limit',
      fetch_format: 'auto',
      quality: 'auto'
    }]
  } as any
});

// Configure Cloudinary storage for course materials
const courseMaterialStorage = new CloudinaryStorage({
  cloudinary,
  params: (req: any, file: any) => {
    const isPDF = file.mimetype === 'application/pdf';
    
    return {
      folder: 'course-materials',
      resource_type: isPDF ? 'raw' : 'auto',
      format: isPDF ? 'pdf' : 'auto',
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      use_filename: true,
      unique_filename: true,
      overwrite: false
    };
  }
});

// Update the file filter to be more precise
const fileFilter = (req: any, file: any, cb: Function) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX, JPG, and PNG files are allowed.'));
  }
};

// Multer upload middleware for profile photos
const profilePhotoMiddleware = multer({
  storage: profilePhotoStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb: Function) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
      return new Error('Only image files are allowed.');
    }
  }
}).single('photo');

// Multer upload middleware for course materials
const courseMaterialMiddleware = multer({
  storage: courseMaterialStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter
}).single('file');

// Middleware wrapper for handling uploads
export const upload = {
  single: (fieldName: string) => {
    return (req: any, res: any, next: any) => {
      const middleware = fieldName === 'photo' ? profilePhotoMiddleware : courseMaterialMiddleware;
      middleware(req, res, (err: any) => {
        if (err) {
          console.error('Upload error:', err);
          return res.status(500).json({ error: err.message });
        }
        next();
      });
    };
  }
};
