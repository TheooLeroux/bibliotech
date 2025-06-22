require('dotenv').config();
const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS  = process.env.ADMIN_PASS;
const TEST_EMAIL  = 'bar@example.com';
const TEST_PASS   = 'P4ssw0rd!';

let adminToken;
let userToken;
let userId;

beforeAll(async () => {
    // sync + nettoyage
    await sequelize.sync();
    await User.destroy({ where: { email: TEST_EMAIL } });

    // login admin (suppose qu'il existe et a déjà le rôle admin)
    const resAdmin = await request(app)
        .post('/api/auth/login')
        .send({ email: ADMIN_EMAIL, password: ADMIN_PASS });
    adminToken = resAdmin.body.token;

    // création de l’utilisateur de test
    await request(app)
        .post('/api/auth/register')
        .send({
            pseudo: 'bar',
            email: TEST_EMAIL,
            password: TEST_PASS,
            confirmPassword: TEST_PASS
        });
    // récupérer l’id en base
    const u = await User.findOne({ where: { email: TEST_EMAIL } });
    userId = u.id;

    // login de l’utilisateur normal
    const resUser = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASS });
    userToken = resUser.body.token;
});

afterAll(async () => {
    await User.destroy({ where: { email: TEST_EMAIL } });
    await sequelize.close();
});

describe('User Endpoints', () => {
    it("devrait laisser l'admin lister tous les utilisateurs", async () => {
        const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('devrait refuser la liste des users à un non-admin', async () => {
        await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
    });

    it('devrait exiger une authentification pour /api/users', async () => {
        await request(app).get('/api/users').expect(401);
    });

    it('devrait permettre à un user de voir son propre profil', async () => {
        const res = await request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('id', userId);
    });

    it("ne devrait pas permettre à un user de voir le profil d'un autre", async () => {
        await request(app)
            .get(`/api/users/${userId + 1}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
    });

    it("devrait laisser l'admin consulter n'importe quel profil", async () => {
        const res = await request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);
    });

    it('devrait permettre à un user de mettre à jour son propre profil', async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ bio: 'nouvelle bio' });
        expect(res.status).toBe(200);
        expect(res.body.bio).toBe('nouvelle bio');
    });

    it("ne devrait pas permettre à un user de modifier le profil d'un autre", async () => {
        await request(app)
            .put(`/api/users/${userId + 1}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({ bio: 'hack' })
            .expect(403);
    });

    it("devrait laisser l'admin modifier n'importe quel user", async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ bio: 'bio admin' });
        expect(res.status).toBe(200);
        expect(res.body.bio).toBe('bio admin');
    });

    it("devrait laisser l'admin supprimer un utilisateur", async () => {
        // créer un user temporaire
        const tmp = { pseudo: 'tmp', email: 'tmp@example.com', password: 'Tmp123!', confirmPassword: 'Tmp123!' };
        await User.destroy({ where: { email: tmp.email } });
        await request(app).post('/api/auth/register').send(tmp);
        const tmpU = await User.findOne({ where: { email: tmp.email } });

        const res = await request(app)
            .delete(`/api/users/${tmpU.id}`)
            .set('Authorization', `Bearer ${adminToken}`);
        expect(res.status).toBe(200);

        const check = await User.findOne({ where: { email: tmp.email } });
        expect(check).toBeNull();
    });

    it("ne devrait pas laisser un non-admin supprimer un utilisateur", async () => {
        await request(app)
            .delete(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(403);
    });
});
