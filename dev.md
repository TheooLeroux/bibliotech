# BiblioTech – Journal de Développement

## 📘 Présentation du projet

**BiblioTech** est une plateforme web & mobile d’accès, de lecture et de partage de livres numériques.
Elle vise l’accessibilité culturelle pour tous et la mise en avant de jeunes auteurs, dans un environnement technique robuste et évolutif.

---

## ⚙️ Stack technique

### Frontend

* **Framework** : Vue.js
* **Langage** : JavaScript
* **Design** : Responsive, accessible, animations douces

### Backend

* **Langage** : Node.js
* **Framework** : Express
* **Base de données SQL** : MariaDB (données structurées critiques)
* **Base de données NoSQL** : MongoDB (fichiers et logs)

---

## 🧹 Structure des bases de données

### 🔹 MariaDB – SQL (modèle Sequelize)

#### Table `users`

* `id` (PK), `pseudo`, `email`, `password`, `role`, `bio`, `avatar_url`
* `is_active` (bool), `deban_at` (datetime), `last_login` (datetime)
* `created_at`, `updated_at`, `reset_token`, `reset_token_expires`

#### Table `books`

* `id`, `title`, `author`, `description`, `publication_date`, `file_url`
* `mongo_doc_id`, `is_young_author`, `language`, `cover_url`, `visibility`
* `read_count`, `download_count`, `user_id`, `main_genre_id`
* `created_at`, `updated_at`

#### Table `main_genres`

* `id`, `name`

#### Table `sub_genres`

* `id`, `name`

#### Pivot `book_sub_genres`

* `id`, `book_id`, `sub_genre_id`

#### Autres tables

* `favorites`, `reports`, `comments`, `reading_history`

---

### 🔴 MongoDB – NoSQL

#### Collection `ebooks`

```json
{
  _id, book_id, file_path, file_type,
  metadata: { pages, size, encoding },
  uploaded_at
}
```

#### Collection `audit_logs`

```json
{
  _id, user_id, action, target_type, target_id,
  created_at
}
```

---

## ✅ État actuel du backend

### 🔒 Auth & Utilisateur

* [x] Authentification JWT (login / logout / register)
* [x] Réinitialisation de mot de passe (forgot + reset)
* [x] Upload d’avatar utilisateur via Multer
* [x] Modification du profil (pseudo, bio, avatar)
* [x] Protection des routes avec JWT middleware
* [x] Vérification de disponibilité (pseudo/email)
* [x] Récupération des infos du user connecté
* [x] Comptage total d’utilisateurs
* [x] Liste paginée des utilisateurs (admin futur)

### 🧱 Base de données

* [x] Modèle SQL finalisé (Sequelize OK)
* [x] MongoDB fonctionnel pour upload fichiers
* [x] Synchronisation backend/ORM stable

### 🔜 En cours / en attente

* [ ] CRUD Livres + stockage fichier (MongoDB)
* [ ] Historique de lecture utilisateur
* [ ] Favoris, signalements, commentaires
* [ ] Recherche avec filtres dynamiques (genre, jeune auteur)
* [ ] Interface d’administration (bannir, activer, supprimer)
* [ ] Middleware `adminOnly`
* [ ] Tests unitaires (auth/user en priorité)

---

## 🌐 API – Routes actuellement disponibles

### 🔒 Auth (`/api/auth`)

| Méthode | Route                    | Description                    |
| ------- | ------------------------ | ------------------------------ |
| POST    | `/register`              | Créer un compte                |
| POST    | `/login`                 | Connexion avec JWT             |
| POST    | `/logout`                | Déconnexion (client-side)      |
| POST    | `/forgot-password`       | Demande de reset mot de passe  |
| POST    | `/reset-password/:token` | Appliquer nouveau mot de passe |

### 👤 Utilisateur (`/api/users`)

| Méthode | Route                   | Description                                  |
| ------- | ----------------------- | -------------------------------------------- |
| GET     | `/profile`              | Obtenir les infos de l’utilisateur connecté  |
| PUT     | `/profile`              | Modifier pseudo, bio, avatar                 |
| GET     | `/check-pseudo/:pseudo` | Vérifier la disponibilité d’un pseudo        |
| GET     | `/check-email/:email`   | Vérifier la disponibilité d’un email         |
| GET     | `/count`                | Nombre total d’utilisateurs                  |
| GET     | `/`                     | Liste paginée des utilisateurs (admin futur) |

### 📚 Livres (`/api/books`)

| Méthode | Route  | Description                           |
| ------- | ------ | ------------------------------------- |
| POST    | `/`    | Créer un livre (PDF/EPUB + metadata)  |
| GET     | `/`    | Lister tous les livres (avec filtres) |
| GET     | `/:id` | Détails d’un livre                    |
| PUT     | `/:id` | Modifier un livre + cover + eBook     |
| DELETE  | `/:id` | Supprimer un livre (et son eBook)     |

---

## 🔜 Prochaines étapes

1. ☑️ Mettre en place tests Jest pour auth & users
2. 🎯 Implémenter pagination et filtres sur GET /api/books
3. 📊 Ajouter stats de lecture (read\_count, download\_count)
4. 🎨 Optimiser upload de couverture (compression, vignettes)
5. 🚨 Finaliser middleware adminOnly & UI modérateur
6. 🧪 Couvrir les routes livres par tests unitaires

---

> 📌 **Note** : code organisé par domaine (`authController`, `bookController`, `userController`…), middleware dédié, routes isolées = projet prêt pour monter en charge proprement.
