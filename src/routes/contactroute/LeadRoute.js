// routes/lead.routes.js
const router = require('express').Router();
const LeadController = require('../controllers/LeadController');
const auth = require('../middlewares/auth'); // Assumindo que você tem um middleware de autenticação

// Rotas básicas
router.get('/leads', auth, LeadController.index);
router.get('/leads/:id', auth, LeadController.show);
router.post('/leads', auth, LeadController.store);
router.put('/leads/:id', auth, LeadController.update);

// Rotas específicas
router.post('/leads/:id/notes', auth, LeadController.addNote);
router.post('/leads/:id/assign', auth, LeadController.assignConsultant);
router.post('/leads/:id/lost', auth, LeadController.markAsLost);

module.exports = router;