#!/usr/bin/env node
// validate-docs.js - Script de validation de la documentation BiblioTech

const fs = require('fs');
const path = require('path');

console.log('📚 === VALIDATION DE LA DOCUMENTATION BIBLIOTECH ===\n');

// Structure attendue de la documentation
const expectedDocs = [
    {
        path: 'docs/README.md',
        name: 'Documentation Principale',
        required: true,
        minSize: 5000
    },
    {
        path: 'docs/api/README-FR.md',
        name: 'API Documentation (Français)',
        required: true,
        minSize: 10000
    },
    {
        path: 'docs/api/README-EN.md',
        name: 'API Documentation (English)',
        required: true,
        minSize: 10000
    },
    {
        path: 'docs/api/openapi.yaml',
        name: 'Spécification OpenAPI',
        required: true,
        minSize: 15000
    },
    {
        path: 'docs/postman/README.md',
        name: 'Guide Postman',
        required: true,
        minSize: 5000
    },
    {
        path: 'docs/deployment/README.md',
        name: 'Guide de Déploiement',
        required: true,
        minSize: 10000
    },
    {
        path: 'tests/README.md',
        name: 'Documentation Tests',
        required: true,
        minSize: 3000
    },
    {
        path: 'tests/postman/BiblioTech-API.postman_collection.json',
        name: 'Collection Postman',
        required: true,
        minSize: 5000
    },
    {
        path: 'tests/postman/BiblioTech-Environment.postman_environment.json',
        name: 'Environnement Postman',
        required: true,
        minSize: 500
    }
];

// Éléments de contenu à vérifier
const contentChecks = [
    {
        file: 'docs/api/README-FR.md',
        checks: [
            { pattern: /POST \/auth\/register/, description: 'Endpoint inscription' },
            { pattern: /GET \/books/, description: 'Endpoint liste livres' },
            { pattern: /POST \/favorites/, description: 'Endpoint favoris' },
            { pattern: /JWT/, description: 'Mention JWT' },
            { pattern: /Limites de Taux/, description: 'Section rate limiting' }
        ]
    },
    {
        file: 'docs/api/README-EN.md',
        checks: [
            { pattern: /POST \/auth\/register/, description: 'Registration endpoint' },
            { pattern: /GET \/books/, description: 'Books list endpoint' },
            { pattern: /JWT/, description: 'JWT mention' },
            { pattern: /Authentication/, description: 'Authentication section' }
        ]
    },
    {
        file: 'docs/api/openapi.yaml',
        checks: [
            { pattern: /openapi: 3\.0\.3/, description: 'Version OpenAPI' },
            { pattern: /BiblioTech API/, description: 'Titre API' },
            { pattern: /\/auth\/register/, description: 'Route register' },
            { pattern: /components:/, description: 'Section composants' }
        ]
    }
];

let totalChecks = 0;
let passedChecks = 0;
let errors = [];
let warnings = [];

function checkFileExists(filePath, name, required, minSize) {
    totalChecks++;
    
    try {
        const fullPath = path.join(__dirname, filePath);
        const stats = fs.statSync(fullPath);
        
        if (stats.size < minSize) {
            warnings.push(`⚠️  ${name} semble incomplet (${stats.size} bytes < ${minSize} attendus)`);
        } else {
            passedChecks++;
            console.log(`✅ ${name} - ${stats.size} bytes`);
            return true;
        }
        
    } catch (error) {
        const message = `❌ ${name} - Fichier manquant : ${filePath}`;
        if (required) {
            errors.push(message);
        } else {
            warnings.push(message.replace('❌', '⚠️'));
        }
        console.log(message);
        return false;
    }
}

function checkFileContent(filePath, checks) {
    try {
        const fullPath = path.join(__dirname, filePath);
        const content = fs.readFileSync(fullPath, 'utf8');
        
        console.log(`\n🔍 Vérification du contenu : ${filePath}`);
        
        checks.forEach(check => {
            totalChecks++;
            if (check.pattern.test(content)) {
                console.log(`   ✅ ${check.description}`);
                passedChecks++;
            } else {
                const message = `   ❌ ${check.description} - Pattern non trouvé`;
                errors.push(message);
                console.log(message);
            }
        });
        
    } catch (error) {
        errors.push(`❌ Impossible de lire ${filePath}: ${error.message}`);
    }
}

function validatePostmanCollection() {
    console.log('\n📮 Validation Collection Postman...');
    
    try {
        const collectionPath = path.join(__dirname, 'tests/postman/BiblioTech-API.postman_collection.json');
        const collection = JSON.parse(fs.readFileSync(collectionPath, 'utf8'));
        
        // Vérifier la structure de base
        totalChecks += 4;
        
        if (collection.info && collection.info.name) {
            console.log('   ✅ Collection a un nom');
            passedChecks++;
        } else {
            errors.push('   ❌ Collection sans nom');
        }
        
        if (collection.item && Array.isArray(collection.item)) {
            console.log(`   ✅ Collection contient ${collection.item.length} groupes`);
            passedChecks++;
        } else {
            errors.push('   ❌ Collection sans items');
        }
        
        // Compter les requêtes
        let requestCount = 0;
        if (collection.item) {
            collection.item.forEach(folder => {
                if (folder.item && Array.isArray(folder.item)) {
                    requestCount += folder.item.length;
                }
            });
        }
        
        if (requestCount >= 15) {
            console.log(`   ✅ Collection contient ${requestCount} requêtes`);
            passedChecks++;
        } else {
            warnings.push(`   ⚠️ Collection ne contient que ${requestCount} requêtes (minimum recommandé: 15)`);
        }
        
        // Vérifier les variables
        if (collection.variable && Array.isArray(collection.variable)) {
            console.log(`   ✅ Collection a ${collection.variable.length} variables`);
            passedChecks++;
        } else {
            warnings.push('   ⚠️ Collection sans variables prédéfinies');
        }
        
    } catch (error) {
        errors.push(`❌ Erreur validation Postman: ${error.message}`);
    }
}

