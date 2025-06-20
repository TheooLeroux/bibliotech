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
        if (file.fieldname === 'file') {
            cb(null, `book-${Date.now()}${ext}`);
        } else {
            cb(null, `cover-${Date.now()}${ext}`);
        }
    }
});

const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'file') {
        // accepter PDF et EPUB
        const ok = ['.pdf','.epub'].includes(path.extname(file.originalname).toLowerCase());
        return cb(ok ? null : new Error('Only PDF/EPUB allowed'), ok);
    }
    if (file.fieldname === 'cover') {
        // accepter jpeg/png
        const ok = ['.jpg','.jpeg','.png'].includes(path.extname(file.originalname).toLowerCase());
        return cb(ok ? null : new Error('Only JPEG/PNG allowed'), ok);
    }
    cb(null, false);
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 }  // 50MB max
}).fields([
    { name: 'file',  maxCount: 1 },
    { name: 'cover', maxCount: 1 }
]);
