# 📚 BiblioTech API Documentation

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Codes](#response-codes)
- [Endpoints](#endpoints)
  - [Authentication](#endpoints-authentication)
  - [Users](#endpoints-users)
  - [Books](#endpoints-books)
  - [Favorites](#endpoints-favorites)
  - [Reading History](#endpoints-reading-history)
  - [Comments](#endpoints-comments)
  - [Notifications](#endpoints-notifications)
  - [Reports](#endpoints-reports)
  - [Sessions](#endpoints-sessions)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Rate Limits](#rate-limits)
- [Usage Examples](#usage-examples)

## 📖 Overview

The BiblioTech API is a secure REST API for managing a digital library. It allows users to:

- Manage their account and profile
- Browse and upload books
- Manage favorites and reading history
- Comment and rate books
- Receive notifications
- Report inappropriate content

### 🔧 Technologies

- **Framework**: Node.js + Express.js
- **Database**: MariaDB + MongoDB (hybrid)
- **Authentication**: JWT with blacklist
- **Security**: Helmet, CORS, Rate Limiting, Validation
- **Upload**: Multer with MIME validation

## 🔐 Authentication

The API uses JWT (JSON Web Token) authentication. After login, include the token in the `Authorization` header:

```http
Authorization: Bearer <your-jwt-token>
```

### User Types

- **`user`**: Standard user
- **`admin`**: Administrator with extended privileges

## 🌐 Base URL

```
http://localhost:4000/api
```

**Production**: Replace with your production server URL.

## 📊 Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error or invalid data |
| 401 | Unauthorized | Missing, invalid, or expired token |
| 403 | Forbidden | Access denied (insufficient permissions) |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Conflict (e.g., email already in use) |
| 413 | Payload Too Large | File or data too large |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## 🔗 Endpoints

### <a name="endpoints-authentication"></a>🔐 Authentication

#### Register

```http
POST /auth/register
```

**Body:**
```json
{
  "pseudo": "MyUsername",
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Validation:**
- `pseudo`: 2-50 characters, unique
- `email`: Valid email format, unique
- `password`: 8+ characters with uppercase, lowercase, digit, and special character

**Response 201:**
```json
{
  "message": "User created successfully."
}
```

#### Login

```http
POST /auth/login
```

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response 200:**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "pseudo": "MyUsername",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Logged out successfully."
}
```

#### Forgot Password

```http
POST /auth/forgot-password
```

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response 200:**
```json
{
  "message": "Un lien de réinitialisation a été envoyé à votre adresse email."
}
```

#### Reset Password

```http
POST /auth/reset-password/:token
```

**Body:**
```json
{
  "password": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

#### Change Password

```http
PUT /auth/change-password
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

### <a name="endpoints-users"></a>👤 Users

#### Get My Profile

```http
GET /users/profile
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "id": 1,
  "pseudo": "MyUsername",
  "email": "user@example.com",
  "bio": "My biography",
  "avatar_url": "/uploads/avatars/avatar.jpg",
  "role": "user",
  "created_at": "2025-01-24T10:00:00.000Z",
  "last_login": "2025-01-24T11:00:00.000Z"
}
```

#### Update My Profile

```http
PUT /users/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `pseudo` (optional): New username
- `bio` (optional): New biography
- `avatar` (optional): Image file (JPG, PNG, max 5MB)

#### List Users (Admin)

```http
GET /users
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `search`: Search by username or email

#### Delete User

```http
DELETE /users/:id
Authorization: Bearer <token>
```

**Note:** Users can delete their own account or admins can delete any account.

### <a name="endpoints-books"></a>📚 Books

#### List Books

```http
GET /books
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 50)
- `search`: Search by title or author
- `genre`: Filter by main genre
- `subgenre`: Filter by subgenre

**Response 200:**
```json
{
  "books": [
    {
      "id": 1,
      "title": "Book Title",
      "author": "Author Name",
      "description": "Book description",
      "cover_url": "/uploads/covers/cover.jpg",
      "file_url": "/uploads/books/book.pdf",
      "main_genre": "Fiction",
      "sub_genres": ["Science Fiction", "Adventure"],
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

#### Get Book

```http
GET /books/:id
```

**Response 200:**
```json
{
  "id": 1,
  "title": "Book Title",
  "author": "Author Name",
  "description": "Complete description",
  "cover_url": "/uploads/covers/cover.jpg",
  "file_url": "/uploads/books/book.pdf",
  "main_genre": "Fiction",
  "sub_genres": ["Science Fiction", "Adventure"],
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

#### Upload Book

```http
POST /books/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `title`: Book title (required)
- `author`: Author name (required)
- `description`: Description (required)
- `main_genre_id`: Main genre ID (required)
- `sub_genres`: Subgenre IDs separated by comma
- `file`: Ebook file (PDF, EPUB, max 50MB)
- `cover`: Cover image (JPG, PNG, max 5MB)

#### Update Book

```http
PUT /books/:id
Authorization: Bearer <token>
```

**Note:** Only the uploader or an admin can modify a book.

#### Delete Book

```http
DELETE /books/:id
Authorization: Bearer <token>
```

### <a name="endpoints-favorites"></a>❤️ Favorites

#### Add to Favorites

```http
POST /favorites
Authorization: Bearer <token>
```

**Body:**
```json
{
  "bookId": 1
}
```

#### My Favorites

```http
GET /favorites
Authorization: Bearer <token>
```

**Response 200:**
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
        "title": "Book Title",
        "author": "Author Name",
        "cover_url": "/uploads/covers/cover.jpg"
      }
    }
  ]
}
```

#### Remove from Favorites

```http
DELETE /favorites/:bookId
Authorization: Bearer <token>
```

#### Check if Favorite

```http
GET /favorites/check/:bookId
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "success": true,
  "isFavorite": true
}
```

### <a name="endpoints-reading-history"></a>📖 Reading History

#### My Reading History

```http
GET /reading
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (`to_read`, `reading`, `completed`, `abandoned`)

#### My Reading Statistics

```http
GET /reading/stats
Authorization: Bearer <token>
```

**Response 200:**
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

#### Update Reading Status

```http
PUT /reading/:bookId
Authorization: Bearer <token>
```

**Body:**
```json
{
  "status": "reading",
  "progress_percentage": 45,
  "last_page_read": 120
}
```

#### Get Book Reading Status

```http
GET /reading/:bookId
Authorization: Bearer <token>
```

### <a name="endpoints-comments"></a>💬 Comments

#### Add Comment

```http
POST /comments
Authorization: Bearer <token>
```

**Body:**
```json
{
  "bookId": 1,
  "content": "Excellent book! Highly recommend it.",
  "rating": 5
}
```

#### Get Book Comments

```http
GET /comments/book/:bookId
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### Get My Comments

```http
GET /comments/user/:userId
```

#### Update Comment

```http
PUT /comments/:id
Authorization: Bearer <token>
```

#### Delete Comment

```http
DELETE /comments/:id
Authorization: Bearer <token>
```

### <a name="endpoints-notifications"></a>🔔 Notifications

#### My Notifications

```http
GET /notifications
Authorization: Bearer <token>
```

#### Unread Count

```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "count": 3
}
```

#### Mark as Read

```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

#### Mark All as Read

```http
PUT /notifications/mark-all-read
Authorization: Bearer <token>
```

### <a name="endpoints-reports"></a>🚨 Reports

#### Report Content

```http
POST /reports
Authorization: Bearer <token>
```

**Body:**
```json
{
  "type": "book",
  "targetId": 1,
  "reason": "Inappropriate content",
  "description": "This book contains offensive content"
}
```

#### List Reports (Admin)

```http
GET /reports
Authorization: Bearer <admin-token>
```

#### Process Report (Admin)

```http
PUT /reports/:id
Authorization: Bearer <admin-token>
```

### <a name="endpoints-sessions"></a>🔐 Sessions

#### Active Sessions

```http
GET /sessions
Authorization: Bearer <token>
```

#### Revoke Session

```http
DELETE /sessions/:sessionId
Authorization: Bearer <token>
```

#### Revoke All Other Sessions

```http
DELETE /sessions/revoke-others
Authorization: Bearer <token>
```

## 📊 Data Models

### User

```json
{
  "id": 1,
  "pseudo": "MyUsername",
  "email": "user@example.com",
  "bio": "My biography",
  "avatar_url": "/uploads/avatars/avatar.jpg",
  "role": "user",
  "is_active": true,
  "created_at": "2025-01-24T10:00:00.000Z",
  "last_login": "2025-01-24T11:00:00.000Z"
}
```

### Book

```json
{
  "id": 1,
  "title": "Book Title",
  "author": "Author Name",
  "description": "Description",
  "cover_url": "/uploads/covers/cover.jpg",
  "file_url": "/uploads/books/book.pdf",
  "main_genre_id": 1,
  "upload_date": "2025-01-24T10:00:00.000Z",
  "user_id": 2
}
```

### Favorite

```json
{
  "id": 1,
  "user_id": 1,
  "book_id": 1,
  "created_at": "2025-01-24T10:00:00.000Z"
}
```

### Comment

```json
{
  "id": 1,
  "user_id": 1,
  "book_id": 1,
  "content": "Excellent book!",
  "rating": 5,
  "created_at": "2025-01-24T10:00:00.000Z"
}
```

## ⚠️ Error Handling

### Standard Error Format

```json
{
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Validation Errors

```json
{
  "message": "Validation errors",
  "errors": [
    {
      "field": "password",
      "message": "Password must contain at least 8 characters"
    }
  ]
}
```

## ⏱️ Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/auth/login` | 5 attempts | 15 minutes |
| `/auth/register` | 3 attempts | 1 hour |
| `/auth/forgot-password` | 3 attempts | 1 hour |
| Global API | 100 requests | 15 minutes |

## 💡 Usage Examples

### Complete Workflow

```javascript
// 1. Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    pseudo: 'MyUsername',
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});

// 2. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePassword123!'
  })
});

const { token } = await loginResponse.json();

// 3. Use with token
const profileResponse = await fetch('/api/users/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// 4. Add to favorites
const favoriteResponse = await fetch('/api/favorites', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ bookId: 1 })
});

// 5. Logout
const logoutResponse = await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### File Upload

```javascript
const formData = new FormData();
formData.append('title', 'My Book');
formData.append('author', 'My Name');
formData.append('description', 'Book description');
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

For any questions or issues:
- Check automated tests in `/tests/`
- Use the provided Postman collection
- Check server logs in development mode

**API Version:** 1.0.0  
**Last Updated:** January 24, 2025 