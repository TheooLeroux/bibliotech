// tests/unit/authController.unit.test.js
const authController = require('../../controllers/authController');
const { User, BlacklistedToken } = require('../../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock des modèles
jest.mock('../../models');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthController - Unit Tests', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockReq = {
            body: {},
            params: {},
            user: { id: 1, role: 'user' },
            token: 'mock-token'
        };
        
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        
        mockNext = jest.fn();
    });

    describe('register', () => {
        it('devrait créer un utilisateur avec des données valides', async () => {
            mockReq.body = {
                pseudo: 'TestUser',
                email: 'test@example.com',
                password: 'TestPassword123!'
            };

            User.findOne.mockResolvedValue(null); // Email pas utilisé
            bcrypt.hash.mockResolvedValue('hashedPassword');
            User.create.mockResolvedValue({
                id: 1,
                pseudo: 'TestUser',
                email: 'test@example.com'
            });

            await authController.register(mockReq, mockRes);

            expect(User.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    pseudo: 'TestUser',
                    email: 'test@example.com',
                    password: 'hashedPassword'
                })
            );
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'User created successfully.'
            });
        });

        it('devrait rejeter un email déjà utilisé', async () => {
            mockReq.body = {
                pseudo: 'TestUser',
                email: 'test@example.com',
                password: 'TestPassword123!'
            };

            User.findOne.mockResolvedValue({ id: 1 }); // Email déjà utilisé

            await authController.register(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Email already in use.'
            });
        });
    });

    describe('login', () => {
        it('devrait connecter un utilisateur avec des identifiants valides', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'TestPassword123!'
            };

            const mockUser = {
                id: 1,
                pseudo: 'TestUser',
                email: 'test@example.com',
                password: 'hashedPassword',
                role: 'user',
                is_active: true,
                anonymized_at: null
            };

            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock-jwt-token');

            await authController.login(mockReq, mockRes);

            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1, role: 'user' },
                expect.any(String),
                { expiresIn: '7d' }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Login successful.',
                token: 'mock-jwt-token',
                user: expect.objectContaining({
                    id: 1,
                    pseudo: 'TestUser',
                    role: 'user'
                })
            });
        });

        it('devrait rejeter des identifiants invalides', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            User.findOne.mockResolvedValue(null); // Utilisateur non trouvé

            await authController.login(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Invalid credentials.'
            });
        });
    });

    describe('logout', () => {
        it('devrait déconnecter un utilisateur authentifié', async () => {
            BlacklistedToken.create.mockResolvedValue({});

            await authController.logout(mockReq, mockRes);

            expect(BlacklistedToken.create).toHaveBeenCalledWith({
                token: 'mock-token',
                user_id: 1,
                expires_at: expect.any(Date)
            });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Logged out successfully.'
            });
        });
    });

    describe('forgotPassword', () => {
        it('devrait traiter une demande de reset pour un email valide', async () => {
            mockReq.body = { email: 'test@example.com' };

            const mockUser = { id: 1, email: 'test@example.com' };
            User.findOne.mockResolvedValue(mockUser);
            User.update.mockResolvedValue([1]);

            await authController.forgotPassword(mockReq, mockRes);

            expect(User.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    reset_token: expect.any(String),
                    reset_token_expires: expect.any(Date)
                }),
                { where: { id: 1 } }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Un lien de réinitialisation a été envoyé à votre adresse email.'
            });
        });

        it('devrait répondre même pour un email inexistant (sécurité)', async () => {
            mockReq.body = { email: 'nonexistent@example.com' };

            User.findOne.mockResolvedValue(null);

            await authController.forgotPassword(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Un lien de réinitialisation a été envoyé à votre adresse email.'
            });
        });
    });
}); 