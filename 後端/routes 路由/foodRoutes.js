const express = require('express');
const router = express.Router();
const foodController = require('../controllers/foodController');

router.post('/addFoodRecord', foodController.addFoodRecord);

module.exports = router;
