import { diskStorage } from 'multer';
import { extname } from 'path';
import { randomBytes } from 'crypto';

export const multerConfig = {
    storage: diskStorage({
        destination: './uploads/profile-pictures', // you can customize this path
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
    }),
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
    },
    fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            return cb(new Error('Only JPG, JPEG, and PNG files are allowed!'), false);
        }
        cb(null, true);
    },
};


export const activityMulterConfig = {
  storage: diskStorage({
    destination: './uploads/activities', // ensure this folder exists
    filename: (_req, file, cb) => {
      const rnd = randomBytes(6).toString('hex');
      const ext = extname(file.originalname) || '';
      cb(null, `activity-${Date.now()}-${rnd}${ext}`);
    },
  }),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3 MB per file
  },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return cb(new Error('Only JPG/JPEG/PNG files are allowed'), false);
    }
    cb(null, true);
  },
};

export const productMulterConfig = {
  storage: diskStorage({
    destination: './uploads/products',
    filename: (_req, file, cb) => {
      const rnd = randomBytes(6).toString('hex');
      const ext = extname(file.originalname) || '';
      cb(null, `product-${Date.now()}-${rnd}${ext}`);
    },
  }),
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB
  },
  fileFilter: (_req: any, file: Express.Multer.File, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return cb(new Error('Only JPG/JPEG/PNG files are allowed'), false);
    }
    cb(null, true);
  },
};