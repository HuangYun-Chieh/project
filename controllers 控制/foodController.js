const Food = require('../models/foodModel');

const addFoodRecord = async (req, res) => {
  try {
    const { user_id, food_name, calories, record_date } = req.body;

    // 輸入驗證
    if (!user_id || !food_name || typeof calories !== 'number' || !record_date) {
      return res.status(400).send('Invalid input data');
    }

    await Food.addRecord(user_id, food_name, calories, record_date);
    res.status(200).send('Food record added successfully');
  } catch (err) {
    console.error('Error inserting data:', err);
    res.status(500).send('Error inserting data');
  }
};

module.exports = { addFoodRecord };