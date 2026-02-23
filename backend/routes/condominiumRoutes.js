const express = require('express');
const router = express.Router();
const condominiumController = require('../controllers/condominiumController');

router.get('/', condominiumController.getCondominiums);

module.exports = router;
