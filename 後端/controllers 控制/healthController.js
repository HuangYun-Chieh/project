const Health = require('../models/healthModel');

const updateHealthIndicator = async (req, res) => {
  try {
    const { user_id, weight, exercise_minutes, record_date } = req.body;

    if (!user_id || typeof weight !== 'number' || typeof exercise_minutes !== 'number' || !record_date) {
      return res.status(400).send('Invalid input data');
    }

    await Health.updateIndicator(user_id, weight, exercise_minutes, record_date);
    res.status(200).send('Health indicator updated successfully');
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).send('Error updating data');
  }
};

module.exports = { updateHealthIndicator };