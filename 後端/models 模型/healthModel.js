const db = require('../utils/db');

const updateIndicator = (user_id, weight, exercise_minutes, record_date) => {
  return new Promise((resolve, reject) => {
    // 輸入驗證
    if (!user_id || typeof weight !== 'number' || typeof exercise_minutes !== 'number' || !record_date) {
      return reject(new Error('Invalid input data'));
    }

    const query = 'UPDATE HealthIndicators SET weight = ?, exercise_minutes = ?, record_date = ? WHERE user_id = ?';
    db.query(query, [weight, exercise_minutes, record_date, user_id], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

module.exports = { updateIndicator };