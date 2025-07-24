// tests/unit/favoriteController.test.js
const request = require('supertest');
const app = require('../../app');
const { Favorite, Book, User } = require('../../models');

jest.mock('../../models');

describe('FavoriteController', () => {
    let mockUser, authToken, mockBook, mockFavorite;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockUser = {
            id: 1,
            pseudo: 'TestUser',
            role: 'user',
            is_active: true,
            anonymized_at: null
        };

        mockBook = {
            id: 1,
            title: 'Livre Test',
            author: 'Auteur Test',
            cover_url: 'cover.jpg'
        };

        mockFavorite = {
            id: 1,
            user_id: 1,
            book_id: 1,
            created_at: new Date(),
            book: mockBook
        };

        const jwt = require('jsonwebtoken');
        authToken = jwt.sign(
            { id: mockUser.id, role: mockUser.role },
            process.env.JWT_SECRET || 'test'
        );
    });

    describe('POST /api/favorites', () => {
        it('devrait ajouter un livre aux favoris', async () => {
            User.findByPk.mockResolvedValue(mockUser);
            Favorite.create.mockResolvedValue(mockFavorite);

            const response = await request(app)
                .post('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ bookId: 1 });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Livre ajouté aux favoris');
            expect(Favorite.create).toHaveBeenCalledWith({
                user_id: mockUser.id,
                book_id: 1
            });
        });

        it('devrait rejeter les requêtes non authentifiées', async () => {
            const response = await request(app)
                .post('/api/favorites')
                .send({ bookId: 1 });

            expect(response.status).toBe(401);
        });

        it('devrait rejeter les données invalides', async () => {
            User.findByPk.mockResolvedValue(mockUser);

            const response = await request(app)
                .post('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ bookId: 'invalid' });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/favorites', () => {
        it('devrait retourner la liste des favoris de l\'utilisateur', async () => {
            User.findByPk.mockResolvedValue(mockUser);
            Favorite.findAll.mockResolvedValue([mockFavorite]);

            const response = await request(app)
                .get('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(Favorite.findAll).toHaveBeenCalledWith({
                where: { user_id: mockUser.id },
                include: [{
                    model: Book,
                    attributes: ['id', 'title', 'author', 'cover_url']
                }]
            });
        });

        it('devrait retourner une liste vide si aucun favori', async () => {
            User.findByPk.mockResolvedValue(mockUser);
            Favorite.findAll.mockResolvedValue([]);

            const response = await request(app)
                .get('/api/favorites')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.data).toEqual([]);
        });
    });

    describe('DELETE /api/favorites/:bookId', () => {
        it('devrait retirer un livre des favoris', async () => {
            User.findByPk.mockResolvedValue(mockUser);
            Favorite.destroy.mockResolvedValue(1); // 1 ligne affectée

            const response = await request(app)
                .delete('/api/favorites/1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Livre retiré des favoris');
            expect(Favorite.destroy).toHaveBeenCalledWith({
                where: {
                    user_id: mockUser.id,
                    book_id: '1'
                }
            });
        });

        it('devrait retourner 404 si le favori n\'existe pas', async () => {
            User.findByPk.mockResolvedValue(mockUser);
            Favorite.destroy.mockResolvedValue(0); // Aucune ligne affectée

            const response = await request(app)
                .delete('/api/favorites/999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Favori non trouvé');
        });
    });

    describe('GET /api/favorites/check/:bookId', () => {
        it('devrait confirmer qu\'un livre est en favori', async () => {
            User.findByPk.mockResolvedValue(mockUser);
            Favorite.findOne.mockResolvedValue(mockFavorite);

            const response = await request(app)
                .get('/api/favorites/check/1')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.isFavorite).toBe(true);
        });

        it('devrait confirmer qu\'un livre n\'est pas en favori', async () => {
            User.findByPk.mockResolvedValue(mockUser);
            Favorite.findOne.mockResolvedValue(null);

            const response = await request(app)
                .get('/api/favorites/check/999')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.isFavorite).toBe(false);
        });
    });
}); 