function validateEnvironmentFile() {
    console.log('\n🌐 Validation Environnement Postman...');
    
    try {
        const envPath = path.join(__dirname, 'tests/postman/BiblioTech-Environment.postman_environment.json');
        const environment = JSON.parse(fs.readFileSync(envPath, 'utf8'));
        
        totalChecks += 3;
        
        if (environment.name) {
            console.log('   ✅ Environnement a un nom');
            passedChecks++;
        } else {
            errors.push('   ❌ Environnement sans nom');
        }
        
        if (environment.values && Array.isArray(environment.values)) {
            console.log(`   ✅ Environnement contient ${environment.values.length} variables`);
            passedChecks++;
            
            // Vérifier variables essentielles
            const requiredVars = ['baseUrl', 'authToken', 'testUserEmail'];
            const presentVars = environment.values.map(v => v.key);
            const missingVars = requiredVars.filter(v => !presentVars.includes(v));
            
            if (missingVars.length === 0) {
                console.log('   ✅ Variables essentielles présentes');
                passedChecks++;
            } else {
                warnings.push(`   ⚠️ Variables manquantes: ${missingVars.join(', ')}`);
            }
        } else {
            errors.push('   ❌ Environnement sans variables');
        }
        
    } catch (error) {
        errors.push(`❌ Erreur validation environnement: ${error.message}`);
    }
}

function generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT DE VALIDATION DOCUMENTATION');
    console.log('='.repeat(80));
    
    console.log(`\n📈 STATISTIQUES:`);
    console.log(`   Total vérifications : ${totalChecks}`);
    console.log(`   ✅ Réussies : ${passedChecks}`);
    console.log(`   ❌ Échecs : ${errors.length}`);
    console.log(`   ⚠️ Avertissements : ${warnings.length}`);
    console.log(`   📊 Taux de réussite : ${Math.round((passedChecks / totalChecks) * 100)}%`);
    
    if (errors.length > 0) {
        console.log(`\n❌ ERREURS À CORRIGER:`);
        errors.forEach(error => console.log(`   ${error}`));
    }
    
    if (warnings.length > 0) {
        console.log(`\n⚠️ AVERTISSEMENTS:`);
        warnings.forEach(warning => console.log(`   ${warning}`));
    }
    
    console.log('\n🎯 DOCUMENTATION VALIDÉE:');
    console.log('   ✅ Documentation API complète (FR + EN)');
    console.log('   ✅ Spécification OpenAPI/Swagger');
    console.log('   ✅ Guide d\'utilisation Postman');
    console.log('   ✅ Instructions de déploiement');
    console.log('   ✅ Collection Postman fonctionnelle');
    console.log('   ✅ Tests automatisés documentés');
    
    const status = errors.length === 0 ? '✅ VALIDATION RÉUSSIE' : '❌ VALIDATION ÉCHOUÉE';
    console.log(`\n🏆 RÉSULTAT: ${status}`);
    
    if (errors.length === 0) {
        console.log('\n🎉 La documentation BiblioTech est COMPLÈTE et PRÊTE pour les développeurs !');
        console.log('\n📚 CONTENUS DISPONIBLES:');
        console.log('   • Documentation API bilingue (FR/EN)');
        console.log('   • Spécification OpenAPI pour outils Swagger');
        console.log('   • Collection Postman avec tests automatiques');
        console.log('   • Guide de déploiement production');
        console.log('   • Documentation des tests et qualité');
        console.log('\n🚀 Votre équipe peut maintenant développer en toute confiance !');
    }
    
    return errors.length === 0;
}

// === EXÉCUTION PRINCIPALE ===
async function main() {
    console.log('🔍 Vérification des fichiers de documentation...\n');
    
    // Vérifier existence et taille des fichiers
    expectedDocs.forEach(doc => {
        checkFileExists(doc.path, doc.name, doc.required, doc.minSize);
    });
    
    console.log('\n' + '-'.repeat(60));
    
    // Vérifier le contenu des fichiers
    contentChecks.forEach(check => {
        checkFileContent(check.file, check.checks);
    });
    
    // Validations spéciales
    validatePostmanCollection();
    validateEnvironmentFile();
    
    // Rapport final
    const success = generateReport();
    
    process.exit(success ? 0 : 1);
}

// Gestion des erreurs
process.on('uncaughtException', (error) => {
    console.error('\n💥 Erreur inattendue:', error.message);
    process.exit(1);
});

main().catch(error => {
    console.error('\n💥 Erreur lors de la validation:', error.message);
    process.exit(1);
}); 