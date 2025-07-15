// controllers/bookController.js

const path      = require('path');
const fs        = require('fs');
const Ebook     = require('../models/Ebook');
const Book      = require('../models/Book');
const SubGenre  = require('../models/SubGenre');
const MainGenre = require('../models/MainGenre');
const { User }  = require('../models');

exports.createBook = async (req, res) => {
    try {
        // 1) Fichiers reçus
        const ebookFile = req.files.file?.[0];
        if (!ebookFile) {
            return res.status(400).json({ message: 'eBook file is required.' });
        }
        const coverFile = req.files.cover?.[0] || null;

        // 2) Champs obligatoires
        const {
            title,
            author,
            description = null,
            publication_date = null,
            is_young_author = 'false',
            language,
            main_genre_id,
            subgenre_ids
        } = req.body;

        if (!title || !author || !language || !main_genre_id) {
            return res.status(400).json({
                message: 'Missing required fields: title, author, language & main_genre_id.'
            });
        }

        // 3) Vérifier main genre
        const mg = await MainGenre.findByPk(main_genre_id);
        if (!mg) {
            return res.status(400).json({ message: 'Invalid main_genre_id.' });
        }

        // 4) Stocker métadonnées eBook en MongoDB
        const stats = fs.statSync(ebookFile.path);
        const ext   = path.extname(ebookFile.filename).slice(1).toLowerCase();
        const ebookDoc = await Ebook.create({
            book_id: null,
            file_path: ebookFile.path,
            file_type: ext,
            metadata: {
                pages: null,
                size: stats.size,
                encoding: null
            }
        });

        // 5) Créer le livre en SQL avec valeurs par défaut
        const newBook = await Book.create({
            title,
            author,
            description,
            publication_date,
            file_url: ebookFile.path,
            mongo_doc_id: ebookDoc._id.toString(),
            is_young_author: is_young_author === 'true',
            language,
            cover_url: coverFile ? coverFile.path : null,
            visibility: 'public',     // toujours public à la création
            read_count: 0,            // démarré à 0
            download_count: 0,        // démarré à 0
            user_id: req.user.id,
            main_genre_id: parseInt(main_genre_id, 10)
        });

        // 6) Mettre à jour MongoDB avec l'ID SQL
        ebookDoc.book_id = newBook.id;
        await ebookDoc.save();

        // 7) Associer les sous-genres (si fournis)
        if (subgenre_ids) {
            let subs = Array.isArray(subgenre_ids)
                ? subgenre_ids.map(n => parseInt(n, 10))
                : [parseInt(subgenre_ids, 10)];
            subs = [...new Set(subs.filter(n => !isNaN(n)))];

            const found = await SubGenre.findAll({ where: { id: subs } });
            const validIds = found.map(s => s.id);
            await newBook.setSubGenres(validIds);
        }

        return res.status(201).json({
            message: 'Book created successfully.',
            book: newBook
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};


exports.updateBook = async (req, res) => {
    try {
        const bookId = parseInt(req.params.id, 10);
        const book = await Book.findByPk(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        // (Optionnel) vérifier que c'est bien l'auteur ou un admin
        if (req.user.id !== book.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden.' });
        }

        // 1) Handle eBook file replacement
        if (req.files.file) {
            // Supprimer l'ancien fichier sur disque
            const oldPath = book.file_url;
            if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

            // Supprimer l'ancien document Mongo
            const oldDoc = await Ebook.findOne({ book_id: book.id });
            if (oldDoc) await Ebook.deleteOne({ _id: oldDoc._id });

            // Stocker le nouveau
            const ebookFile = req.files.file[0];
            const stats = fs.statSync(ebookFile.path);
            const ext   = path.extname(ebookFile.filename).slice(1).toLowerCase();
            const newDoc = await Ebook.create({
                book_id: null,
                file_path: ebookFile.path,
                file_type: ext,
                metadata: { pages: null, size: stats.size, encoding: null }
            });
            // Mettre à jour SQL
            book.file_url     = ebookFile.path;
            book.mongo_doc_id = newDoc._id.toString();
            // Lien réciproque
            newDoc.book_id = book.id;
            await newDoc.save();
        }

        // 2) Handle cover replacement
        if (req.files.cover) {
            const coverFile = req.files.cover[0];
            if (book.cover_url && fs.existsSync(book.cover_url)) {
                fs.unlinkSync(book.cover_url);
            }
            book.cover_url = coverFile.path;
        }

        // 3) Mettre à jour les champs metadata
        const {
            title,
            author,
            description,
            publication_date,
            is_young_author,
            language,
            main_genre_id,
            subgenre_ids
        } = req.body;

        if (title)               book.title               = title;
        if (author)              book.author              = author;
        if (description !== undefined) book.description   = description;
        if (publication_date)    book.publication_date    = publication_date;
        if (is_young_author !== undefined) {
            book.is_young_author = is_young_author === 'true';
        }
        if (language)            book.language            = language;
        if (main_genre_id) {
            const mg = await MainGenre.findByPk(main_genre_id);
            if (!mg) return res.status(400).json({ message: 'Invalid main_genre_id.' });
            book.main_genre_id = parseInt(main_genre_id, 10);
        }

        // 4) Enregistrer les changements SQL
        await book.save();

        // 5) Réinitialiser les sous-genres
        if (subgenre_ids !== undefined) {
            let subs = [];
            if (Array.isArray(subgenre_ids)) {
                subs = subgenre_ids.map(n => parseInt(n, 10));
            } else if (typeof subgenre_ids === 'string') {
                subs = subgenre_ids
                    .replace(/[\[\]\s]/g, '')
                    .split(',')
                    .map(n => parseInt(n, 10));
            }
            subs = [...new Set(subs.filter(n => !isNaN(n)))];

            // Garde seulement les existants
            const found = await SubGenre.findAll({ where: { id: subs } });
            const validIds = found.map(sg => sg.id);

            await book.setSubGenres(validIds);
        }

        return res.status(200).json({
            message: 'Book updated successfully.',
            book
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// GET /api/books - Lister tous les livres avec pagination et filtres
exports.getBooks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Filtres optionnels
        const where = { visibility: 'public' };
        if (req.query.author) where.author = { [require('sequelize').Op.iLike]: `%${req.query.author}%` };
        if (req.query.title) where.title = { [require('sequelize').Op.iLike]: `%${req.query.title}%` };
        if (req.query.language) where.language = req.query.language;
        if (req.query.main_genre_id) where.main_genre_id = req.query.main_genre_id;

        const { count, rows } = await Book.findAndCountAll({
            where,
            include: [
                {
                    model: User,
                    attributes: ['id', 'pseudo']
                },
                {
                    model: MainGenre,
                    attributes: ['id', 'name']
                },
                {
                    model: SubGenre,
                    as: 'subGenres',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ],
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        return res.status(200).json({
            message: 'Books retrieved successfully.',
            data: {
                books: rows,
                pagination: {
                    page,
                    limit,
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// GET /api/books/:id - Récupérer un livre par ID
exports.getBook = async (req, res) => {
    try {
        const bookId = parseInt(req.params.id, 10);
        
        const book = await Book.findByPk(bookId, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'pseudo']
                },
                {
                    model: MainGenre,
                    attributes: ['id', 'name']
                },
                {
                    model: SubGenre,
                    as: 'subGenres',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                }
            ]
        });

        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        // Vérifier la visibilité
        if (book.visibility === 'private' && (!req.user || req.user.id !== book.user_id && req.user.role !== 'admin')) {
            return res.status(403).json({ message: 'Access denied to private book.' });
        }

        // Incrémenter le compteur de lecture si connecté
        if (req.user) {
            await book.increment('read_count');
        }

        return res.status(200).json({
            message: 'Book retrieved successfully.',
            book
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};

// DELETE /api/books/:id - Supprimer un livre
exports.deleteBook = async (req, res) => {
    try {
        const bookId = parseInt(req.params.id, 10);
        const book = await Book.findByPk(bookId);

        if (!book) {
            return res.status(404).json({ message: 'Book not found.' });
        }

        // Vérifier les permissions
        if (req.user.id !== book.user_id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden.' });
        }

        // Supprimer les fichiers physiques
        if (book.file_url && fs.existsSync(book.file_url)) {
            fs.unlinkSync(book.file_url);
        }
        if (book.cover_url && fs.existsSync(book.cover_url)) {
            fs.unlinkSync(book.cover_url);
        }

        // Supprimer le document MongoDB
        if (book.mongo_doc_id) {
            await Ebook.deleteOne({ _id: book.mongo_doc_id });
        }

        // Supprimer les relations many-to-many (sous-genres)
        await book.setSubGenres([]);

        // Supprimer le livre de la base SQL
        await book.destroy();

        return res.status(200).json({
            message: 'Book deleted successfully.'
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
};
