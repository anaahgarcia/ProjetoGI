// routes/visit.routes.js
const router = require('express').Router();
const VisitController = require('../controllers/VisitController');
const auth = require('../middlewares/auth');

// Rotas básicas
router.get('/visits', auth, VisitController.index);
router.get('/visits/:id', auth, VisitController.show);
router.post('/visits', auth, VisitController.store);

// Rotas de status
router.post('/visits/:id/execute', auth, VisitController.markAsExecuted);
router.post('/visits/:id/cancel', auth, VisitController.cancel);
router.post('/visits/:id/reschedule', auth, VisitController.reschedule);

module.exports = router;