const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const AVATAR_FOLDER = 'uploads/avatars/';
ensureDir(AVATAR_FOLDER);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, AVATAR_FOLDER),
    filename:   (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `user-${req.user.id}-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG are allowed.'), false);
    }
};

module.exports = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});
