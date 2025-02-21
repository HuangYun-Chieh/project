const express = require('express');
const db = require('./db');
const app = express();
const port = 3000;

app.use(express.json());

const foodRoutes = require('./routes/foodRoutes');
const healthRoutes = require('./routes/healthRoutes');

app.use('/food', foodRoutes);
app.use('/health', healthRoutes);

app.get('/test', (req, res) => {
  res.send('Server is running correctly.');
});

app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = db;
