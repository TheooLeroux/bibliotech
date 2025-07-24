# 📮 Guide Postman - BiblioTech API

## 📥 Installation et Configuration

### 1. Prérequis
- [Postman Desktop](https://www.postman.com/downloads/) ou Postman Web
- Serveur BiblioTech en cours d'exécution (`npm run dev`)

### 2. Import des Collections

#### 📂 Collection Principale
1. Ouvrir Postman
2. Cliquer sur **Import** 
3. Sélectionner `tests/postman/BiblioTech-API.postman_collection.json`
4. Confirmer l'import

#### 🌐 Environnement
1. Cliquer sur **Import** à nouveau
2. Sélectionner `tests/postman/BiblioTech-Environment.postman_environment.json`
3. Sélectionner l'environnement "BiblioTech Development" dans le coin supérieur droit

## 🔧 Configuration de l'Environnement

### Variables Automatiques
Ces variables sont remplies automatiquement par les scripts de test :

| Variable | Description | Auto-remplie |
|----------|-------------|--------------|
| `authToken` | Token JWT après connexion | ✅ |
| `userId` | ID de l'utilisateur connecté | ✅ |
| `testBookId` | ID d'un livre pour les tests | ⚠️ Manuel |

### Variables Manuelles
Vous pouvez modifier ces valeurs dans l'environnement :

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `baseUrl` | `http://localhost:4000` | URL du serveur |
| `testUserPseudo` | `PostmanTestUser` | Pseudo pour tests |
| `testUserEmail` | `postman@example.com` | Email pour tests |
| `testUserPassword` | `PostmanTest123!` | Mot de passe pour tests |

## 🚀 Workflow Recommandé

### 🏁 Démarrage Rapide

1. **🔐 Authentification → Inscription**
   - Créé un nouveau compte de test
   - ✅ Succès attendu : Status 201

2. **🔑 Authentification → Connexion**
   - Se connecte avec les identifiants
   - ✅ Récupère automatiquement le token JWT
   - 📝 Variable `authToken` mise à jour

3. **👤 Utilisateurs → Mon profil**
   - Teste l'accès authentifié
   - ✅ Affiche les informations du profil

### 📚 Tests Complets

#### Phase 1 : Authentification
```
1. Inscription          → Créé le compte
2. Connexion           → Obtient le token
3. Mon profil          → Valide l'authentification
4. Mettre à jour profil → Teste la modification
```

#### Phase 2 : Contenu
```
5. Liste des livres    → Parcourt le catalogue
6. Détails d'un livre  → Affiche un livre spécifique
```

#### Phase 3 : Fonctionnalités Sociales
```
7. Ajouter aux favoris → Teste les favoris
8. Mes favoris         → Liste les favoris
9. Retirer des favoris → Teste la suppression
```

#### Phase 4 : Lecture
```
10. Historique de lecture → Consulte l'historique
11. Statistiques         → Affiche les stats
```

#### Phase 5 : Interaction
```
12. Commentaires d'un livre → Lit les commentaires
13. Mes notifications       → Consulte les notifications
14. Compteur non lues       → Vérifie les nouvelles
```

#### Phase 6 : Sécurité
```
15. Sessions actives    → Liste les sessions
16. Test token invalide → Valide la sécurité
17. Test XSS Protection → Teste les protections
18. Déconnexion        → Termine la session
```

## 🧪 Scripts de Test Automatiques

Chaque requête contient des **tests automatiques** qui vérifient :

### ✅ Tests de Status
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

### 📊 Tests de Structure
```javascript
pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
});
```

### 🔐 Gestion Automatique des Tokens
```javascript
// Sauvegarde automatique du token
const jsonData = pm.response.json();
pm.environment.set("authToken", jsonData.token);
pm.environment.set("userId", jsonData.user.id);
```

## 📋 Collection Runner

### 🏃‍♂️ Exécution Automatique
1. Sélectionner la collection "BiblioTech API"
2. Cliquer sur **Run collection**
3. Configurer les options :
   - **Environment** : BiblioTech Development
   - **Iterations** : 1
   - **Delay** : 1000ms (pour éviter le rate limiting)

### 📊 Résultats
- ✅ Tests passés/échoués
- ⏱️ Temps de réponse
- 📈 Rapport détaillé

## 🛠️ Personnalisation

### 🔧 Ajouter de Nouvelles Requêtes

#### 1. Dupliquer une Requête Existante
```
Clic droit sur une requête → Duplicate → Renommer
```

#### 2. Configurer la Nouvelle Requête
- **Method** : GET, POST, PUT, DELETE
- **URL** : `{{baseUrl}}/nouvel-endpoint`
- **Headers** : Authorization: Bearer {{authToken}}
- **Body** : JSON selon les besoins

#### 3. Ajouter des Tests
```javascript
pm.test("Ma nouvelle fonctionnalité", function () {
    pm.response.to.have.status(200);
    // Autres assertions...
});
```

### 📝 Variables Personnalisées

#### Variables d'Environnement
```javascript
// Dans le script "Pre-request"
pm.environment.set("maVariable", "maValeur");

// Dans la requête
{{maVariable}}
```

#### Variables Globales
```javascript
// Pour toutes les collections
pm.globals.set("configGlobale", "valeur");
```

## 🐛 Dépannage

### ❌ Problèmes Courants

#### 1. Token Expiré (401)
**Solution** : Relancer "Authentification → Connexion"

#### 2. Serveur Non Disponible (ECONNREFUSED)
**Solutions** :
- Vérifier que `npm run dev` est actif
- Vérifier l'URL dans `baseUrl`
- Contrôler les logs du serveur

#### 3. Rate Limiting (429)
**Solutions** :
- Attendre avant de relancer
- Augmenter le délai dans Collection Runner
- Vérifier les limites dans la configuration serveur

#### 4. Échec de Validation (400)
**Solutions** :
- Vérifier le format des données
- Consulter les logs serveur pour plus de détails
- Adapter les données de test

### 🔍 Debug Avancé

#### Console Postman
```javascript
// Dans les scripts de test
console.log("Debug:", pm.response.json());
console.log("Token actuel:", pm.environment.get("authToken"));
```

#### Logs Serveur
```bash
# Dans le terminal du serveur
npm run dev
# Observer les logs de requêtes
```

## 📊 Monitoring et Métriques

### 📈 Métriques de Performance
- **Temps de réponse moyen** : < 100ms
- **Taux de succès** : > 95%
- **Disponibilité** : 99.9%

### 🎯 Tests de Charge
```javascript
// Configuration Collection Runner
Iterations: 10
Delay: 500ms
Data File: user-data.csv (optionnel)
```

### 📋 Rapports
1. **Collection Runner** → Générer rapport HTML
2. **Newman CLI** pour CI/CD :
```bash
npm install -g newman
newman run collection.json -e environment.json --reporters html
```

## 🔄 Intégration CI/CD

### Github Actions
```yaml
- name: Run Postman Tests
  run: |
    npm install -g newman
    newman run tests/postman/BiblioTech-API.postman_collection.json \
           -e tests/postman/BiblioTech-Environment.postman_environment.json \
           --reporters cli,htmlextra
```

### Scripts NPM
```json
{
  "scripts": {
    "test:postman": "newman run tests/postman/BiblioTech-API.postman_collection.json -e tests/postman/BiblioTech-Environment.postman_environment.json"
  }
}
```

---

## 📞 Support

### 🆘 Besoin d'Aide ?
- 📧 Email : support@bibliotech.com
- 📖 Documentation : `/docs/api/`
- 🐛 Issues : Créer un ticket avec les logs

### 📚 Ressources Utiles
- [Documentation Postman](https://learning.postman.com/docs/)
- [Scripts de Test Postman](https://learning.postman.com/docs/writing-scripts/test-scripts/)
- [Variables Postman](https://learning.postman.com/docs/sending-requests/variables/)

**Version** : 1.0.0  
**Dernière mise à jour** : 24 janvier 2025 