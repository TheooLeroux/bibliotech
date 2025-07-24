const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4000/api';
let authToken = '';
let userId = '';
let bookId = '';

// Configuration des couleurs pour les logs
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper pour les requêtes
async function request(method, url, data = null, headers = {}) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${url}`,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };
        
        if (data) config.data = data;
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message,
            status: error.response?.status || 500
        };
    }
}

// Tests des routes d'authentification
async function testAuth() {
    log('\n🔐 === TESTS AUTHENTIFICATION ===', 'blue');
    
    // Test inscription
    log('\n📝 Test inscription...', 'yellow');
    const registerData = {
        pseudo: 'TestUser' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'TestPassword123!',
        confirmPassword: 'TestPassword123!'
    };
    
    const registerResult = await request('POST', '/auth/register', registerData);
    if (registerResult.success) {
        log('✅ Inscription réussie', 'green');
        userId = registerResult.data.user.id;
    } else {
        log(`❌ Inscription échouée: ${JSON.stringify(registerResult.error)}`, 'red');
        return false;
    }
    
    // Test connexion
    log('\n🔑 Test connexion...', 'yellow');
    const loginData = {
        email: registerData.email,
        password: registerData.password
    };
    
    const loginResult = await request('POST', '/auth/login', loginData);
    if (loginResult.success) {
        log('✅ Connexion réussie', 'green');
        authToken = loginResult.data.token;
        log(`Token reçu: ${authToken.substring(0, 20)}...`, 'blue');
    } else {
        log(`❌ Connexion échouée: ${JSON.stringify(loginResult.error)}`, 'red');
        return false;
    }
    
    return true;
}

// Tests des routes utilisateur
async function testUsers() {
    log('\n👥 === TESTS UTILISATEURS ===', 'blue');
    
    // Test profil
    log('\n📋 Test récupération profil...', 'yellow');
    const profileResult = await request('GET', '/users/profile', null, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (profileResult.success) {
        log('✅ Profil récupéré avec succès', 'green');
        log(`Pseudo: ${profileResult.data.user.pseudo}`, 'blue');
    } else {
        log(`❌ Récupération profil échouée: ${JSON.stringify(profileResult.error)}`, 'red');
    }
    
    // Test mise à jour profil
    log('\n✏️ Test mise à jour profil...', 'yellow');
    const updateData = {
        bio: 'Utilisateur de test automatisé'
    };
    
    const updateResult = await request('PUT', '/users/profile', updateData, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (updateResult.success) {
        log('✅ Profil mis à jour avec succès', 'green');
    } else {
        log(`❌ Mise à jour profil échouée: ${JSON.stringify(updateResult.error)}`, 'red');
    }
}

// Tests des routes livres
async function testBooks() {
    log('\n📚 === TESTS LIVRES ===', 'blue');
    
    // Test liste des livres (public)
    log('\n📖 Test liste des livres...', 'yellow');
    const booksResult = await request('GET', '/books');
    
    if (booksResult.success) {
        log('✅ Liste des livres récupérée', 'green');
        log(`Nombre de livres: ${booksResult.data.books?.length || 0}`, 'blue');
    } else {
        log(`❌ Récupération liste échouée: ${JSON.stringify(booksResult.error)}`, 'red');
    }
}

// Tests des routes favoris
async function testFavorites() {
    log('\n❤️ === TESTS FAVORIS ===', 'blue');
    
    // Test récupération favoris
    log('\n💫 Test récupération favoris...', 'yellow');
    const favoritesResult = await request('GET', '/favorites', null, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (favoritesResult.success) {
        log('✅ Favoris récupérés avec succès', 'green');
        log(`Nombre de favoris: ${favoritesResult.data.data?.length || 0}`, 'blue');
    } else {
        log(`❌ Récupération favoris échouée: ${JSON.stringify(favoritesResult.error)}`, 'red');
    }
}

// Tests des routes lecture
async function testReading() {
    log('\n📖 === TESTS LECTURE ===', 'blue');
    
    // Test historique de lecture
    log('\n📚 Test historique de lecture...', 'yellow');
    const readingResult = await request('GET', '/reading', null, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (readingResult.success) {
        log('✅ Historique récupéré avec succès', 'green');
        log(`Nombre d'entrées: ${readingResult.data.data?.length || 0}`, 'blue');
    } else {
        log(`❌ Récupération historique échouée: ${JSON.stringify(readingResult.error)}`, 'red');
    }
    
    // Test statistiques
    log('\n📊 Test statistiques de lecture...', 'yellow');
    const statsResult = await request('GET', '/reading/stats', null, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (statsResult.success) {
        log('✅ Statistiques récupérées avec succès', 'green');
    } else {
        log(`❌ Récupération stats échouée: ${JSON.stringify(statsResult.error)}`, 'red');
    }
}

