const express = require('express');
const router = express.Router();
const foodController = require('../controllers 控制/foodController');

router.post('/addFoodRecord', foodController.addFoodRecord);

module.exports = router;
