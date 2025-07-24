# 📋 Guide Complet des Tests - BiblioTech API

## 🏗️ Structure des Tests

```
tests/
├── setup.js                     # Configuration Jest
├── fixtures/
│   └── testData.js              # Données de test réutilisables
├── unit/                        # Tests unitaires (mocks)
│   ├── authController.test.js   # Tests auth avec mocks
│   ├── userController.test.js   # Tests utilisateurs
│   └── favoriteController.test.js # Tests favoris
├── integration/                 # Tests d'intégration (vraie DB)
│   └── auth.integration.test.js # Workflows complets
├── security/                    # Tests de sécurité
│   ├── rateLimiting.test.js     # Rate limiting
│   └── inputValidation.test.js  # Validation & XSS
├── e2e/                        # Tests end-to-end
│   └── test-routes.js          # Tests automatisés complets
└── postman/                    # Collections Postman
    ├── BiblioTech-API.postman_collection.json
    └── BiblioTech-Environment.postman_environment.json
```

## 🚀 Installation et Configuration

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration de l'environnement de test
Créer un fichier `.env.test` (déjà configuré) avec une base de données séparée.

### 3. Préparer la base de données de test
```bash
# Créer la DB de test
mysql -u root -p -e "CREATE DATABASE bibliotech_test;"

# Appliquer le schéma
mysql -u root -p bibliotech_test < bdd/schema-complete.sql
```

## 🧪 Types de Tests

### Tests Unitaires
- **Objectif** : Tester les contrôleurs isolément avec des mocks
- **Avantages** : Rapides, isolés, pas de dépendances externes
- **Commande** : `npm run test:unit`

```bash
# Lancer tous les tests unitaires
npm run test:unit

# Lancer un test spécifique
npm run test:unit -- authController.test.js
```

### Tests d'Intégration
- **Objectif** : Tester les workflows complets avec vraie DB
- **Avantages** : Realistic, teste les interactions entre composants
- **Commande** : `npm run test:integration`

### Tests de Sécurité
- **Objectif** : Vérifier la robustesse contre les attaques
- **Couvre** : XSS, SQL injection, rate limiting, validation
- **Commande** : `npm run test:security`

### Tests End-to-End
- **Objectif** : Simuler un utilisateur réel
- **Couvre** : Workflows complets de l'API
- **Commande** : `npm run test:e2e`

## 📊 Commandes de Test

```bash
# Tous les tests
npm test

# Tests en mode watch (développement)
npm run test:watch

# Tests avec couverture de code
npm run test:coverage

# Tests par catégorie
npm run test:unit
npm run test:integration
npm run test:security
npm run test:e2e
```

## 📈 Couverture de Code

Les tests génèrent automatiquement :
- **Rapport de couverture** dans `coverage/`
- **Rapport HTML** dans `coverage/test-report.html`

```bash
# Voir la couverture
npm run test:coverage
open coverage/test-report.html
```

## 🔧 Configuration Postman

### Import des Collections
1. Ouvrir Postman
2. Importer `tests/postman/BiblioTech-API.postman_collection.json`
3. Importer `tests/postman/BiblioTech-Environment.postman_environment.json`

### Variables d'Environnement
- `baseUrl` : http://localhost:4000
- `authToken` : (rempli automatiquement)
- `userId` : (rempli automatiquement)
- `testUserEmail` : postman@example.com
- `testUserPassword` : PostmanTest123!

### Ordre d'Exécution Recommandé
1. **Inscription** → génère un compte
2. **Connexion** → récupère le token
3. **Tests des fonctionnalités** → utilise le token
4. **Déconnexion** → blackliste le token

## 🛡️ Tests de Sécurité

### Protection XSS
Tests automatiques contre :
- Scripts injectés dans les champs
- Balises HTML malicieuses
- JavaScript dans les URLs

### Protection SQL Injection
Tests avec payloads classiques :
- `'; DROP TABLE users; --`
- `' OR '1'='1`
- `' UNION SELECT * FROM users --`

### Rate Limiting
Tests de déni de service :
- Tentatives de connexion répétées
- Spam de demandes de reset password
- Surcharge de l'API

### Validation des Entrées
- Emails invalides
- Mots de passe faibles
- Payloads trop volumineux
- Content-Types non supportés

## 🎯 Scénarios de Test Avancés

### Workflow Complet d'Authentification
1. Inscription d'un nouvel utilisateur
2. Connexion avec les credentials
3. Accès aux routes protégées
4. Déconnexion et blacklist du token
5. Vérification du rejet du token blacklisté

### Workflow de Récupération de Mot de Passe
1. Demande de reset avec email valide
2. Génération du token de reset
3. Réinitialisation avec le token
4. Connexion avec le nouveau mot de passe
5. Test de réutilisation du token (échec attendu)

### Tests de Rôles et Permissions
- Accès utilisateur standard vs admin
- Protection des routes administratives
- Validation des permissions sur les ressources

## 📝 Écriture de Nouveaux Tests

### Structure d'un Test Unitaire
```javascript
// tests/unit/monController.test.js
const request = require('supertest');
const app = require('../../app');
const { MonModel } = require('../../models');

jest.mock('../../models');

describe('MonController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('devrait faire quelque chose', async () => {
        // Arrange
        MonModel.findAll.mockResolvedValue([]);

        // Act
        const response = await request(app)
            .get('/api/mon-endpoint');

        // Assert
        expect(response.status).toBe(200);
        expect(MonModel.findAll).toHaveBeenCalled();
    });
});
```

### Bonnes Pratiques
1. **AAA Pattern** : Arrange, Act, Assert
2. **Noms descriptifs** : "devrait retourner 401 pour token invalide"
3. **Tests isolés** : Chaque test indépendant
4. **Cleanup** : Nettoyer après chaque test
5. **Mock approprié** : Mock les dépendances externes

## 🐛 Debugging des Tests

### Tests qui échouent
```bash
# Verbose mode pour plus de détails
npm test -- --verbose

# Lancer un seul test
npm test -- --testNamePattern="nom du test"

# Debug avec breakpoints
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Problèmes courants
- **Timeout** : Augmenter `testTimeout` dans jest.config
- **DB pas nettoyée** : Vérifier les hooks `beforeEach`/`afterEach`
- **Mocks incorrects** : Vérifier que les modules sont bien mockés

## 📊 Métriques et Monitoring

### Métriques de Qualité
- **Couverture de code** : > 80%
- **Tests passants** : 100%
- **Temps d'exécution** : < 30s pour tous les tests
- **Temps de réponse API** : < 100ms en moyenne

### Monitoring Continu
Les tests peuvent être intégrés à :
- CI/CD pipelines (GitHub Actions, GitLab CI)
- Pre-commit hooks
- Surveillance de performance

## 🔄 Intégration Continue

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
```

## ✅ Checklist de Validation

Avant de déployer :
- [ ] Tous les tests unitaires passent
- [ ] Tests d'intégration fonctionnels
- [ ] Couverture de code > 80%
- [ ] Tests de sécurité validés
- [ ] Collection Postman testée
- [ ] Documentation à jour

---

Pour toute question sur les tests, consulter :
- `guide-tests-complet.md` - Guide détaillé
- `tests-postman-guide.md` - Guide Postman spécifique
- Logs de développement pour le debugging 