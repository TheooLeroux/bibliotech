// middlewares/uploadBook.js
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');

const BOOK_DIR  = 'uploads/books/';
const COVER_DIR = 'uploads/covers/';
[BOOK_DIR, COVER_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'file')  cb(null, BOOK_DIR);
        if (file.fieldname === 'cover') cb(null, COVER_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        if (file.fieldname === 'file') {
            cb(null, `book-${uniqueSuffix}${ext}`);
        } else {
            cb(null, `cover-${uniqueSuffix}${ext}`);
        }
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'file') {
        // Vérification double : extension ET type MIME
        const allowedExtensions = ['.pdf', '.epub'];
        const allowedMimeTypes = ['application/pdf', 'application/epub+zip', 'application/octet-stream'];
        
        const ext = path.extname(file.originalname).toLowerCase();
        const isValidExtension = allowedExtensions.includes(ext);
        const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
        
        if (isValidExtension && isValidMimeType) {
            return cb(null, true);
        } else {
            return cb(new Error(`Invalid eBook file. Only PDF and EPUB files are allowed. Extension: ${ext}, MIME: ${file.mimetype}`), false);
        }
    }
    
    if (file.fieldname === 'cover') {
        // Vérification double : extension ET type MIME pour les images
        const allowedExtensions = ['.jpg', '.jpeg', '.png'];
        const allowedMimeTypes = ['image/jpeg', 'image/png'];
        
        const ext = path.extname(file.originalname).toLowerCase();
        const isValidExtension = allowedExtensions.includes(ext);
        const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
        
        if (isValidExtension && isValidMimeType) {
            return cb(null, true);
        } else {
            return cb(new Error(`Invalid cover image. Only JPEG and PNG files are allowed. Extension: ${ext}, MIME: ${file.mimetype}`), false);
        }
    }
    
    cb(new Error('Unknown field name'), false);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 50 * 1024 * 1024,  // 50MB max
        files: 2  // Maximum 2 fichiers (book + cover)
    }
}).fields([
    { name: 'file',  maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]);
