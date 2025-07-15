# Guide de Tests Postman - BiblioTech

## Configuration Postman

### Variables d'environnement
1. Créer un nouvel environnement "BiblioTech Dev"
2. Ajouter ces variables :
   - `baseUrl` : `http://localhost:3000`
   - `token` : (sera rempli automatiquement)

## Tests avec les utilisateurs existants

### 1. Connexion avec un compte existant

**POST** `{{baseUrl}}/api/auth/login`

Body (raw JSON) - Compte Luckx :
```json
{
  "email": "theolerouxz004@gmail.com",
  "password": "motdepasse_original"
}
```

Body (raw JSON) - Compte BlackJack :
```json
{
  "email": "petitponey0007@gmail.com", 
  "password": "motdepasse_original"
}
```

**Note importante :** Vous devez connaître les mots de passe originaux de ces comptes pour vous connecter.

### Script Postman pour capturer le token :
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("token", response.token);
    console.log("Token saved:", response.token);
}
```

### 2. Test du profil utilisateur (avec token)

**GET** `{{baseUrl}}/api/users/profile`

Headers :
- `Authorization` : `Bearer {{token}}`

### 3. Déconnexion

**POST** `{{baseUrl}}/api/auth/logout`

Headers :
- `Authorization` : `Bearer {{token}}`

### 4. Test d'inscription d'un nouvel utilisateur

**POST** `{{baseUrl}}/api/auth/register`

Body (raw JSON) :
```json
{
  "pseudo": "TestUser",
  "email": "test@example.com",
  "password": "TestPassword123!"
}
```

## Tests des fonctionnalités

### 5. Upload d'un livre (nécessite connexion)

**POST** `{{baseUrl}}/api/books/upload`

Headers :
- `Authorization` : `Bearer {{token}}`

Body (form-data) :
- `title` : "Mon Livre Test"
- `author` : "Auteur Test"
- `description` : "Description du livre"
- `mainGenre` : "1"
- `subGenres` : "1,2"
- `file` : [Sélectionner un fichier PDF ou EPUB]
- `cover` : [Sélectionner une image JPG/PNG]

### 6. Obtenir la liste des livres

**GET** `{{baseUrl}}/api/books`

### 7. Ajouter un livre aux favoris

**POST** `{{baseUrl}}/api/favorites`

Headers :
- `Authorization` : `Bearer {{token}}`

Body (raw JSON) :
```json
{
  "bookId": 1
}
```

## Dépannage

### Si vous ne connaissez pas les mots de passe :

1. **Option 1 - Reset password :**
   - Utilisez la route `POST /api/auth/forgot-password` avec l'email
   - Vérifiez les logs du serveur pour le token de reset
   - Utilisez `POST /api/auth/reset-password` avec le token

2. **Option 2 - Créer un nouveau mot de passe directement en base :**
   Je peux vous aider à hasher un nouveau mot de passe pour le mettre en base.

3. **Option 3 - Créer un nouveau compte :**
   - Utilisez la route d'inscription pour créer un nouveau compte de test

### Si le serveur ne démarre pas :
```bash
cd back
npm start
```

### Si erreur de token :
- Vérifiez que le fichier `.env` contient `JWT_SECRET`
- Assurez-vous que le token est bien dans l'header Authorization 