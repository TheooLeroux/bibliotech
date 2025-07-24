// tests/security/inputValidation.test.js
const request = require('supertest');
const app = require('../../app');

describe('Input Validation & XSS Protection Tests', () => {

    describe('XSS Protection Tests', () => {
        const xssPayloads = [
            '<script>alert("XSS")</script>',
            '"><script>alert(document.cookie)</script>',
            'javascript:alert("XSS")',
            '<img src="x" onerror="alert(1)">',
            '<svg onload="alert(1)">',
            '&lt;script&gt;alert("XSS")&lt;/script&gt;'
        ];

        xssPayloads.forEach((payload, index) => {
            it(`devrait bloquer ou échapper le payload XSS #${index + 1}`, async () => {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        pseudo: payload,
                        email: 'test@example.com',
                        password: 'TestPassword123!'
                    });

                // Soit rejeté pour validation, soit échappé dans la réponse
                if (response.status === 400) {
                    expect(response.body.errors).toBeDefined();
                } else if (response.status === 201) {
                    // Si accepté, vérifier que le contenu est échappé
                    expect(response.body).not.toMatch(/<script>/);
                    expect(response.body).not.toMatch(/javascript:/);
                }
            });
        });
    });

    describe('SQL Injection Protection Tests', () => {
        const sqlPayloads = [
            "'; DROP TABLE users; --",
            "' OR '1'='1",
            "'; UPDATE users SET role='admin' WHERE id=1; --",
            "' UNION SELECT * FROM users --",
            "admin'--",
            "' OR 1=1#"
        ];

        sqlPayloads.forEach((payload, index) => {
            it(`devrait résister au payload SQL injection #${index + 1}`, async () => {
                const response = await request(app)
                    .post('/api/auth/login')
                    .send({
                        email: payload,
                        password: 'anypassword'
                    });

                // Devrait retourner une erreur de validation ou unauthorized
                expect([400, 401]).toContain(response.status);
                expect(response.body.token).toBeUndefined();
            });
        });
    });

    describe('Email Validation Tests', () => {
        const invalidEmails = [
            'notanemail',
            '@domain.com',
            'user@',
            'user..name@domain.com',
            'user@domain',
            'user@.domain.com',
            '',
            ' ',
            'user@domain..com'
        ];

        invalidEmails.forEach((email, index) => {
            it(`devrait rejeter l'email invalide #${index + 1}: "${email}"`, async () => {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        pseudo: 'TestUser',
                        email: email,
                        password: 'TestPassword123!'
                    });

                expect(response.status).toBe(400);
                expect(response.body.errors).toBeDefined();
            });
        });
    });

    describe('Password Validation Tests', () => {
        const weakPasswords = [
            '123',           // Trop court
            'password',      // Pas de majuscule, chiffre, caractère spécial
            'PASSWORD',      // Pas de minuscule, chiffre, caractère spécial
            '12345678',      // Pas de lettre, caractère spécial
            'Password',      // Pas de chiffre, caractère spécial
            'Password1',     // Pas de caractère spécial
            'password1!',    // Pas de majuscule
            'PASSWORD1!',    // Pas de minuscule
            ''               // Vide
        ];

        weakPasswords.forEach((password, index) => {
            it(`devrait rejeter le mot de passe faible #${index + 1}`, async () => {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        pseudo: 'TestUser',
                        email: 'test@example.com',
                        password: password
                    });

                expect(response.status).toBe(400);
                expect(response.body.errors).toBeDefined();
            });
        });

        it('devrait accepter un mot de passe fort', async () => {
            const strongPassword = 'StrongP@ssw0rd123!';
            
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    pseudo: 'StrongUser',
                    email: 'strong@example.com',
                    password: strongPassword
                });

            expect([201, 400]).toContain(response.status);
            
            if (response.status === 400) {
                // Si rejeté, ce ne devrait pas être à cause du mot de passe
                const passwordError = response.body.errors?.find(
                    err => err.path === 'password'
                );
                expect(passwordError).toBeUndefined();
            }
        });
    });

    describe('Pseudo Validation Tests', () => {
        const invalidPseudos = [
            '',                    // Vide
            ' ',                   // Espace seulement
            'a',                   // Trop court
            'a'.repeat(51),        // Trop long
            '<script>alert(1)</script>', // XSS
            'user@domain.com',     // Format email
            'user with spaces'     // Espaces (selon règles métier)
        ];

        invalidPseudos.forEach((pseudo, index) => {
            it(`devrait rejeter le pseudo invalide #${index + 1}: "${pseudo}"`, async () => {
                const response = await request(app)
                    .post('/api/auth/register')
                    .send({
                        pseudo: pseudo,
                        email: 'test@example.com',
                        password: 'TestPassword123!'
                    });

                expect(response.status).toBe(400);
                expect(response.body.errors).toBeDefined();
            });
        });
    });

    describe('Content-Type Validation Tests', () => {
        it('devrait rejeter les Content-Type non supportés', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('Content-Type', 'text/plain')
                .send('email=test@example.com&password=password');

            expect([400, 415]).toContain(response.status);
        });

        it('devrait rejeter les payloads JSON malformés', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .set('Content-Type', 'application/json')
                .send('{"email": "test@example.com", "password": "password"'); // JSON malformé

            expect(response.status).toBe(400);
        });
    });

    describe('Large Payload Protection Tests', () => {
        it('devrait rejeter les payloads trop volumineux', async () => {
            const largeString = 'x'.repeat(11 * 1024 * 1024); // 11MB

            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    pseudo: 'TestUser',
                    email: 'test@example.com',
                    password: 'TestPassword123!',
                    bio: largeString
                });

            expect([400, 413]).toContain(response.status);
        });
    });
}); 