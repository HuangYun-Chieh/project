const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'BC61yBRT5oju7ua4id7f',
  database: 'smart_diet_manager'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

app.use(express.json());

const foodRoutes = require('./routes/foodRoutes');
const healthRoutes = require('./routes/healthRoutes');

app.use('/food', foodRoutes);
app.use('/health', healthRoutes);

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = db;
