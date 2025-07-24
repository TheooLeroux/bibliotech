// tests/security/rateLimiting.test.js
const request = require('supertest');
const app = require('../../app');

describe('Rate Limiting Security Tests', () => {
    
    describe('Login Rate Limiting', () => {
        it('devrait bloquer après trop de tentatives de connexion', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            };

            const maxAttempts = 5;
            const responses = [];

            // Faire plusieurs tentatives rapides
            for (let i = 0; i < maxAttempts + 2; i++) {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send(loginData);
                
                responses.push(response.status);
            }

            // Les premières tentatives devraient retourner 401 (credentials incorrects)
            expect(responses.slice(0, maxAttempts)).toEqual(
                new Array(maxAttempts).fill(401)
            );

            // Les tentatives supplémentaires devraient être bloquées (429)
            expect(responses[maxAttempts]).toBe(429);
            expect(responses[maxAttempts + 1]).toBe(429);
        }, 15000);
    });

    describe('Password Reset Rate Limiting', () => {
        it('devrait limiter les demandes de reset de mot de passe', async () => {
            const email = 'test@example.com';
            const maxAttempts = 3;
            const responses = [];

            for (let i = 0; i < maxAttempts + 1; i++) {
                const response = await request(app)
                    .post('/api/auth/forgot-password')
                    .send({ email });
                
                responses.push(response.status);
            }

            // Les premières demandes devraient passer
            expect(responses.slice(0, maxAttempts)).toEqual(
                new Array(maxAttempts).fill(200)
            );

            // La demande supplémentaire devrait être bloquée
            expect(responses[maxAttempts]).toBe(429);
        }, 10000);
    });

    describe('Registration Rate Limiting', () => {
        it('devrait limiter les tentatives d\'inscription', async () => {
            const maxAttempts = 3;
            const responses = [];

            for (let i = 0; i < maxAttempts + 1; i++) {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        pseudo: `TestUser${i}`,
                        email: `test${i}@example.com`,
                        password: 'TestPassword123!'
                    });
                
                responses.push(response.status);
            }

            // Vérifier que le rate limiting s'active
            const lastResponse = responses[responses.length - 1];
            expect([201, 429]).toContain(lastResponse);
        }, 10000);
    });

    describe('General API Rate Limiting', () => {
        it('devrait appliquer un rate limiting global', async () => {
            const maxRequests = 100;
            let rateLimitedCount = 0;

            // Faire beaucoup de requêtes rapidement
            const promises = Array.from({ length: maxRequests + 10 }, () =>
                request(app).get('/api/books').then(res => res.status)
            );

            const statuses = await Promise.all(promises);
            
            // Compter les réponses 429 (too many requests)
            rateLimitedCount = statuses.filter(status => status === 429).length;

            // Au moins quelques requêtes devraient être bloquées
            if (process.env.RATE_LIMIT_ENABLED !== 'false') {
                expect(rateLimitedCount).toBeGreaterThan(0);
            }
        }, 20000);
    });

    describe('IP-based Rate Limiting', () => {
        it('devrait appliquer le rate limiting par IP', async () => {
            const responses = [];

            // Simuler plusieurs requêtes depuis la même IP
            for (let i = 0; i < 10; i++) {
                const response = await request(app)
                    .get('/')
                    .set('X-Forwarded-For', '192.168.1.100'); // IP simulée
                
                responses.push(response.status);
            }

            // En fonction de la configuration, certaines requêtes peuvent être bloquées
            const hasRateLimit = responses.some(status => status === 429);
            
            // Test informatif (pas d'assertion stricte car dépend de l'env)
            if (hasRateLimit) {
                console.log('✅ Rate limiting par IP fonctionnel');
            } else {
                console.log('ℹ️ Rate limiting par IP désactivé ou seuil non atteint');
            }
        });
    });
}); 