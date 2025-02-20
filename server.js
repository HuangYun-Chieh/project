const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

// 建立 MySQL 連接
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'BC61yBRT5oju7ua4id7f',
  database: 'smart_diet_manager'
});

// 連接到資料庫
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

// 解析 JSON 請求
app.use(express.json());

// 定義一個簡單的路由來測試連接
app.get('/', (req, res) => {
  res.send('Hello, this is the Smart Diet Manager backend!');
});

// 新增食物紀錄的路由
app.post('/addFoodRecord', (req, res) => {
  const { user_id, food_name, calories, record_date } = req.body;
  const query = 'INSERT INTO FoodRecords (user_id, food_name, calories, record_date) VALUES (?, ?, ?, ?)';

  db.query(query, [user_id, food_name, calories, record_date], (err, results) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send(`Error inserting data: ${err.message}`);
      return;
    }
    res.status(200).send('Food record added successfully');
  });
});

// 查看所有食物紀錄的路由
app.get('/foodRecords', (req, res) => {
  const query = 'SELECT * FROM FoodRecords';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching data:', err);
      res.status(500).send('Error fetching data');
      return;
    }
    res.status(200).json(results);
  });
});

// 更新健康指標的路由
app.put('/updateHealthIndicator', (req, res) => {
  const { user_id, weight, exercise_minutes, record_date } = req.body;
  const query = 'UPDATE HealthIndicators SET weight = ?, exercise_minutes = ?, record_date = ? WHERE user_id = ?';

  db.query(query, [weight, exercise_minutes, record_date, user_id], (err, results) => {
    if (err) {
      console.error('Error updating data:', err);
      res.status(500).send('Error updating data');
      return;
    }
    res.status(200).send('Health indicator updated successfully');
  });
});

// 刪除食物紀錄的路由
app.delete('/deleteFoodRecord', (req, res) => {
  const { record_id } = req.body;
  const query = 'DELETE FROM FoodRecords WHERE record_id = ?';

  db.query(query, [record_id], (err, results) => {
    if (err) {
      console.error('Error deleting data:', err);
      res.status(500).send('Error deleting data');
      return;
    }
    res.status(200).send('Food record deleted successfully');
  });
});

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
