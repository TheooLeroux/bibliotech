module.exports = {
    testEnvironment: 'node',
    reporters: [
        'default',
        ['jest-html-reporters', {
            publicPath: 'reports',
            filename: 'Rapport-de-tests-BiblioTech.html',
            expand: true,
            pageTitle: 'Rapport de tests BiblioTech',
            hideIcon: false
        }]
    ],
    // (Optionnel) si tu veux toujours sortir le JSON via Jest directement
    // collectCoverage: false
};
