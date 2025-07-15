# Guide de Tests Complet - BiblioTech API

## Configuration Postman

### Variables d'environnement
1. Créer un environnement "BiblioTech"
2. Variables :
   - `baseUrl` : `http://localhost:3000`
   - `token` : (sera rempli automatiquement)
   - `userId` : (sera rempli automatiquement)
   - `bookId` : (sera rempli automatiquement)

## 1. Tests d'Authentification

### 1.1 Inscription d'un nouvel utilisateur
**POST** `{{baseUrl}}/api/auth/register`
```json
{
  "pseudo": "TestUser",
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```

### 1.2 Connexion
**POST** `{{baseUrl}}/api/auth/login`
```json
{
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```
**Script Postman :**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    pm.environment.set("userId", response.user.id);
}
```

### 1.3 Mot de passe oublié
**POST** `{{baseUrl}}/api/auth/forgot-password`
```json
{
  "email": "test@example.com"
}
```

### 1.4 Déconnexion
**POST** `{{baseUrl}}/api/auth/logout`
Headers: `Authorization: Bearer {{token}}`

## 2. Tests Utilisateur

### 2.1 Profil utilisateur
**GET** `{{baseUrl}}/api/users/profile`
Headers: `Authorization: Bearer {{token}}`

### 2.2 Mise à jour du profil
**PUT** `{{baseUrl}}/api/users/profile`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "bio": "Ma nouvelle bio",
  "pseudo": "NewPseudo"
}
```

### 2.3 Changement de mot de passe
**PUT** `{{baseUrl}}/api/auth/change-password`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "currentPassword": "TestPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

### 2.4 Liste des utilisateurs (admin)
**GET** `{{baseUrl}}/api/users`
Headers: `Authorization: Bearer {{token}}`

## 3. Tests Livres

### 3.1 Liste des livres
**GET** `{{baseUrl}}/api/books`

### 3.2 Détails d'un livre
**GET** `{{baseUrl}}/api/books/1`

### 3.3 Upload d'un livre
**POST** `{{baseUrl}}/api/books/upload`
Headers: `Authorization: Bearer {{token}}`
Body (form-data):
- `title`: "Mon Livre Test"
- `author`: "Auteur Test"
- `description`: "Description du livre"
- `mainGenre`: "1"
- `subGenres`: "1,2"
- `file`: [Fichier PDF/EPUB]
- `cover`: [Image JPG/PNG]

**Script Postman :**
```javascript
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("bookId", response.book.id);
}
```

### 3.4 Mise à jour d'un livre
**PUT** `{{baseUrl}}/api/books/{{bookId}}`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "title": "Titre modifié",
  "description": "Nouvelle description"
}
```

### 3.5 Suppression d'un livre
**DELETE** `{{baseUrl}}/api/books/{{bookId}}`
Headers: `Authorization: Bearer {{token}}`

## 4. Tests Favoris

### 4.1 Ajouter aux favoris
**POST** `{{baseUrl}}/api/favorites`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "bookId": "{{bookId}}"
}
```

### 4.2 Mes favoris
**GET** `{{baseUrl}}/api/favorites`
Headers: `Authorization: Bearer {{token}}`

### 4.3 Retirer des favoris
**DELETE** `{{baseUrl}}/api/favorites/{{bookId}}`
Headers: `Authorization: Bearer {{token}}`

## 5. Tests Historique de Lecture

### 5.1 Marquer comme lu
**POST** `{{baseUrl}}/api/reading`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "bookId": "{{bookId}}",
  "progress": 50,
  "status": "reading"
}
```

### 5.2 Mon historique
**GET** `{{baseUrl}}/api/reading`
Headers: `Authorization: Bearer {{token}}`

### 5.3 Mettre à jour le progrès
**PUT** `{{baseUrl}}/api/reading/{{bookId}}`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "progress": 100,
  "status": "completed"
}
```

## 6. Tests Commentaires

### 6.1 Ajouter un commentaire
**POST** `{{baseUrl}}/api/comments`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "bookId": "{{bookId}}",
  "content": "Excellent livre !",
  "rating": 5
}
```

### 6.2 Commentaires d'un livre
**GET** `{{baseUrl}}/api/comments/book/{{bookId}}`

### 6.3 Mes commentaires
**GET** `{{baseUrl}}/api/comments/user/{{userId}}`

### 6.4 Modifier un commentaire
**PUT** `{{baseUrl}}/api/comments/1`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "content": "Commentaire modifié",
  "rating": 4
}
```

## 7. Tests Notifications

### 7.1 Mes notifications
**GET** `{{baseUrl}}/api/notifications`
Headers: `Authorization: Bearer {{token}}`

### 7.2 Marquer comme lu
**PUT** `{{baseUrl}}/api/notifications/1/read`
Headers: `Authorization: Bearer {{token}}`

### 7.3 Marquer toutes comme lues
**PUT** `{{baseUrl}}/api/notifications/mark-all-read`
Headers: `Authorization: Bearer {{token}}`

## 8. Tests Signalements

### 8.1 Signaler un contenu
**POST** `{{baseUrl}}/api/reports`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "type": "book",
  "targetId": "{{bookId}}",
  "reason": "Contenu inapproprié",
  "description": "Ce livre contient du contenu offensant"
}
```

### 8.2 Liste des signalements (admin)
**GET** `{{baseUrl}}/api/reports`
Headers: `Authorization: Bearer {{token}}`

### 8.3 Traiter un signalement (admin)
**PUT** `{{baseUrl}}/api/reports/1`
Headers: `Authorization: Bearer {{token}}`
```json
{
  "status": "resolved",
  "adminNotes": "Signalement traité"
}
```

## 9. Tests de Sécurité

### 9.1 Test token expiré/invalide
Utiliser un mauvais token dans `Authorization: Bearer INVALID_TOKEN`

### 9.2 Test rate limiting
Faire plusieurs requêtes rapidement sur `/api/auth/login`

### 9.3 Test token blacklisté
1. Se connecter
2. Se déconnecter
3. Essayer d'utiliser l'ancien token

## 10. Tests des Sessions

### 10.1 Sessions actives
**GET** `{{baseUrl}}/api/sessions`
Headers: `Authorization: Bearer {{token}}`

### 10.2 Révoquer une session
**DELETE** `{{baseUrl}}/api/sessions/1`
Headers: `Authorization: Bearer {{token}}`
Note: Remplacez "1" par l'ID de session réel obtenu via GET /api/sessions

### 10.3 Révoquer toutes les autres sessions
**DELETE** `{{baseUrl}}/api/sessions/revoke-others`
Headers: `Authorization: Bearer {{token}}`

## Codes de Réponse Attendus

- ✅ **200** : Succès
- ✅ **201** : Créé avec succès
- ❌ **400** : Erreur de validation
- ❌ **401** : Non autorisé (token manquant/invalide)
- ❌ **403** : Accès interdit (permissions insuffisantes)
- ❌ **404** : Ressource non trouvée
- ❌ **429** : Trop de requêtes (rate limiting)
- ❌ **500** : Erreur serveur

## Points de Contrôle

1. **Authentification** : Inscription, connexion, déconnexion ✅
2. **Autorisation** : Routes protégées, rôles admin ✅
3. **CRUD Livres** : Upload, lecture, modification, suppression ✅
4. **Fonctionnalités sociales** : Favoris, commentaires, notes ✅
5. **Sécurité** : Rate limiting, validation, blacklist tokens ✅
6. **Gestion sessions** : Sessions multiples, révocation ✅

Tous les tests devraient maintenant passer avec succès ! 🎉 