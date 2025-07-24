// tests/unit/authController.test.js
const request = require('supertest');
const app = require('../../app');
const { User, BlacklistedToken } = require('../../models');
const { testUsers } = require('../fixtures/testData');

// Mock des modèles
jest.mock('../../models');

describe('AuthController', () => {
    let mockUser;
    
    beforeEach(() => {
        jest.clearAllMocks();
        mockUser = {
            id: 1,
            pseudo: 'TestUser',
            email: 'test@example.com',
            password: '$2a$10$hashedpassword',
            role: 'user',
            is_active: true,
            anonymized_at: null
        };
    });

    describe('POST /api/auth/register', () => {
        it('devrait créer un nouvel utilisateur avec des données valides', async () => {
            User.findOne.mockResolvedValue(null); // Email pas encore utilisé
            User.create.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/api/auth/register')
                .send(testUsers.validUser);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('User created successfully.');
            expect(User.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    pseudo: testUsers.validUser.pseudo,
                    email: testUsers.validUser.email
                })
            );
        });

        it('devrait rejeter un email déjà utilisé', async () => {
            User.findOne.mockResolvedValue(mockUser); // Email déjà utilisé

            const response = await request(app)
                .post('/api/auth/register')
                .send(testUsers.validUser);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Email already in use.');
        });

        it('devrait rejeter des données invalides', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUsers.invalidUser);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('POST /api/auth/login', () => {
        it('devrait connecter un utilisateur avec des identifiants valides', async () => {
            const bcrypt = require('bcryptjs');
            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
            User.findOne.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUsers.validUser.email,
                    password: testUsers.validUser.password
                });

            expect(response.status).toBe(200);
            expect(response.body.token).toBeDefined();
            expect(response.body.user).toBeDefined();
        });

        it('devrait rejeter des identifiants invalides', async () => {
            User.findOne.mockResolvedValue(null); // Utilisateur non trouvé

            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'wrong@email.com',
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Invalid credentials.');
        });
    });

    describe('POST /api/auth/logout', () => {
        it('devrait déconnecter un utilisateur authentifié', async () => {
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: mockUser.id }, process.env.JWT_SECRET || 'test');
            
            User.findByPk.mockResolvedValue(mockUser);
            BlacklistedToken.findOne.mockResolvedValue(null);
            BlacklistedToken.create.mockResolvedValue({});

            const response = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Logged out successfully.');
            expect(BlacklistedToken.create).toHaveBeenCalled();
        });

        it('devrait rejeter les requêtes sans token', async () => {
            const response = await request(app)
                .post('/api/auth/logout');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Unauthorized.');
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        it('devrait envoyer un email de réinitialisation', async () => {
            User.findOne.mockResolvedValue(mockUser);
            User.update.mockResolvedValue([1]);

            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: testUsers.validUser.email });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Un lien de réinitialisation a été envoyé à votre adresse email.');
        });

        it('devrait répondre même pour un email inexistant (sécurité)', async () => {
            User.findOne.mockResolvedValue(null);

            const response = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@email.com' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Un lien de réinitialisation a été envoyé à votre adresse email.');
        });
    });
}); 