// jest.config.js
module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    reporters: [
        'default',
        ['jest-html-reporters', {
            publicPath: 'reports',
            filename: 'Rapport-de-tests-BiblioTech.html',
            expand: true,
            pageTitle: 'Rapport de tests BiblioTech'
        }]
    ],
};
