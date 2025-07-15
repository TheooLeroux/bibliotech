const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/admin');
const { validateReport } = require('../middlewares/validation');

// Routes protégées par authentification
router.use(protect);

// Créer un signalement
router.post('/', validateReport, reportController.createReport);

// Routes admin
router.use(adminMiddleware);

// Obtenir tous les signalements
router.get('/', reportController.getAllReports);

// Traiter un signalement
router.patch('/:reportId', reportController.handleReport);

// Obtenir les statistiques des signalements
router.get('/stats', reportController.getReportStats);

module.exports = router; 