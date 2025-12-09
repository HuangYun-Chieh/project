require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();


const frontendPath = path.join(__dirname, '../../專題 前端');
console.log('前端網頁路徑設為:', frontendPath); 


app.use(express.static(frontendPath));


const db = require('./db');
console.log('db module keys at require time ->', Object.keys(db).sort());

if (db && db.init && typeof db.init === 'function') {
  db.init().catch(err => console.error('DB init error', err));
}

const fs = require('fs');
const fallbackFile = path.join(__dirname, 'data', 'db.json');
function readFallback() {
  if (!fs.existsSync(fallbackFile)) return null;
  try { return JSON.parse(fs.readFileSync(fallbackFile, 'utf8')); } catch (e) { return null; }
}
function writeFallback(obj) {
  try { fs.writeFileSync(fallbackFile, JSON.stringify(obj, null, 2)); return true; } catch (e) { return false; }
}

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// --- Passport Google OAuth2 setup
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const username = email || `google_${profile.id}`;
    
    if (db.findUserByUsername) {
      let user = await db.findUserByUsername(username);
      if (!user) {
        user = await db.createUser(username, 'google_oauth', profile.displayName || null);
      }
      return done(null, user);
    }
  
    return done(null, { id: profile.id, username });
  } catch (err) {
    return done(err);
  }
}));

// Auth routes for Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const user = req.user;
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  const redirectTo = process.env.FRONTEND_URL || 'http://localhost:3000/home.html';
  res.redirect(`${redirectTo}#token=${token}`);
});


app.get('/', (req, res) => {
  res.redirect('/home.html');
});

app.get('/test-db', async (req, res) => {
  try {
    if (db.listUsers) {
      const users = await db.listUsers();
      res.json({ success: true, count: users.length });
    } else {
      const [rows] = await db.query('SELECT 1 + 1 AS result');
      res.json({ success: true, result: rows[0].result });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'username and password required' });

    if (db.findUserByUsername) {
      const existing = await db.findUserByUsername(username);
      if (existing) return res.status(409).json({ success: false, error: 'username already exists' });
      const hashed = await bcrypt.hash(password, 10);
      const user = await db.createUser(username, hashed, nickname);
      const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token });
    } else {
      const hashed = await bcrypt.hash(password, 10);
      const [result] = await db.query('INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)', [username, hashed, nickname || null]);
      const userId = result.insertId;
      const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'username and password required' });

    if (db.findUserByUsername) {
      const user = await db.findUserByUsername(username);
      if (!user) return res.status(401).json({ success: false, error: 'invalid credentials' });
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ success: false, error: 'invalid credentials' });
      const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, nickname: user.nickname });
    } else {
      const [rows] = await db.query('SELECT id, password, nickname FROM users WHERE username = ?', [username]);
      if (!rows.length) return res.status(401).json({ success: false, error: 'invalid credentials' });
      const user = rows[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ success: false, error: 'invalid credentials' });
      const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ success: true, token, nickname: user.nickname });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


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


