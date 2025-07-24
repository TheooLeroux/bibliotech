# 📚 Documentation API BiblioTech

## 📋 Table des Matières

- [Aperçu](#aperçu)
- [Authentification](#authentification)
- [URL de Base](#url-de-base)
- [Codes de Réponse](#codes-de-réponse)
- [Endpoints](#endpoints)
  - [Authentification](#endpoints-authentification)
  - [Utilisateurs](#endpoints-utilisateurs)
  - [Livres](#endpoints-livres)
  - [Favoris](#endpoints-favoris)
  - [Historique de Lecture](#endpoints-historique-de-lecture)
  - [Commentaires](#endpoints-commentaires)
  - [Notifications](#endpoints-notifications)
  - [Signalements](#endpoints-signalements)
  - [Sessions](#endpoints-sessions)
- [Modèles de Données](#modèles-de-données)
- [Gestion d'Erreurs](#gestion-derreurs)
- [Limites de Taux](#limites-de-taux)
- [Exemples d'Utilisation](#exemples-dutilisation)

## 📖 Aperçu

L'API BiblioTech est une API REST sécurisée pour la gestion d'une bibliothèque numérique. Elle permet aux utilisateurs de :

- Gérer leur compte et profil
- Parcourir et télécharger des livres
- Gérer leurs favoris et historique de lecture
- Commenter et noter les livres
- Recevoir des notifications
- Signaler du contenu inapproprié

### 🔧 Technologies

- **Framework** : Node.js + Express.js
- **Base de données** : MariaDB + MongoDB (hybride)
- **Authentification** : JWT avec blacklist
- **Sécurité** : Helmet, CORS, Rate Limiting, Validation
- **Upload** : Multer avec validation MIME

## 🔐 Authentification

L'API utilise l'authentification JWT (JSON Web Token). Après connexion, incluez le token dans l'en-tête `Authorization` :

```http
Authorization: Bearer <your-jwt-token>
```

### Types d'Utilisateurs

- **`user`** : Utilisateur standard
- **`admin`** : Administrateur avec privilèges étendus

## 🌐 URL de Base

```
http://localhost:4000/api
```

**Production** : Remplacez par l'URL de votre serveur de production.

## 📊 Codes de Réponse

| Code | Signification | Description |
|------|---------------|-------------|
| 200 | OK | Requête réussie |
| 201 | Created | Ressource créée avec succès |
| 400 | Bad Request | Erreur de validation ou données invalides |
| 401 | Unauthorized | Token manquant, invalide ou expiré |
| 403 | Forbidden | Accès interdit (permissions insuffisantes) |
| 404 | Not Found | Ressource non trouvée |
| 409 | Conflict | Conflit (ex: email déjà utilisé) |
| 413 | Payload Too Large | Fichier ou données trop volumineux |
| 429 | Too Many Requests | Limite de taux dépassée |
| 500 | Internal Server Error | Erreur serveur |

## 🔗 Endpoints

### <a name="endpoints-authentification"></a>🔐 Authentification

#### Inscription

```http
POST /auth/register
```

**Body :**
```json
{
  "pseudo": "MonPseudo",
  "email": "user@example.com",
  "password": "MotDePasseSecurise123!"
}
```

**Validation :**
- `pseudo` : 2-50 caractères, unique
- `email` : Format email valide, unique
- `password` : 8+ caractères avec majuscule, minuscule, chiffre et caractère spécial

**Réponse 201 :**
```json
{
  "message": "User created successfully."
}
```

#### Connexion

```http
POST /auth/login
```

**Body :**
```json
{
  "email": "user@example.com",
  "password": "MotDePasseSecurise123!"
}
```

**Réponse 200 :**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "pseudo": "MonPseudo",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Déconnexion

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{
  "message": "Logged out successfully."
}
```

#### Mot de Passe Oublié

```http
POST /auth/forgot-password
```

**Body :**
```json
{
  "email": "user@example.com"
}
```

**Réponse 200 :**
```json
{
  "message": "Un lien de réinitialisation a été envoyé à votre adresse email."
}
```

#### Réinitialisation du Mot de Passe

```http
POST /auth/reset-password/:token
```

**Body :**
```json
{
  "password": "NouveauMotDePasse123!",
  "confirmPassword": "NouveauMotDePasse123!"
}
```

#### Changer le Mot de Passe

```http
PUT /auth/change-password
Authorization: Bearer <token>
```

**Body :**
```json
{
  "currentPassword": "AncienMotDePasse123!",
  "newPassword": "NouveauMotDePasse123!",
  "confirmPassword": "NouveauMotDePasse123!"
}
```

### <a name="endpoints-utilisateurs"></a>👤 Utilisateurs

#### Récupérer mon Profil

```http
GET /users/profile
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{
  "id": 1,
  "pseudo": "MonPseudo",
  "email": "user@example.com",
  "bio": "Ma biographie",
  "avatar_url": "/uploads/avatars/avatar.jpg",
  "role": "user",
  "created_at": "2025-01-24T10:00:00.000Z",
  "last_login": "2025-01-24T11:00:00.000Z"
}
```

#### Mettre à Jour mon Profil

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data) :**
- `pseudo` (optionnel) : Nouveau pseudo
- `bio` (optionnel) : Nouvelle biographie
- `avatar` (optionnel) : Fichier image (JPG, PNG, max 5MB)

#### Lister les Utilisateurs (Admin)

```http
GET /users
Authorization: Bearer <admin-token>
```

**Query Parameters :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Éléments par page (défaut: 10, max: 100)
- `search` : Recherche par pseudo ou email

#### Supprimer un Utilisateur

```http
DELETE /users/:id
Authorization: Bearer <token>
```

**Note :** Les utilisateurs peuvent supprimer leur propre compte ou les admins peuvent supprimer n'importe quel compte.

### <a name="endpoints-livres"></a>📚 Livres

#### Lister les Livres

```http
GET /books
```

**Query Parameters :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Éléments par page (défaut: 12, max: 50)
- `search` : Recherche par titre ou auteur
- `genre` : Filtrer par genre principal
- `subgenre` : Filtrer par sous-genre

**Réponse 200 :**
```json
{
  "books": [
    {
      "id": 1,
      "title": "Titre du Livre",
      "author": "Auteur",
      "description": "Description du livre",
      "cover_url": "/uploads/covers/cover.jpg",
      "file_url": "/uploads/books/book.pdf",
      "main_genre": "Fiction",
      "sub_genres": ["Science-Fiction", "Aventure"],
      "upload_date": "2025-01-24T10:00:00.000Z",
      "uploader": {
        "id": 2,
        "pseudo": "Uploader"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_books": 48,
    "per_page": 12
  }
}
```

#### Récupérer un Livre

```http
GET /books/:id
```

**Réponse 200 :**
```json
{
  "id": 1,
  "title": "Titre du Livre",
  "author": "Auteur",
  "description": "Description complète",
  "cover_url": "/uploads/covers/cover.jpg",
  "file_url": "/uploads/books/book.pdf",
  "main_genre": "Fiction",
  "sub_genres": ["Science-Fiction", "Aventure"],
  "upload_date": "2025-01-24T10:00:00.000Z",
  "uploader": {
    "id": 2,
    "pseudo": "Uploader"
  },
  "stats": {
    "favorites_count": 25,
    "comments_count": 12,
    "average_rating": 4.2
  }
}
```

#### Télécharger un Livre

```http
POST /books/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data) :**
- `title` : Titre du livre (requis)
- `author` : Auteur (requis)
- `description` : Description (requis)
- `main_genre_id` : ID du genre principal (requis)
- `sub_genres` : IDs des sous-genres séparés par virgule
- `file` : Fichier ebook (PDF, EPUB, max 50MB)
- `cover` : Image de couverture (JPG, PNG, max 5MB)

#### Mettre à Jour un Livre

```http
PUT /books/:id
Authorization: Bearer <token>
```

**Note :** Seul l'uploader ou un admin peut modifier un livre.

#### Supprimer un Livre

```http
DELETE /books/:id
Authorization: Bearer <token>
```

### <a name="endpoints-favoris"></a>❤️ Favoris

#### Ajouter aux Favoris

```http
POST /favorites
Authorization: Bearer <token>
```

**Body :**
```json
{
  "bookId": 1
}
```

#### Mes Favoris

```http
GET /favorites
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "book_id": 1,
      "created_at": "2025-01-24T10:00:00.000Z",
      "book": {
        "id": 1,
        "title": "Titre du Livre",
        "author": "Auteur",
        "cover_url": "/uploads/covers/cover.jpg"
      }
    }
  ]
}
```

#### Retirer des Favoris

```http
DELETE /favorites/:bookId
Authorization: Bearer <token>
```

#### Vérifier si en Favoris

```http
GET /favorites/check/:bookId
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{
  "success": true,
  "isFavorite": true
}
```

### <a name="endpoints-historique-de-lecture"></a>📖 Historique de Lecture

#### Mon Historique

```http
GET /reading
Authorization: Bearer <token>
```

**Query Parameters :**
- `status` : Filtrer par statut (`to_read`, `reading`, `completed`, `abandoned`)

#### Mes Statistiques de Lecture

```http
GET /reading/stats
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{
  "success": true,
  "data": {
    "statusBreakdown": [
      {"status": "completed", "count": 15},
      {"status": "reading", "count": 3},
      {"status": "to_read", "count": 8}
    ],
    "totalBooks": 26,
    "completedBooks": 15
  }
}
```

#### Mettre à Jour le Statut de Lecture

```http
PUT /reading/:bookId
Authorization: Bearer <token>
```

**Body :**
```json
{
  "status": "reading",
  "progress_percentage": 45,
  "last_page_read": 120
}
```

#### Statut de Lecture d'un Livre

```http
GET /reading/:bookId
Authorization: Bearer <token>
```

### <a name="endpoints-commentaires"></a>💬 Commentaires

#### Ajouter un Commentaire

```http
POST /comments
Authorization: Bearer <token>
```

**Body :**
```json
{
  "bookId": 1,
  "content": "Excellent livre ! Je le recommande vivement.",
  "rating": 5
}
```

#### Commentaires d'un Livre

```http
GET /comments/book/:bookId
```

**Query Parameters :**
- `page` : Numéro de page (défaut: 1)
- `limit` : Éléments par page (défaut: 10)

#### Mes Commentaires

```http
GET /comments/user/:userId
```

#### Modifier un Commentaire

```http
PUT /comments/:id
Authorization: Bearer <token>
```

#### Supprimer un Commentaire

```http
DELETE /comments/:id
Authorization: Bearer <token>
```

### <a name="endpoints-notifications"></a>🔔 Notifications

#### Mes Notifications

```http
GET /notifications
Authorization: Bearer <token>
```

#### Compteur Non Lues

```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

**Réponse 200 :**
```json
{
  "count": 3
}
```

#### Marquer comme Lue

```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

#### Marquer Toutes comme Lues

```http
PUT /notifications/mark-all-read
Authorization: Bearer <token>
```

### <a name="endpoints-signalements"></a>🚨 Signalements

#### Signaler du Contenu

```http
POST /reports
Authorization: Bearer <token>
```

**Body :**
```json
{
  "type": "book",
  "targetId": 1,
  "reason": "Contenu inapproprié",
  "description": "Ce livre contient du contenu offensant"
}
```

#### Liste des Signalements (Admin)

```http
GET /reports
Authorization: Bearer <admin-token>
```

#### Traiter un Signalement (Admin)

```http
PUT /reports/:id
Authorization: Bearer <admin-token>
```

### <a name="endpoints-sessions"></a>🔐 Sessions

#### Sessions Actives

```http
GET /sessions
Authorization: Bearer <token>
```

#### Révoquer une Session

```http
DELETE /sessions/:sessionId
Authorization: Bearer <token>
```

#### Révoquer Toutes les Autres Sessions

```http
DELETE /sessions/revoke-others
Authorization: Bearer <token>
```

## 📊 Modèles de Données

### Utilisateur

```json
{
  "id": 1,
  "pseudo": "MonPseudo",
  "email": "user@example.com",
  "bio": "Ma biographie",
  "avatar_url": "/uploads/avatars/avatar.jpg",
  "role": "user",
  "is_active": true,
  "created_at": "2025-01-24T10:00:00.000Z",
  "last_login": "2025-01-24T11:00:00.000Z"
}
```

### Livre

```json
{
  "id": 1,
  "title": "Titre du Livre",
  "author": "Auteur",
  "description": "Description",
  "cover_url": "/uploads/covers/cover.jpg",
  "file_url": "/uploads/books/book.pdf",
  "main_genre_id": 1,
  "upload_date": "2025-01-24T10:00:00.000Z",
  "user_id": 2
}
```

### Favori

```json
{
  "id": 1,
  "user_id": 1,
  "book_id": 1,
  "created_at": "2025-01-24T10:00:00.000Z"
}
```

### Commentaire

```json
{
  "id": 1,
  "user_id": 1,
  "book_id": 1,
  "content": "Excellent livre !",
  "rating": 5,
  "created_at": "2025-01-24T10:00:00.000Z"
}
```

## ⚠️ Gestion d'Erreurs

### Format d'Erreur Standard

```json
{
  "message": "Description de l'erreur",
  "errors": [
    {
      "field": "email",
      "message": "Format email invalide"
    }
  ]
}
```

### Erreurs de Validation

```json
{
  "message": "Validation errors",
  "errors": [
    {
      "field": "password",
      "message": "Le mot de passe doit contenir au moins 8 caractères"
    }
  ]
}
```

## ⏱️ Limites de Taux

| Endpoint | Limite | Fenêtre |
|----------|--------|---------|
| `/auth/login` | 5 tentatives | 15 minutes |
| `/auth/register` | 3 tentatives | 1 heure |
| `/auth/forgot-password` | 3 tentatives | 1 heure |
| Global API | 100 requêtes | 15 minutes |

## 💡 Exemples d'Utilisation

### Workflow Complet

```javascript
// 1. Inscription
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pseudo: 'MonPseudo',
    email: 'user@example.com',
    password: 'MotDePasseSecurise123!'
  })
});

// 2. Connexion
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'MotDePasseSecurise123!'
  })
});

const { token } = await loginResponse.json();

// 3. Utilisation avec token
const profileResponse = await fetch('/api/users/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 4. Ajouter aux favoris
const favoriteResponse = await fetch('/api/favorites', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ bookId: 1 })
});

// 5. Déconnexion
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Upload de Fichier

```javascript
const formData = new FormData();
formData.append('title', 'Mon Livre');
formData.append('author', 'Mon Nom');
formData.append('description', 'Description du livre');
formData.append('main_genre_id', '1');
formData.append('file', fileInput.files[0]);
formData.append('cover', coverInput.files[0]);

const uploadResponse = await fetch('/api/books/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
```

---

## 📞 Support

Pour toute question ou problème :
- Consultez les tests automatisés dans `/tests/`
- Utilisez la collection Postman fournie
- Vérifiez les logs du serveur en mode développement

**Version de l'API :** 1.0.0  
**Dernière mise à jour :** 24 janvier 2025 