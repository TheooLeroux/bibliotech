-- ======================================
-- BiblioTech - Schema de base de données
-- MariaDB / MySQL
-- ======================================

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS bibliotech 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE bibliotech;

-- ======================================
-- Table des utilisateurs
-- ======================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pseudo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME NULL,
    is_active BOOLEAN DEFAULT TRUE,
    reactivation_date DATETIME NULL,
    avatar_url VARCHAR(255) NULL,
    bio TEXT NULL,
    reset_token VARCHAR(255) NULL,
    reset_token_expires DATETIME NULL,
    anonymized_at DATETIME NULL,
    
    INDEX idx_email (email),
    INDEX idx_pseudo (pseudo),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    INDEX idx_reset_token (reset_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table des genres principaux
-- ======================================
CREATE TABLE IF NOT EXISTS main_genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table des sous-genres
-- ======================================
CREATE TABLE IF NOT EXISTS sub_genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    
    INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table des livres
-- ======================================
CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT NULL,
    publication_date DATE NULL,
    file_url VARCHAR(255) NULL,
    mongo_doc_id VARCHAR(64) NULL,
    is_young_author BOOLEAN DEFAULT FALSE,
    language VARCHAR(10) NULL,
    cover_url VARCHAR(255) NULL,
    visibility ENUM('public', 'private') DEFAULT 'public',
    read_count INT DEFAULT 0,
    download_count INT DEFAULT 0,
    user_id INT NULL,
    main_genre_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_title (title),
    INDEX idx_author (author),
    INDEX idx_language (language),
    INDEX idx_visibility (visibility),
    INDEX idx_user_id (user_id),
    INDEX idx_main_genre_id (main_genre_id),
    INDEX idx_created_at (created_at),
    INDEX idx_mongo_doc_id (mongo_doc_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (main_genre_id) REFERENCES main_genres(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table de liaison livres <-> sous-genres
-- ======================================
CREATE TABLE IF NOT EXISTS book_sub_genres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    sub_genre_id INT NOT NULL,
    
    INDEX idx_book_id (book_id),
    INDEX idx_sub_genre_id (sub_genre_id),
    UNIQUE KEY unique_book_subgenre (book_id, sub_genre_id),
    
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (sub_genre_id) REFERENCES sub_genres(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table des favoris
-- ======================================
CREATE TABLE IF NOT EXISTS favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_favorite (user_id, book_id),
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table de l'historique de lecture
-- ======================================
CREATE TABLE IF NOT EXISTS reading_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    status ENUM('to_read', 'reading', 'completed', 'abandoned') NOT NULL,
    progress_percentage INT DEFAULT 0,
    last_page_read INT DEFAULT 0,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_status (status),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table des commentaires
-- ======================================
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    book_id INT NOT NULL,
    content TEXT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_spoiler BOOLEAN DEFAULT FALSE,
    is_moderated BOOLEAN DEFAULT FALSE,
    
    INDEX idx_user_id (user_id),
    INDEX idx_book_id (book_id),
    INDEX idx_rating (rating),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table des notifications
-- ======================================
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('rgpd_warning', 'new_comment', 'book_update', 'system') NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_is_read (is_read),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table des signalements
-- ======================================
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_id INT NOT NULL,
    book_id INT NULL,
    comment_id INT NULL,
    reason ENUM('inappropriate', 'copyright', 'spam', 'other') NOT NULL,
    description TEXT NULL,
    status ENUM('pending', 'resolved', 'rejected') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    
    INDEX idx_reporter_id (reporter_id),
    INDEX idx_book_id (book_id),
    INDEX idx_comment_id (comment_id),
    INDEX idx_status (status),
    
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table des sessions utilisateur
-- ======================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Table des tokens blacklistés
-- ======================================
CREATE TABLE IF NOT EXISTS blacklisted_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token TEXT NOT NULL,
    user_id INT NOT NULL,
    blacklisted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    
    UNIQUE KEY unique_token (token(255)),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at),
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ======================================
-- Utilisateur Anonyme pour les livres orphelins
-- ======================================
INSERT IGNORE INTO users (id, pseudo, email, password, role, is_active, created_at) VALUES 
(1, 'Anonyme', NULL, NULL, 'user', FALSE, NOW());

-- ======================================
-- Données d'exemple pour les genres
-- ======================================

-- Genres principaux
INSERT IGNORE INTO main_genres (name) VALUES 
('Fiction'),
('Non-Fiction'),
('Science-Fiction'),
('Fantasy'),
('Romance'),
('Thriller'),
('Mystery'),
('Biography'),
('History'),
('Science'),
('Technology'),
('Arts'),
('Philosophy'),
('Religion'),
('Self-Help');

-- Sous-genres
INSERT IGNORE INTO sub_genres (name) VALUES 
('Adventure'),
('Crime'),
('Drama'),
('Horror'),
('Comedy'),
('Action'),
('Suspense'),
('Contemporary'),
('Classic'),
('Young Adult'),
('Children'),
('Educational'),
('Reference'),
('Guide'),
('Memoir'),
('Essay'),
('Poetry'),
('Short Stories'),
('Graphic Novel'),
('Manga');

-- ======================================
-- Vues pour les statistiques
-- ======================================

-- Vue pour les statistiques des livres par genre
CREATE OR REPLACE VIEW books_by_genre AS
SELECT 
    mg.name AS main_genre,
    COUNT(b.id) AS book_count,
    AVG(b.read_count) AS avg_read_count,
    SUM(b.download_count) AS total_downloads
FROM main_genres mg
LEFT JOIN books b ON mg.id = b.main_genre_id AND b.visibility = 'public'
GROUP BY mg.id, mg.name
ORDER BY book_count DESC;

-- Vue pour les livres populaires
CREATE OR REPLACE VIEW popular_books AS
SELECT 
    b.id,
    b.title,
    b.author,
    b.read_count,
    b.download_count,
    mg.name AS main_genre,
    u.pseudo AS uploader,
    COUNT(DISTINCT c.id) AS comment_count,
    AVG(c.rating) AS avg_rating
FROM books b
LEFT JOIN main_genres mg ON b.main_genre_id = mg.id
LEFT JOIN users u ON b.user_id = u.id
LEFT JOIN comments c ON b.id = c.book_id
WHERE b.visibility = 'public'
GROUP BY b.id, b.title, b.author, b.read_count, b.download_count, mg.name, u.pseudo
ORDER BY (b.read_count + b.download_count) DESC
LIMIT 50;

-- Vue pour les statistiques utilisateur
CREATE OR REPLACE VIEW user_reading_stats AS
SELECT 
    u.id,
    u.pseudo,
    COUNT(DISTINCT rh.book_id) AS total_books_read,
    COUNT(DISTINCT CASE WHEN rh.status = 'completed' THEN rh.book_id END) AS completed_books,
    COUNT(DISTINCT f.book_id) AS favorites_count,
    COUNT(DISTINCT c.id) AS comments_count,
    AVG(c.rating) AS avg_rating_given
FROM users u
LEFT JOIN reading_history rh ON u.id = rh.user_id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN comments c ON u.id = c.user_id
GROUP BY u.id, u.pseudo;

-- ======================================
-- Procédures stockées pour la maintenance
-- ======================================

DELIMITER //

-- Procédure pour nettoyer les tokens expirés
CREATE OR REPLACE PROCEDURE CleanExpiredTokens()
BEGIN
    -- Nettoyer les tokens de reset password
    UPDATE users 
    SET reset_token = NULL, reset_token_expires = NULL
    WHERE reset_token_expires IS NOT NULL 
    AND reset_token_expires < NOW();
    
    -- Nettoyer les tokens blacklistés expirés
    DELETE FROM blacklisted_tokens 
    WHERE expires_at < NOW();
    
    -- Nettoyer les sessions expirées
    DELETE FROM user_sessions 
    WHERE expires_at < NOW();
    
    SELECT 
        (SELECT COUNT(*) FROM users WHERE reset_token IS NOT NULL) AS active_reset_tokens,
        (SELECT COUNT(*) FROM blacklisted_tokens) AS blacklisted_tokens,
        (SELECT COUNT(*) FROM user_sessions WHERE expires_at > NOW()) AS active_sessions;
END //

-- Procédure pour obtenir les statistiques globales
CREATE OR REPLACE PROCEDURE GetGlobalStats()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM users WHERE is_active = TRUE) AS active_users,
        (SELECT COUNT(*) FROM books WHERE visibility = 'public') AS public_books,
        (SELECT COUNT(*) FROM main_genres) AS main_genres_count,
        (SELECT COUNT(*) FROM sub_genres) AS sub_genres_count,
        (SELECT COUNT(*) FROM favorites) AS total_favorites,
        (SELECT COUNT(*) FROM comments) AS total_comments,
        (SELECT COUNT(*) FROM reading_history) AS total_reading_entries,
        (SELECT COUNT(*) FROM reports WHERE status = 'pending') AS pending_reports,
        (SELECT COUNT(*) FROM notifications WHERE is_read = FALSE) AS unread_notifications;
END //

DELIMITER ;

-- ======================================
-- Triggers pour maintenir la cohérence
-- ======================================

DELIMITER //

-- Trigger pour mettre à jour les compteurs de lecture
CREATE OR REPLACE TRIGGER update_book_stats
AFTER INSERT ON reading_history
FOR EACH ROW
BEGIN
    IF NEW.status = 'reading' THEN
        UPDATE books SET read_count = read_count + 1 WHERE id = NEW.book_id;
    END IF;
END //

-- Trigger pour créer une notification lors d'un nouveau commentaire
CREATE OR REPLACE TRIGGER notify_new_comment
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    DECLARE book_owner_id INT;
    
    SELECT user_id INTO book_owner_id 
    FROM books 
    WHERE id = NEW.book_id;
    
    IF book_owner_id IS NOT NULL AND book_owner_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, content)
        VALUES (book_owner_id, 'new_comment', 
                CONCAT('Nouveau commentaire sur votre livre par ', 
                       (SELECT pseudo FROM users WHERE id = NEW.user_id)));
    END IF;
END //

DELIMITER ;

-- ======================================
-- Index supplémentaires pour les performances
-- ======================================

-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_user_book_status ON reading_history(user_id, book_id, status);
CREATE INDEX idx_book_rating ON comments(book_id, rating);
CREATE INDEX idx_user_notifications ON notifications(user_id, is_read, created_at);
CREATE INDEX idx_token_expires ON blacklisted_tokens(expires_at);

-- Index pour les recherches full-text
CREATE FULLTEXT INDEX idx_book_search ON books(title, author, description);

-- ======================================
-- Configuration finale
-- ======================================

-- Optimisations pour le développement
SET GLOBAL innodb_flush_log_at_trx_commit = 2;
SET GLOBAL sync_binlog = 0;

-- Message de fin
SELECT 'BiblioTech database schema created successfully!' AS message;
