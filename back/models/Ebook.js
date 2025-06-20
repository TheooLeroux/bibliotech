// models/Ebook.js
const mongoose = require('mongoose');

const ebookSchema = new mongoose.Schema({
    book_id:    { type: Number, default: null },
    file_path:  { type: String, required: true },
    file_type:  { type: String, enum: ['pdf','epub'], required: true },
    metadata: {
        pages:    { type: Number, default: null },
        size:     { type: Number, default: null },
        encoding: { type: String, default: null }
    },
    uploaded_at:{ type: Date,   default: Date.now }
});

module.exports = mongoose.model('Ebook', ebookSchema);
