const db = require('../utils/db');

const addRecord = (user_id, food_name, calories, record_date) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO FoodRecords (user_id, food_name, calories, record_date) VALUES (?, ?, ?, ?)';
    db.query(query, [user_id, food_name, calories, record_date], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

module.exports = { addRecord };
