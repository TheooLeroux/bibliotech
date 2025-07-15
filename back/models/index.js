// models/index.js
const { sequelize } = require('../config/db.mariadb');
const User = require('./User');
const Book = require('./Book');
const MainGenre = require('./MainGenre');
const SubGenre = require('./SubGenre');
const BookSubGenre = require('./BookSubGenre');
const Favorite = require('./Favorite');
const ReadingHistory = require('./ReadingHistory');
const Comment = require('./Comment');
const Notification = require('./Notification');
const Report = require('./Report');
const UserSession = require('./UserSession');
const BlacklistedToken = require('./BlacklistedToken');

// ── Associations Utilisateur ↔ Livre ─────────────────────────────────────────
Book.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Book, { foreignKey: 'user_id' });

// ── Association Livre → Genre principal ──────────────────────────────────────
Book.belongsTo(MainGenre, { foreignKey: 'main_genre_id' });
MainGenre.hasMany(Book, { foreignKey: 'main_genre_id' });

// ── Association Many-to-Many Livre ↔ Sous-genre ─────────────────────────────
Book.belongsToMany(SubGenre, {
    through: BookSubGenre,
    foreignKey: 'book_id',
    otherKey: 'sub_genre_id',
    as: 'subGenres'
});
SubGenre.belongsToMany(Book, {
    through: BookSubGenre,
    foreignKey: 'sub_genre_id',
    otherKey: 'book_id',
    as: 'books'
});

// ── Association Utilisateur ↔ Favoris ─────────────────────────────────────
User.belongsToMany(Book, {
    through: Favorite,
    foreignKey: 'user_id',
    otherKey: 'book_id',
    as: 'favoriteBooks'
});
Book.belongsToMany(User, {
    through: Favorite,
    foreignKey: 'book_id',
    otherKey: 'user_id',
    as: 'usersFavorited'
});

// ── Association Utilisateur ↔ Historique de lecture ───────────────────────
User.belongsToMany(Book, {
    through: ReadingHistory,
    foreignKey: 'user_id',
    otherKey: 'book_id',
    as: 'readBooks'
});
Book.belongsToMany(User, {
    through: ReadingHistory,
    foreignKey: 'book_id',
    otherKey: 'user_id',
    as: 'readers'
});

// ── Association Utilisateur ↔ Commentaires ─────────────────────────────────
User.hasMany(Comment, { foreignKey: 'user_id' });
Comment.belongsTo(User, { foreignKey: 'user_id' });
Book.hasMany(Comment, { foreignKey: 'book_id' });
Comment.belongsTo(Book, { foreignKey: 'book_id' });

// ── Association Utilisateur ↔ Notifications ───────────────────────────────
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

// ── Association Utilisateur ↔ Reports ──────────────────────────────────────
User.hasMany(Report, { foreignKey: 'reporter_id', as: 'reportsMade' });
Report.belongsTo(User, { foreignKey: 'reporter_id', as: 'reporter' });
Book.hasMany(Report, { foreignKey: 'book_id' });
Report.belongsTo(Book, { foreignKey: 'book_id' });
Comment.hasMany(Report, { foreignKey: 'comment_id' });
Report.belongsTo(Comment, { foreignKey: 'comment_id' });

// ── Association Utilisateur ↔ Sessions ─────────────────────────────────────
User.hasMany(UserSession, { foreignKey: 'user_id' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });

// ── Association Utilisateur ↔ Tokens blacklistés ──────────────────────────
User.hasMany(BlacklistedToken, { foreignKey: 'user_id' });
BlacklistedToken.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
    sequelize,
    User,
    Book,
    MainGenre,
    SubGenre,
    BookSubGenre,
    Favorite,
    ReadingHistory,
    Comment,
    Notification,
    Report,
    UserSession,
    BlacklistedToken
};