// Tests des routes commentaires
async function testComments() {
    log('\n💬 === TESTS COMMENTAIRES ===', 'blue');
    
    // Test commentaires d'un livre (public)
    log('\n📝 Test commentaires livre (ID: 1)...', 'yellow');
    const commentsResult = await request('GET', '/comments/book/1');
    
    if (commentsResult.success) {
        log('✅ Commentaires récupérés avec succès', 'green');
        log(`Nombre de commentaires: ${commentsResult.data.data?.comments?.length || 0}`, 'blue');
    } else {
        log(`❌ Récupération commentaires échouée: ${JSON.stringify(commentsResult.error)}`, 'red');
    }
}

// Tests des routes notifications
async function testNotifications() {
    log('\n🔔 === TESTS NOTIFICATIONS ===', 'blue');
    
    // Test notifications
    log('\n📬 Test récupération notifications...', 'yellow');
    const notificationsResult = await request('GET', '/notifications', null, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (notificationsResult.success) {
        log('✅ Notifications récupérées avec succès', 'green');
        log(`Nombre de notifications: ${notificationsResult.data.data?.length || 0}`, 'blue');
    } else {
        log(`❌ Récupération notifications échouée: ${JSON.stringify(notificationsResult.error)}`, 'red');
    }
    
    // Test compteur non lues
    log('\n🔢 Test compteur notifications non lues...', 'yellow');
    const unreadResult = await request('GET', '/notifications/unread-count', null, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (unreadResult.success) {
        log('✅ Compteur récupéré avec succès', 'green');
        log(`Notifications non lues: ${unreadResult.data.data?.unreadCount || 0}`, 'blue');
    } else {
        log(`❌ Récupération compteur échouée: ${JSON.stringify(unreadResult.error)}`, 'red');
    }
}

// Tests des routes sessions
async function testSessions() {
    log('\n🔐 === TESTS SESSIONS ===', 'blue');
    
    // Test sessions actives
    log('\n👤 Test sessions actives...', 'yellow');
    const sessionsResult = await request('GET', '/sessions', null, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (sessionsResult.success) {
        log('✅ Sessions récupérées avec succès', 'green');
        log(`Nombre de sessions: ${sessionsResult.data.data?.length || 0}`, 'blue');
    } else {
        log(`❌ Récupération sessions échouée: ${JSON.stringify(sessionsResult.error)}`, 'red');
    }
}

// Test de déconnexion
async function testLogout() {
    log('\n🚪 === TEST DÉCONNEXION ===', 'blue');
    
    const logoutResult = await request('POST', '/auth/logout', null, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (logoutResult.success) {
        log('✅ Déconnexion réussie', 'green');
    } else {
        log(`❌ Déconnexion échouée: ${JSON.stringify(logoutResult.error)}`, 'red');
    }
    
    // Test que le token est bien blacklisté
    log('\n🔒 Test token blacklisté...', 'yellow');
    const testBlacklistResult = await request('GET', '/users/profile', null, {
        Authorization: `Bearer ${authToken}`
    });
    
    if (!testBlacklistResult.success && testBlacklistResult.status === 401) {
        log('✅ Token bien blacklisté', 'green');
    } else {
        log('❌ Token pas correctement blacklisté', 'red');
    }
}

// Fonction principale de test
async function runAllTests() {
    log('🚀 === DÉBUT DES TESTS AUTOMATISÉS ===', 'blue');
    log(`URL de base: ${BASE_URL}`, 'blue');
    
    try {
        // Attendre que le serveur soit prêt
        log('\n⏳ Attente du serveur...', 'yellow');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Tests séquentiels
        const authSuccess = await testAuth();
        if (!authSuccess) {
            log('\n❌ Tests d\'authentification échoués, arrêt des tests', 'red');
            return;
        }
        
        await testUsers();
        await testBooks();
        await testFavorites();
        await testReading();
        await testComments();
        await testNotifications();
        await testSessions();
        await testLogout();
        
        log('\n🎉 === TESTS TERMINÉS ===', 'green');
        
    } catch (error) {
        log(`\n💥 Erreur générale: ${error.message}`, 'red');
    }
}

// Vérification que axios est disponible
async function checkDependencies() {
    try {
        require('axios');
        return true;
    } catch (error) {
        log('❌ Module axios non trouvé. Installation...', 'red');
        return false;
    }
}

// Exécution
(async () => {
    const hasAxios = await checkDependencies();
    if (hasAxios) {
        await runAllTests();
    } else {
        log('💡 Exécutez: npm install axios', 'yellow');
        log('Puis relancez: node test-routes.js', 'yellow');
    }
})(); 