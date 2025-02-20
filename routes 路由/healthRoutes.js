const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');

router.put('/updateHealthIndicator', healthController.updateHealthIndicator);

module.exports = router;
