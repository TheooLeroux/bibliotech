const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Vérifie que le dossier existe sinon le crée
const ensureDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const AVATAR_FOLDER = 'uploads/avatars/';
ensureDir(AVATAR_FOLDER);

// Config storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, AVATAR_FOLDER);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const filename = `user-${req.user.id}-${Date.now()}${ext}`;
        cb(null, filename);
    }
});

// Filtrage type mime
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only JPEG and PNG are allowed.'), false);
    }
};

// Init multer
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5 MB max
});

module.exports = upload;
