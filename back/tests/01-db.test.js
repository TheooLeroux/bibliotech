// tests/01-db.test.js
require('dotenv').config();

const { sequelize } = require('../models');
const mongoose = require('mongoose');

describe('Database connectivity & schema', () => {
    it('doit se connecter à MariaDB et trouver la table users', async () => {
        await expect(sequelize.authenticate()).resolves.toBeUndefined();

        const rawTables = await sequelize.getQueryInterface().showAllTables();
        const tableNames = rawTables.map(tbl => {
            if (typeof tbl === 'object') {
                return (tbl.tableName || tbl.name || '').toLowerCase();
            }
            return String(tbl).toLowerCase();
        });

        expect(tableNames).toEqual(expect.arrayContaining(['users']));
    });

    it('doit se connecter à MongoDB et trouver au moins une collection', async () => {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const collections = await mongoose.connection.db.listCollections().toArray();
        const colls = collections.map(c => c.name.toLowerCase());

        expect(colls.length).toBeGreaterThan(0);

        await mongoose.disconnect();
    });
});
