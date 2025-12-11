require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const app = express();

// --- 1. 設定前端靜態檔案路徑 ---
// 注意：請確認你的資料夾名稱到底是「專題 前端」(有空格) 還是「專題_前端」(底線)
// 這裡預設用「有空格」的版本，因為你剛剛說路徑有空格
const frontendPath = path.join(__dirname, '../../專題 前端'); 
console.log('前端網頁路徑設為:', frontendPath); 

if (fs.existsSync(frontendPath)) {
    console.log('✅ 成功讀取前端資料夾！');
} else {
    console.log('❌ 警告：找不到前端資料夾，請檢查路徑名稱 (空格 vs 底線)');
}

app.use(express.static(frontendPath));

// --- 2. 資料庫連線模組 ---
const db = require('./db');
// 初始化資料庫 (加了 catch 防止沒連線就崩潰)
if (db && db.init && typeof db.init === 'function') {
  db.init().catch(err => console.error('DB init error (資料庫連線失敗，但伺服器會繼續跑)', err));
}

// --- 3. 基礎設定 ---
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_123456';

// --- 4. Passport Google OAuth2 設定 ---
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(passport.initialize());

passport.use(new GoogleStrategy({
    // 這裡直接用寫死的，避免 .env 讀不到的問題
    clientID: '362743249793-kakkbms83u3ofbi6dci6uk42r1j0lvau.apps.googleusercontent.com',
    clientSecret: 'GOCSPX-NZV9Rf8tJHmyOY0uC-Y8qeVQApI',
    callbackURL: 'http://localhost:3000/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    console.log('Google Auth Profile:', profile.displayName);

    const googleId = profile.id;
    const email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : null;
    const displayName = profile.displayName || 'Google User';
    const photo = (profile.photos && profile.photos[0]) ? profile.photos[0].value : null;
    
    const username = email || `google_${googleId}`;

    // 檢查 db 模組是否有封裝好的方法
    if (db.findUserByUsername) {
      let user = await db.findUserByUsername(username);
      if (!user) {
        user = await db.createUser(username, 'google_oauth', displayName);
      }
      return done(null, user);
    } 
    // 直接寫 SQL 邏輯
    else {
      // 1. 先用 google_id 找找看有沒有這個人
      const [rows] = await db.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
      
      let user = rows[0];

      if (!user) {
        // 2. 如果沒有，再用 username 找找看 (避免重複註冊)
        const [rowsByEmail] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        
        if (rowsByEmail.length > 0) {
            // 已經有這個 email 但沒綁定 google_id，幫他更新綁定
            user = rowsByEmail[0];
            await db.query('UPDATE users SET google_id = ?, avatar_url = ? WHERE id = ?', [googleId, photo, user.id]);
        } else {
            // 3. 完全的新用戶，執行 INSERT
            const [result] = await db.query(
              'INSERT INTO users (google_id, username, email, display_name, avatar_url, password) VALUES (?, ?, ?, ?, ?, ?)', 
              [googleId, username, email, displayName, photo, 'google_login_no_pass']
            );
            user = { id: result.insertId, username, nickname: displayName };
        }
      }
      return done(null, user);
    }
  } catch (err) {
    console.error('Google Strategy Error:', err);
    return done(err);
  }
}));

// --- 5. 路由設定 ---

// ★★★ 作弊通道 (備用：萬一回家資料庫還是連不上，用這個可以先操作) ★★★
app.get('/auth/fake', (req, res) => {
    const fakeUser = { id: 1, username: 'test_user', nickname: '測試人員' };
    const token = jwt.sign(fakeUser, JWT_SECRET, { expiresIn: '1h' });
    console.log("已觸發作弊登入，Token:", token);
    res.redirect(`/home.html?token=${token}`);
});

// Google 登入路由
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google 回調路由
app.get('/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login.html' }), (req, res) => {
  const user = req.user;
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  
  // 導向回首頁
  res.redirect(`http://localhost:3000/home.html?token=${token}`);
});

app.get('/', (req, res) => {
  res.redirect('/home.html');
});

// --- 6. API 路由 ---

