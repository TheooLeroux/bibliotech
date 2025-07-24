// tests/unit/userController.test.js
const request = require('supertest');
const app = require('../../app');
const { User, Book } = require('../../models');

jest.mock('../../models');

describe('UserController', () => {
    let mockUser, authToken;

    beforeEach(() => {
        jest.clearAllMocks();
        mockUser = {
            id: 1,
            pseudo: 'TestUser',
            email: 'test@example.com',
            role: 'user',
            is_active: true,
            anonymized_at: null,
            bio: 'Bio de test'
        };

        // Génération d'un token de test
        const jwt = require('jsonwebtoken');
        authToken = jwt.sign(
            { id: mockUser.id, role: mockUser.role },
            process.env.JWT_SECRET || 'test'
        );
    });

    describe('GET /api/users/profile', () => {
        it('devrait retourner le profil de l\'utilisateur authentifié', async () => {
            User.findByPk.mockResolvedValue(mockUser);

            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.pseudo).toBe(mockUser.pseudo);
            expect(response.body.email).toBe(mockUser.email);
            expect(response.body.password).toBeUndefined(); // Mot de passe exclu
        });

        it('devrait rejeter les requêtes non authentifiées', async () => {
            const response = await request(app)
                .get('/api/users/profile');

            expect(response.status).toBe(401);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('devrait mettre à jour le profil utilisateur', async () => {
            const updatedUser = { ...mockUser, bio: 'Nouvelle bio' };
            User.findByPk.mockResolvedValue(mockUser);
            User.prototype.update = jest.fn().mockResolvedValue(updatedUser);

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ bio: 'Nouvelle bio' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Profile updated successfully.');
        });

        it('ne devrait pas permettre de modifier le mot de passe via cette route', async () => {
            User.findByPk.mockResolvedValue(mockUser);
            User.prototype.update = jest.fn().mockResolvedValue(mockUser);

            const response = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ password: 'nouveaumotdepasse' });

            expect(response.status).toBe(200);
            // Le mot de passe ne devrait pas être dans les données mises à jour
            expect(User.prototype.update).not.toHaveBeenCalledWith(
                expect.objectContaining({ password: expect.any(String) })
            );
        });
    });

    describe('DELETE /api/users/:id', () => {
        it('devrait permettre à un utilisateur de supprimer son propre compte', async () => {
            User.findByPk.mockResolvedValue(mockUser);
            Book.update.mockResolvedValue([2]); // 2 livres transférés
            User.prototype.destroy = jest.fn().mockResolvedValue();

            const response = await request(app)
                .delete(`/api/users/${mockUser.id}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('User deleted successfully.');
            expect(response.body.booksTransferred).toBe(2);
            expect(Book.update).toHaveBeenCalledWith(
                { user_id: 1 }, // Transfert vers utilisateur Anonyme
                { where: { user_id: mockUser.id } }
            );
        });

        it('ne devrait pas permettre de supprimer l\'utilisateur Anonyme (ID 1)', async () => {
            const jwt = require('jsonwebtoken');
            const anonymousUser = { ...mockUser, id: 1 };
            User.findByPk.mockResolvedValue(anonymousUser);

            // Token pour l'utilisateur Anonyme
            const anonymousToken = jwt.sign(
                { id: 1, role: 'user' },
                process.env.JWT_SECRET || 'test'
            );

            const response = await request(app)
                .delete('/api/users/1')
                .set('Authorization', `Bearer ${anonymousToken}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Cannot delete the Anonymous user.');
        });

        it('devrait rejeter la suppression d\'un autre utilisateur (non admin)', async () => {
            User.findByPk.mockResolvedValue(mockUser);

            const response = await request(app)
                .delete('/api/users/999') // ID différent
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Forbidden.');
        });
    });

    describe('GET /api/users (Admin only)', () => {
        it('devrait permettre aux admins de lister les utilisateurs', async () => {
            const jwt = require('jsonwebtoken');
            const adminToken = jwt.sign(
                { id: 2, role: 'admin' },
                process.env.JWT_SECRET || 'test'
            );
            
            const adminUser = { ...mockUser, id: 2, role: 'admin' };
            User.findByPk.mockResolvedValue(adminUser);
            User.findAll.mockResolvedValue([mockUser]);

            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        it('devrait rejeter les utilisateurs non-admin', async () => {
            User.findByPk.mockResolvedValue(mockUser);

            const response = await request(app)
                .get('/api/users')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(403);
        });
    });
}); 