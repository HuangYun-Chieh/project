const Health = require('../models/healthModel');

const updateHealthIndicator = async (req, res) => {
  try {
    const { user_id, weight, exercise_minutes, record_date } = req.body;
    await Health.updateIndicator(user_id, weight, exercise_minutes, record_date);
    res.status(200).send('Health indicator updated successfully');
  } catch (err) {
    console.error('Error updating data:', err);
    res.status(500).send('Error updating data');
  }
};

module.exports = { updateHealthIndicator };
