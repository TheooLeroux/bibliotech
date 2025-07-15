-- ======================================
-- Correction: Créer la table blacklisted_tokens manquante
-- ======================================

USE bibliotech;

-- Créer la table des tokens blacklistés
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

-- Vérifier que la table a été créée
SHOW TABLES LIKE 'blacklisted_tokens';

-- Afficher la structure de la table
DESCRIBE blacklisted_tokens; 