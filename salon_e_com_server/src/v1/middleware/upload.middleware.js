import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary, { isCloudinaryConfigured } from '../../config/cloudinary.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let upload;

if (isCloudinaryConfigured) {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'salon-products',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
            transformation: [{ width: 800, height: 800, crop: 'limit' }]
        }
    });
    upload = multer({ storage: storage });
} else {
    // Disk Storage Configuration
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            const uploadDir = path.join(__dirname, '../../../public/uploads');
            // Ensure directory exists (robustness)
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: function (req, file, cb) {
            // Timestamp + sanitized original name to avoid collisions
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            cb(null, file.fieldname + '-' + uniqueSuffix + ext);
        }
    });

    console.warn('[upload.middleware] Cloudinary not configured. Using local disk storage public/uploads.');
    upload = multer({ storage: storage });
}

export default upload;
