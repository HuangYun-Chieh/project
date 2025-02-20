const express = require('express');
const app = express();
const port = 3000;
const foodRoutes = require('./routes/foodRoutes');
const healthRoutes = require('./routes/healthRoutes');

app.use(express.json());
app.use(foodRoutes);
app.use(healthRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
