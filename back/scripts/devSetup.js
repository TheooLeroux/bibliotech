// scripts/devSetup.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configuration de l\'environnement de développement BiblioTech...\n');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', 'env.example');

if (!fs.existsSync(envPath)) {
    console.log('📝 Création du fichier .env...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Fichier .env créé à partir de env.example\n');
} else {
    console.log('✅ Fichier .env existant trouvé\n');
}

// Vérifier les dépendances
console.log('📦 Vérification des dépendances...');
try {
    execSync('npm list --depth=0', { stdio: 'ignore' });
    console.log('✅ Dépendances installées\n');
} catch (error) {
    console.log('⚠️  Installation des dépendances...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dépendances installées\n');
}

// Créer les dossiers nécessaires
const directories = [
    'uploads',
    'uploads/books',
    'uploads/covers',
    'uploads/avatars'
];

console.log('📁 Création des dossiers...');
directories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Dossier créé: ${dir}`);
    } else {
        console.log(`✅ Dossier existant: ${dir}`);
    }
});

// Créer un fichier de configuration de développement
const devConfig = {
    environment: 'development',
    database: {
        host: 'localhost',
        port: 3306,
        name: 'bibliotech',
        user: 'root',
        password: ''
    },
    security: {
        rateLimitSkipLocalhost: true,
        detailedErrors: true,
        tokenCleanupEnabled: true,
        sessionCleanupEnabled: true,
        passwordValidationStrict: true,
        authLimitsStrict: true
    },
    logging: {
        level: 'debug',
        queryLogging: true,
        securityLogging: true
    },
    features: {
        autoCleanup: true,
        devRoutes: true,
        stackTraces: true,
        httpAllowed: true
    }
};

const configPath = path.join(__dirname, '..', 'config', 'development.json');
const configDir = path.dirname(configPath);

if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
}

fs.writeFileSync(configPath, JSON.stringify(devConfig, null, 2));
console.log('✅ Configuration de développement créée\n');

// Instructions pour l'utilisateur
console.log('🎯 Configuration terminée !\n');
console.log('📋 Prochaines étapes :');
console.log('1. Configurez votre base de données MariaDB');
console.log('2. Importez le schéma : mysql -u root -p bibliotech < bdd/schema-complete.sql');
console.log('3. Démarrez MongoDB (si nécessaire)');
console.log('4. Lancez le serveur : npm run dev\n');

console.log('🔧 Fonctionnalités de développement activées :');
console.log('- HTTP autorisé en local (pas de redirection HTTPS)');
console.log('- Rate limiting skip localhost uniquement');
console.log('- Erreurs détaillées avec stack traces');
console.log('- Nettoyage automatique des tokens');
console.log('- Logging de sécurité activé');
console.log('- Headers de développement ajoutés\n');

console.log('🔒 Sécurité maintenue :');
console.log('- Validation des mots de passe : 8 caractères + complexité');
console.log('- Rate limiting : limites normales (5 auth/15min, 10 uploads/h)');
console.log('- Authentification : sécurité complète');
console.log('- Tokens : blacklist et révocation activées');
console.log('- Validation stricte de tous les inputs\n');

console.log('⚠️  Rappel : Configuration adaptée au développement local uniquement !');
console.log('🚫 Ne jamais utiliser ces paramètres en production !\n');

console.log('🎉 Environnement de développement prêt !'); 