const express = require('express');
const router = express.Router();
const db = require('../db');

// 獲取所有食物記錄
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM foodrecords';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching food records:', err);
      res.status(500).send('Something went wrong! Error: ' + err.message);
      return;
    }
    res.json(results);
  });
});

// 獲取單個食物記錄
router.get('/:record_id', (req, res) => {
  const { record_id } = req.params;
  const sql = 'SELECT * FROM foodrecords WHERE record_id = ?';
  db.query(sql, [record_id], (err, result) => {
    if (err) {
      console.error('Error fetching food record:', err);
      res.status(500).send('Something went wrong! Error: ' + err.message);
      return;
    }
    if (result.length === 0) {
      res.status(404).send('Food record not found.');
      return;
    }
    res.json(result[0]);
  });
});

// 新增食物記錄
router.post('/', (req, res) => {
  const { user_id, food_name, calories, record_date } = req.body;
  console.log('POST /food', req.body); // 添加日誌記錄
  const sql = 'INSERT INTO foodrecords (user_id, food_name, calories, record_date) VALUES (?, ?, ?, ?)';
  db.query(sql, [user_id, food_name, calories, record_date], (err, result) => {
    if (err) {
      console.error('Error adding food record:', err);
      console.error('SQL:', sql);
      console.error('Parameters:', [user_id, food_name, calories, record_date]);
      res.status(500).send('Something went wrong! Error: ' + err.message);
      return;
    }
    res.status(201).send('Food record added successfully.');
  });
});

// 更新食物記錄
router.put('/:record_id', (req, res) => {
  const { record_id } = req.params;
  const { user_id, food_name, calories, record_date } = req.body;
  console.log('PUT /food/' + record_id, req.body); // 添加日誌記錄
  const sql = 'UPDATE foodrecords SET user_id = ?, food_name = ?, calories = ?, record_date = ? WHERE record_id = ?';
  db.query(sql, [user_id, food_name, calories, record_date, record_id], (err, result) => {
    if (err) {
      console.error('Error updating food record:', err);
      console.error('SQL:', sql);
      console.error('Parameters:', [user_id, food_name, calories, record_date, record_id]);
      res.status(500).send('Something went wrong! Error: ' + err.message);
      return;
    }
    res.send('Food record updated successfully.');
  });
});

// 刪除食物記錄
router.delete('/:record_id', (req, res) => {
  const { record_id } = req.params;
  console.log('DELETE /food/' + record_id); // 添加日誌記錄
  const sql = 'DELETE FROM foodrecords WHERE record_id = ?';
  db.query(sql, [record_id], (err, result) => {
    if (err) {
      console.error('Error deleting food record:', err);
      console.error('SQL:', sql);
      console.error('Parameters:', [record_id]);
      res.status(500).send('Something went wrong! Error: ' + err.message);
      return;
    }
    res.send('Food record deleted successfully.');
  });
});

module.exports = router;
