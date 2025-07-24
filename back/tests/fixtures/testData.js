// tests/fixtures/testData.js

const testUsers = {
    validUser: {
        pseudo: 'TestUser',
        email: 'test@example.com',
        password: 'TestPassword123!'
    },
    adminUser: {
        pseudo: 'TestAdmin',
        email: 'admin@example.com',
        password: 'AdminPassword123!',
        role: 'admin'
    },
    invalidUser: {
        pseudo: 'Invalid',
        email: 'invalid-email',
        password: '123' // Trop court
    }
};

const testBooks = {
    validBook: {
        title: 'Livre de Test',
        author: 'Auteur Test',
        description: 'Description du livre de test',
        main_genre_id: 1,
        sub_genres: [1, 2]
    },
    invalidBook: {
        title: '', // Titre vide
        author: 'Auteur',
        description: 'Description'
    }
};

const testComments = {
    validComment: {
        content: 'Excellent livre, je le recommande !',
        rating: 5
    },
    invalidComment: {
        content: '', // Contenu vide
        rating: 6 // Note invalide
    }
};

const testFavorites = {
    validFavorite: {
        bookId: 1
    }
};

const testReadingHistory = {
    validReading: {
        status: 'reading',
        progress_percentage: 50,
        last_page_read: 100
    },
    completedReading: {
        status: 'completed',
        progress_percentage: 100,
        last_page_read: 200
    }
};

const testReports = {
    validReport: {
        type: 'book',
        targetId: 1,
        reason: 'Contenu inapproprié',
        description: 'Ce livre contient du contenu offensant'
    }
};

module.exports = {
    testUsers,
    testBooks,
    testComments,
    testFavorites,
    testReadingHistory,
    testReports
}; 