app.get('/api/foods', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    if (db.listFoodsByUser) {
      const rows = await db.listFoodsByUser(userId);
      res.json({ success: true, data: rows });
    } else {
      const [rows] = await db.query('SELECT id, food_name, calories, meal_type, created_at FROM food_records WHERE user_id = ? ORDER BY created_at DESC', [userId]);
      res.json({ success: true, data: rows });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/foods', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { food_name, calories, meal_type } = req.body;
    if (db.createFood) {
      const rec = await db.createFood(userId, food_name, calories || 0, meal_type || '其他');
      res.json({ success: true, id: rec.id });
    } else {
      const [result] = await db.query('INSERT INTO food_records (user_id, food_name, calories, meal_type, record_date) VALUES (?, ?, ?, ?, CURDATE())', [userId, food_name, calories || 0, meal_type || '其他']);
      res.json({ success: true, id: result.insertId });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.put('/api/foods/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);
    const { food_name, calories, meal_type } = req.body;
    if (db.updateFood) {
      const ok = await db.updateFood(id, userId, { food_name, calories: calories || 0, meal_type: meal_type || '其他' });
      if (!ok) return res.status(404).json({ success: false, error: 'not found' });
      res.json({ success: true });
    } else {
      await db.query('UPDATE food_records SET food_name = ?, calories = ?, meal_type = ? WHERE id = ? AND user_id = ?', [food_name, calories || 0, meal_type || '其他', id, userId]);
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete('/api/foods/:id', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = parseInt(req.params.id, 10);
    if (db.deleteFood) {
      const ok = await db.deleteFood(id, userId);
      if (!ok) return res.status(404).json({ success: false, error: 'not found' });
      res.json({ success: true });
    } else {
      await db.query('DELETE FROM food_records WHERE id = ? AND user_id = ?', [id, userId]);
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get('/api/users', async (req, res) => {
  try {
    if (db.listUsers) {
      const rows = await db.listUsers();
      res.json({ success: true, data: rows });
    } else {
      const [rows] = await db.query('SELECT id, username, nickname, created_at FROM users');
      res.json({ success: true, data: rows });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function isAdmin(username) {
  const admins = (process.env.ADMIN_USERS || '').split(',').map(s => s.trim()).filter(Boolean);
  return admins.includes(username);
}

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const requester = req.user.username;
    if (!isAdmin(requester)) return res.status(403).json({ success: false, error: 'admin only' });
    const id = parseInt(req.params.id, 10);
    if (db.listUsers && db.deleteUser) {
      const ok = await db.deleteUser(id);
      if (!ok) return res.status(404).json({ success: false, error: 'not found' });
      res.json({ success: true });
    } else {
    
      await db.query('DELETE FROM users WHERE id = ?', [id]);
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/reports/monthly', authMiddleware, async (req, res) => {
  try {
    const requester = req.user.username;
    const queryUserId = req.query.userId ? parseInt(req.query.userId, 10) : null;
    let userId = req.user.id;
    if (queryUserId) {
      if (!isAdmin(requester)) return res.status(403).json({ success: false, error: 'admin only to query other users' });
      userId = queryUserId;
    }

    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

   
    const [monthly] = await db.query('SELECT * FROM food_records WHERE user_id = ? AND record_date >= ? AND record_date < ?', [userId, start, end]);

    const daily = {};
    let totalCalories = 0;
    const freq = {};
    monthly.forEach(f => {
      const day = new Date(f.record_date).toISOString().split('T')[0];
      daily[day] = (daily[day] || 0) + (parseInt(f.calories || 0, 10) || 0);
      totalCalories += (parseInt(f.calories || 0, 10) || 0);
      const name = (f.food_name || '').split(':')[0];
      freq[name] = (freq[name] || 0) + 1;
    });

    const mostCommon = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>({name:x[0],count:x[1]}));

    res.json({ success: true, data: { totalRecords: monthly.length, totalCalories, daily, mostCommon } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


app.get('/api/metrics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query('SELECT * FROM health_metrics WHERE user_id = ? ORDER BY metric_date ASC', [userId]);
    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/metrics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { weight, body_fat, metric_date } = req.body;
    const [result] = await db.query('INSERT INTO health_metrics (user_id, weight, body_fat, metric_date) VALUES (?, ?, ?, ?)', [userId, weight, body_fat, metric_date || new Date()]);
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});


app.get('/api/recipes', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM recipes ORDER BY created_at DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Profile
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.id);
    if (db.findUserByUsername) {
      const users = await db.listUsers();
      const me = users.find(u => Number(u.id) === userId) || null;
      if (!me) return res.status(404).json({ success: false, error: 'user not found' });
      res.json({ success: true, data: { id: me.id, username: me.username, nickname: me.nickname } });
    } else {
      const [rows] = await db.query('SELECT id, username, nickname FROM users WHERE id = ?', [userId]); // 注意這裡 users 表是 id 不是 user_id (看您的 SQL 定義)
      if (!rows.length) {
         
         const [rows2] = await db.query('SELECT user_id as id, username, nickname FROM users WHERE user_id = ?', [userId]);
         if(!rows2.length) return res.status(404).json({ success: false, error: 'user not found' });
         res.json({ success: true, data: rows2[0] });
         return;
      }
      res.json({ success: true, data: rows[0] });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

async function runMigrationsIfNeeded() {
 
}

runMigrationsIfNeeded().then(() => {
  app.listen(PORT, () => {
    console.log(`server started: http://localhost:${PORT}`);
  });
});

app.get('/debug/db', (req, res) => {
  try {
    const keys = Object.keys(db).sort();
    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});