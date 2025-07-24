// tests/integration/auth.integration.test.js
const request = require('supertest');
const app = require('../../app');
const { User, BlacklistedToken } = require('../../models');
const { testUsers } = require('../fixtures/testData');

// Tests d'intégration avec vraie DB (utilise .env.test)
describe('Authentication Integration Tests', () => {
    let testUser;
    let authToken;

    beforeAll(async () => {
        // Nettoyer la DB de test avant les tests
        await User.destroy({ where: { email: testUsers.validUser.email } });
        await User.destroy({ where: { email: testUsers.adminUser.email } });
    });

    afterAll(async () => {
        // Nettoyer après les tests
        await User.destroy({ where: { email: testUsers.validUser.email } });
        await User.destroy({ where: { email: testUsers.adminUser.email } });
        await BlacklistedToken.destroy({ where: {} });
    });

    describe('Workflow complet d\'authentification', () => {
        it('1. Devrait permettre l\'inscription d\'un nouvel utilisateur', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUsers.validUser);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User created successfully.');

            // Vérifier que l'utilisateur existe en DB
            testUser = await User.findOne({ where: { email: testUsers.validUser.email } });
            expect(testUser).toBeTruthy();
            expect(testUser.pseudo).toBe(testUsers.validUser.pseudo);
        });

        it('2. Devrait permettre la connexion avec les bonnes credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUsers.validUser.email,
                    password: testUsers.validUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
            expect(response.body.user.id).toBe(testUser.id);

            authToken = response.body.token;
        });

        it('3. Devrait permettre l\'accès aux routes protégées avec le token', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.email).toBe(testUsers.validUser.email);
        });

        it('4. Devrait permettre la déconnexion et blacklister le token', async () => {
            const logoutResponse = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${authToken}`);

            expect(logoutResponse.status).toBe(200);
            expect(logoutResponse.body.message).toBe('Logged out successfully.');

            // Vérifier que le token est blacklisté
            const blacklistedToken = await BlacklistedToken.findOne({ 
                where: { token: authToken } 
            });
            expect(blacklistedToken).toBeTruthy();
        });

        it('5. Devrait rejeter l\'utilisation du token blacklisté', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Token has been revoked.');
        });
    });

    describe('Workflow de récupération de mot de passe', () => {
        let resetToken;

        it('1. Devrait générer un token de reset pour un email valide', async () => {
            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: testUsers.validUser.email });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Un lien de réinitialisation a été envoyé à votre adresse email.');

            // Récupérer le token depuis la DB (pas exposé dans la réponse)
            const updatedUser = await User.findOne({ 
                where: { email: testUsers.validUser.email } 
            });
            expect(updatedUser.reset_token).toBeTruthy();
            expect(updatedUser.reset_token_expires).toBeTruthy();
            resetToken = updatedUser.reset_token;
        });

        it('2. Devrait permettre la réinitialisation avec un token valide', async () => {
            const newPassword = 'NewPassword123!';
            
            const response = await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({
                    password: newPassword,
                    confirmPassword: newPassword
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Password reset successfully.');

            // Vérifier que le token est supprimé
            const updatedUser = await User.findOne({ 
                where: { email: testUsers.validUser.email } 
            });
            expect(updatedUser.reset_token).toBeNull();
        });

        it('3. Devrait permettre la connexion avec le nouveau mot de passe', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUsers.validUser.email,
                    password: 'NewPassword123!'
                });

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
        });
    });

    describe('Tests de sécurité', () => {
        it('Devrait rejeter les tentatives de réutilisation de token de reset', async () => {
            // Utiliser l'ancien token (déjà utilisé)
            const response = await request(app)
                .post(`/api/auth/reset-password/${resetToken}`)
                .send({
                    password: 'AnotherPassword123!',
                    confirmPassword: 'AnotherPassword123!'
                });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid or expired reset token.');
        });

        it('Devrait rejeter les mots de passe faibles', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    pseudo: 'WeakUser',
                    email: 'weak@example.com',
                    password: '123' // Trop faible
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });

        it('Devrait empêcher la double inscription avec le même email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUsers.validUser); // Même email

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email already in use.');
        });
    });
}); 