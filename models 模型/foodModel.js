const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'BC61yBRT5oju7ua4id7f',
  database: 'smart_diet_manager'
});

const addRecord = (user_id, food_name, calories, record_date) => {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO food_records (user_id, food_name, calories, record_date) VALUES (?, ?, ?, ?)';
    pool.query(query, [user_id, food_name, calories, record_date], (error, results) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
};

module.exports = { addRecord };