import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';         // file system module to create folders
import { promisify } from 'util';


//Hamro type = module so we can't use _dirname directly 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const ensureUploadsDir = async () => {
  const uploadPath = path.join(__dirname, '../../../uploads');
  try {
    await promisify(fs.access)(uploadPath);    // it checks uploads folder exists
  } catch {
    await promisify(fs.mkdir)(uploadPath, { recursive: true });  // xaina vane it creates it
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    await ensureUploadsDir();  // upload folder check garxa evertime
    cb(null, path.join(__dirname, '../../../uploads'));  // destination set gareko
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);   // Unique file name generate garne
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP,)'), false);  // if someone try pdf, png then simply reject files.
  }
};

// Base multer configuration
const baseMulterConfig = {
  storage: storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 1000 * 1024 * 1024,  // 1GB per file (increase this)
    files: 20,
    fieldSize: 100 * 1024 * 1024,
    fieldNameSize: 500,             // Increase field name size
    fields: 100                     // Increase max fields
  }
};

// Middleware factory functions
export const singleUpload = (fieldName) => multer(baseMulterConfig).single(fieldName);     

export const arrayUpload = (fieldName, maxCount) => 
  multer(baseMulterConfig).array(fieldName, maxCount);

export const fieldsUpload = (fieldsConfig) => 
  multer(baseMulterConfig).fields(fieldsConfig);     //to uploads different fields like images, documents

// Helper to get file URLs
export const getFileUrl = (filename) => `/uploads/${filename}`;   //return file path as url 