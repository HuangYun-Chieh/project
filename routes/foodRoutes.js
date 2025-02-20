const express = require('express');
const router = express.Router();
const db = require('../server');  // 引入數據庫連接

// 查詢所有食物項目
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM foods';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving food items:', err);
      res.status(500).send('Error retrieving food items');
      return;
    }
    res.json(results);
  });
});

// 新增食物項目
router.post('/', (req, res) => {
  const newFood = req.body;
  const sql = 'INSERT INTO foods SET ?';
  db.query(sql, newFood, (err, result) => {
    if (err) {
      console.error('Error adding food item:', err);
      res.status(500).send('Error adding food item');
      return;
    }
    res.send(`Food item added successfully with ID ${result.insertId}`);
  });
});

// 更新食物項目
router.put('/:id', (req, res) => {
  const foodId = req.params.id;
  const updatedFood = req.body;
  const sql = 'UPDATE foods SET ? WHERE id = ?';
  db.query(sql, [updatedFood, foodId], (err, result) => {
    if (err) {
      console.error('Error updating food item:', err);
      res.status(500).send('Error updating food item');
      return;
    }
    res.send(`Food item with ID ${foodId} updated successfully`);
  });
});

// 刪除食物項目
router.delete('/:id', (req, res) => {
  const foodId = req.params.id;
  const sql = 'DELETE FROM foods WHERE id = ?';
  db.query(sql, [foodId], (err, result) => {
    if (err) {
      console.error('Error deleting food item:', err);
      res.status(500).send('Error deleting food item');
      return;
    }
    res.send(`Food item with ID ${foodId} deleted successfully`);
  });
});

module.exports = router;
