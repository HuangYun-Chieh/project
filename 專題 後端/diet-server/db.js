// db.js - MySQL 連線設定
const mysql = require('mysql2');
require('dotenv').config();

// 建立資料庫連線池 (Pool)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD, // 會讀取 .env 裡的 Di3t!2024@Db
  database: process.env.DB_NAME || 'diet_helper',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// 測試連線
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ 資料庫連線失敗:', err.message);
  } else {
    console.log('✅ 成功連線到 MySQL 資料庫');
    connection.release();
  }
});

// 匯出 promise 版本的 pool
module.exports = pool.promise();