// 測試資料庫連線用
app.get('/test-db', async (req, res) => {
  try {
      const [rows] = await db.query('SELECT 1 + 1 AS result');
      res.json({ success: true, result: rows[0].result, message: "資料庫連線成功！" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: '缺少帳號或密碼' });

    const [existing] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(409).json({ success: false, error: '帳號已存在' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
        'INSERT INTO users (username, password, display_name) VALUES (?, ?, ?)', 
        [username, hashed, nickname || username]
    );
    
    const token = jwt.sign({ id: result.insertId, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: '缺少帳號或密碼' });

    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).json({ success: false, error: '帳號或密碼錯誤' });

    const user = rows[0];
    if (user.password === 'google_login_no_pass') {
        return res.status(401).json({ success: false, error: '請使用 Google 登入' });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ success: false, error: '帳號或密碼錯誤' });

    const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, nickname: user.display_name });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// JWT 驗證 Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, error: 'no token' });
  const parts = authHeader.split(' ');
  if (parts.length !== 2) return res.status(401).json({ success: false, error: 'invalid token format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'invalid token' });
  }
}

// 飲食紀錄 API
app.get('/api/foods', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
        'SELECT id, food_name, calories, category, record_date FROM food_records WHERE user_id = ? ORDER BY record_date DESC, id DESC', 
        [userId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    // 萬一資料庫壞掉，回傳假資料讓前端有畫面
    res.json({ success: true, data: [] });
  }
});

app.post('/api/foods', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { food_name, calories, category, record_date } = req.body;
    const date = record_date || new Date();
    const [result] = await db.query(
        'INSERT INTO food_records (user_id, food_name, calories, category, record_date) VALUES (?, ?, ?, ?, ?)', 
        [userId, food_name, calories || 0, category || '其他', date]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/foods/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);
    await db.query('DELETE FROM food_records WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Profile API
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT id, username, display_name, email, avatar_url FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ success: false, error: 'user not found' });
    res.json({ success: true, data: {
        id: rows[0].id,
        username: rows[0].username,
        nickname: rows[0].display_name,
        avatar: rows[0].avatar_url
    }});
  } catch (err) {
     // 資料庫壞掉時的回退機制
     res.json({ success: true, data: { id: 1, username: 'test', nickname: '測試人員' }});
  }
});

// 統計報表 API
app.get('/api/reports/monthly', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [monthly] = await db.query(
        'SELECT * FROM food_records WHERE user_id = ? AND record_date >= ? AND record_date < ?', 
        [userId, start, end]
    );

    const daily = {};
    let totalCalories = 0;
    const freq = {};

    monthly.forEach(f => {
      const dateObj = new Date(f.record_date);
      const day = dateObj.getFullYear() + '-' + 
                  String(dateObj.getMonth() + 1).padStart(2, '0') + '-' + 
                  String(dateObj.getDate()).padStart(2, '0');

      daily[day] = (daily[day] || 0) + (parseInt(f.calories || 0, 10));
      totalCalories += (parseInt(f.calories || 0, 10));
      const name = (f.food_name || '').split(':')[0];
      freq[name] = (freq[name] || 0) + 1;
    });

    const mostCommon = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 5).map(x => ({ name: x[0], count: x[1] }));

    const [weights] = await db.query(
        'SELECT weight, record_date FROM weight_records WHERE user_id = ? ORDER BY record_date ASC', 
        [userId]
    );

    res.json({ success: true, data: { totalRecords: monthly.length, totalCalories, daily, mostCommon, weights }});
  } catch (err) {
    // 回傳空報表，避免畫面全白
    res.json({ success: true, data: { totalRecords: 0, totalCalories: 0, daily: {}, mostCommon: [] }});
  }
});

app.post('/api/metrics', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { weight, record_date } = req.body;
      const date = record_date || new Date();
      const [result] = await db.query(
          'INSERT INTO weight_records (user_id, weight, record_date) VALUES (?, ?, ?)', 
          [userId, weight, date]
      );
      res.json({ success: true, id: result.insertId });
    } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- 7. 啟動伺服器 ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`伺服器啟動中... http://localhost:${PORT}`);
});