require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');

const TEST_EMAIL = 'foo@example.com';
const TEST_PASSWORD = 'P4ssw0rd!';

beforeAll(async () => {
    // synchronisation et suppression préalable
    await sequelize.sync();
    await User.destroy({ where: { email: TEST_EMAIL } });
});

afterAll(async () => {
    // nettoyage et fermeture de la connexion
    await User.destroy({ where: { email: TEST_EMAIL } });
    await sequelize.close();
});

describe('Auth Endpoints', () => {
    it('devrait enregistrer un nouvel utilisateur', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                pseudo: 'foo',
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                confirmPassword: TEST_PASSWORD
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('user.id');
        expect(res.body.user.pseudo).toBe('foo');
    });

    it('ne devrait pas enregistrer un utilisateur si l’email existe déjà', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                pseudo: 'foo',
                email: TEST_EMAIL,
                password: TEST_PASSWORD,
                confirmPassword: TEST_PASSWORD
            });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('devrait connecter un utilisateur existant', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: TEST_PASSWORD });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        // l’objet user retourné contient { id, pseudo, role }
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('pseudo');
        expect(res.body.user).toHaveProperty('role');
    });

    it('ne devrait pas connecter avec un mauvais mot de passe', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: TEST_EMAIL, password: 'mauvais' });
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('message');
    });

    it('doit renvoyer 400 si email ou mot de passe absent', async () => {
        await request(app)
            .post('/api/auth/login')
            .send({ email: '', password: '' })
            .expect(400);
    });

    it('devrait générer un lien de réinitialisation (forgot-password)', async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: TEST_EMAIL });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('link');
    });

    it("devrait renvoyer 404 si l'email n'existe pas (forgot-password)", async () => {
        const res = await request(app)
            .post('/api/auth/forgot-password')
            .send({ email: 'inconnu@example.com' });
        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('message');
    });

    it('ne devrait pas réinitialiser le mot de passe sans token valide', async () => {
        const res = await request(app)
            .post('/api/auth/reset-password/fauxtoken')
            .send({ newPassword: 'Abcd1234!', confirmPassword: 'Abcd1234!' });
        expect(res.status).toBe(400);
    });

    // Si tu veux tester la vraie réinitialisation,
    // il faudrait extraire le token depuis link et l’utiliser ici…
    it.todo('devrait réinitialiser le mot de passe avec un token valide');
});
