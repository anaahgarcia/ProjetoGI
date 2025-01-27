const router = require('express').Router();
const ClientController = require('../controllers/ClientController');
const auth = require('../middlewares/auth'); // Middleware de autenticação

// Rotas básicas
router.get('/clients', auth, ClientController.index);
router.get('/clients/:id', auth, ClientController.show);
router.post('/clients', auth, ClientController.store);
router.put('/clients/:id', auth, ClientController.update);

// Rotas específicas
router.post('/clients/:id/properties', auth, ClientController.addPropertyInterest);
router.post('/clients/:id/notes', auth, ClientController.addNote);
router.put('/clients/:id/documents', auth, ClientController.updateDocuments);

module.exports = router;