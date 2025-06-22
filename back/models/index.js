// models/index.js
const {sequelize}      = require('../config/db.mariadb');
const User           = require('./User');
const Book           = require('./Book');
const MainGenre      = require('./MainGenre');
const SubGenre       = require('./SubGenre');
const BookSubGenre   = require('./BookSubGenre');

// ── Associations Utilisateur ↔ Livre ─────────────────────────────────────────
Book.belongsTo(User,    { foreignKey: 'user_id' });
User.hasMany(Book,      { foreignKey: 'user_id' });

// ── Association Livre → Genre principal ──────────────────────────────────────
Book.belongsTo(MainGenre,   { foreignKey: 'main_genre_id' });
MainGenre.hasMany(Book,     { foreignKey: 'main_genre_id' });

// ── Association Many-to-Many Livre ↔ Sous-genre ─────────────────────────────
Book.belongsToMany(SubGenre, {
    through: BookSubGenre,
    foreignKey: 'book_id',
    otherKey:   'sub_genre_id',
    as:         'subGenres'
});
SubGenre.belongsToMany(Book, {
    through: BookSubGenre,
    foreignKey: 'sub_genre_id',
    otherKey:   'book_id',
    as:         'books'
});

module.exports = {
    sequelize,
    User,
    Book,
    MainGenre,
    SubGenre,
    BookSubGenre,
};


