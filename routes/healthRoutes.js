const express = require('express');
const router = express.Router();
const db = require('../server');  // 引入數據庫連接

// 查詢所有健康信息
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM health';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error retrieving health information:', err);
      res.status(500).send('Error retrieving health information');
      return;
    }
    res.json(results);
  });
});

// 新增健康信息
router.post('/', (req, res) => {
  const newHealth = req.body;
  const sql = 'INSERT INTO health SET ?';
  db.query(sql, newHealth, (err, result) => {
    if (err) {
      console.error('Error adding health information:', err);
      res.status(500).send('Error adding health information');
      return;
    }
    res.send(`Health information added successfully with ID ${result.insertId}`);
  });
});

// 更新健康信息
router.put('/:id', (req, res) => {
  const healthId = req.params.id;
  const updatedHealth = req.body;
  const sql = 'UPDATE health SET ? WHERE id = ?';
  db.query(sql, [updatedHealth, healthId], (err, result) => {
    if (err) {
      console.error('Error updating health information:', err);
      res.status(500).send('Error updating health information');
      return;
    }
    res.send(`Health information with ID ${healthId} updated successfully`);
  });
});

// 刪除健康信息
router.delete('/:id', (req, res) => {
  const healthId = req.params.id;
  const sql = 'DELETE FROM health WHERE id = ?';
  db.query(sql, [healthId], (err, result) => {
    if (err) {
      console.error('Error deleting health information:', err);
      res.status(500).send('Error deleting health information');
      return;
    }
    res.send(`Health information with ID ${healthId} deleted successfully`);
  });
});

module.exports = router;
