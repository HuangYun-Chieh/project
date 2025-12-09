require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // 1. 把它移到最上面！
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// 2. 正確宣告 frontendPath 變數
// 往上跳兩層 (../../) 去找 "專題 前端" 資料夾
const frontendPath = path.join(__dirname, '../../專題 前端');

console.log('前端網頁路徑設為:', frontendPath); // 3. 這樣印出來才不會報錯

// 4. 告訴伺服器去那個路徑找檔案
app.use(express.static(frontendPath));

const db = require('./db');
console.log('db module keys at require time ->', Object.keys(db).sort());

if (db && db.init && typeof db.init === 'function') {
  db.init().catch(err => console.error('DB init error', err));
}

// Simple file fallback helpers (operate on data/db.json) used only if db helpers missing
const fs = require('fs');
const path = require('path');
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
    // profile.id, profile.displayName, profile.emails
    const email = profile.emails && profile.emails[0] && profile.emails[0].value;
    const username = email || `google_${profile.id}`;
    // find or create user
    if (db.findUserByUsername) {
      let user = await db.findUserByUsername(username);
      if (!user) {
        user = await db.createUser(username, 'google_oauth', profile.displayName || null);
      }
      return done(null, user);
    }
    // fallback: cannot create user in SQL path here
    return done(null, { id: profile.id, username });
  } catch (err) {
    return done(err);
  }
}));

// Auth routes for Google
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  // issue JWT and redirect to frontend with token
  const user = req.user;
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  // redirect back to front-end app with token as fragment
  const redirectTo = process.env.FRONTEND_URL || 'http://localhost:5500/home.html';
  res.redirect(`${redirectTo}#token=${token}`);
});

app.get('/', (req, res) => {
  res.redirect('/home.html'); 
});

app.get('/test-db', async (req, res) => {
  try {
    // simple test depending on db implementation
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

// --- Auth: register / login (bcrypt + jwt)
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, error: 'username and password required' });

    // check exists
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

// middleware: verify token
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

// --- Food CRUD (protected)
app.get('/api/foods', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    if (db.listFoodsByUser) {
      const rows = await db.listFoodsByUser(userId);
      res.json({ success: true, data: rows });
    } else {
      const [rows] = await db.query('SELECT id, food_name, calories, meal_type, created_at FROM foods WHERE user_id = ? ORDER BY created_at DESC', [userId]);
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
      const [result] = await db.query('INSERT INTO foods (user_id, food_name, calories, meal_type) VALUES (?, ?, ?, ?)', [userId, food_name, calories || 0, meal_type || '其他']);
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
      await db.query('UPDATE foods SET food_name = ?, calories = ?, meal_type = ? WHERE id = ? AND user_id = ?', [food_name, calories || 0, meal_type || '其他', id, userId]);
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
      await db.query('DELETE FROM foods WHERE id = ? AND user_id = ?', [id, userId]);
      res.json({ success: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Admin / misc
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

// simple admin checker using ADMIN_USERS env (comma separated usernames)
function isAdmin(username) {
  const admins = (process.env.ADMIN_USERS || '').split(',').map(s => s.trim()).filter(Boolean);
  return admins.includes(username);
}

// DELETE user (admin only)
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const requester = req.user.username;
    if (!isAdmin(requester)) return res.status(403).json({ success: false, error: 'admin only' });
    const id = parseInt(req.params.id, 10);
    if (db.listUsers && db.deleteUser) {
      const ok = await db.deleteUser(id);
      if (!ok) return res.status(404).json({ success: false, error: 'not found' });
      res.json({ success: true });
    } else if (db.listUsers && db.createUser) {
      // lowdb fallback: remove from users and related foods/goals
      await db.init();
  const before = db.data.users.length;
  db.data.users = db.data.users.filter(u => Number(u.id) !== id);
  db.data.foods = db.data.foods.filter(f => Number(f.user_id) !== id);
  db.data.goals = db.data.goals.filter(g => Number(g.user_id) !== id);
      await db.write();
      const changed = db.data.users.length !== before;
      if (!changed) return res.status(404).json({ success: false, error: 'not found' });
      res.json({ success: true });
    } else {
      res.status(501).json({ success: false, error: 'delete not supported on this DB' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET monthly report for the authenticated user (or admin for any user via ?userId=)
app.get('/api/reports/monthly', authMiddleware, async (req, res) => {
  try {
    const requester = req.user.username;
  const queryUserId = req.query.userId ? parseInt(req.query.userId, 10) : null;
    let userId = req.user.id;
    if (queryUserId) {
      if (!isAdmin(requester)) return res.status(403).json({ success: false, error: 'admin only to query other users' });
      userId = queryUserId;
    }

    // compute for current month
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    if (db.listFoodsByUser) {
      const foods = await db.listFoodsByUser(userId);
      const monthly = foods.filter(f => {
        const d = new Date(f.created_at || f.createdAt || Date.now());
        return d >= start && d < end;
      });

      // daily totals
      const daily = {};
      let totalCalories = 0;
      const freq = {};
      monthly.forEach(f => {
        const day = new Date(f.created_at || f.createdAt).toISOString().split('T')[0];
        daily[day] = (daily[day] || 0) + (parseInt(f.calories || 0, 10) || 0);
        totalCalories += (parseInt(f.calories || 0, 10) || 0);
        const name = (f.food_name || '').split(':')[0];
        freq[name] = (freq[name] || 0) + 1;
      });

      const mostCommon = Object.entries(freq).sort((a,b)=>b[1]-a[1]).slice(0,5).map(x=>({name:x[0],count:x[1]}));

      // build entries array for CSV or detailed output
      const entries = Object.keys(daily).sort().map(d => {
        const items = monthly.filter(f => new Date(f.created_at || f.createdAt).toISOString().split('T')[0] === d).map(f => f.food_name || '');
        return { date: d, calories: daily[d], items };
      });

      // support CSV export
      if (req.query.format === 'csv') {
        const header = 'date,calories,items\n';
        const rows = entries.map(e => `${e.date},${e.calories},"${(e.items||[]).join('; ')}"`).join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="monthly-report-${Date.now()}.csv"`);
        return res.send(header + rows);
      }

      res.json({ success: true, data: { totalRecords: monthly.length, totalCalories, daily, mostCommon } });
    } else {
      res.status(501).json({ success: false, error: 'reports not supported in this DB' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Goals: personalized plan storage (protected)
app.get('/api/goals', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const uid = Number(userId);
    // prefer helper if available
    if (db.getGoalsByUser) {
      const goals = await db.getGoalsByUser(uid);
      console.log('GET /api/goals via db.getGoalsByUser for user', uid);
      return res.json({ success: true, data: goals });
    }

    // fallback: try to read from lowdb data directly or file fallback
    if (db && db.init) {
      await db.init();
      if (db.data) {
        const goals = (db.data.goals || []).find(g => Number(g.user_id) === uid) || null;
        console.log('GET /api/goals via db.data for user', uid);
        return res.json({ success: true, data: goals });
      }
    }
    // file fallback
    const fb = readFallback();
    if (fb && fb.goals) {
      const g = (fb.goals || []).find(x => Number(x.user_id) === uid) || null;
      console.log('GET /api/goals via file fallback for user', uid);
      return res.json({ success: true, data: g });
    }
      // write debug info to file to help diagnose missing helpers
      try {
        const fs = require('fs');
        const info = { ts: new Date().toISOString(), hasUpsert: !!(db && db.upsertGoals), hasGet: !!(db && db.getGoalsByUser), keys: Object.keys(db || {}), dataKeys: db && db.data ? Object.keys(db.data) : null };
        fs.writeFileSync('goals_debug.log', JSON.stringify(info, null, 2));
      } catch (e) { console.warn('could not write goals_debug.log', e && e.message); }

      return res.status(501).json({ success: false, error: 'goals not supported in current DB backend' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/goals', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const uid = Number(userId);
    const payload = req.body || {};
    // expected fields: dailyCalories, targetWeight, mealDistribution, goalType
    if (db.upsertGoals) {
      const saved = await db.upsertGoals(uid, payload);
      console.log('POST /api/goals via db.upsertGoals for user', uid);
      return res.json({ success: true, data: saved });
    }

    // fallback: write directly into lowdb
    if (db && db.init) {
      await db.init();
      if (db.data) {
        let g = (db.data.goals || []).find(x => Number(x.user_id) === uid);
        if (!g) {
          const id = db.data.meta.nextGoalId++;
          g = { id, user_id: uid, ...payload, updated_at: new Date().toISOString() };
          db.data.goals = db.data.goals || [];
          db.data.goals.push(g);
        } else {
          Object.assign(g, payload);
          g.updated_at = new Date().toISOString();
        }
        await db.write();
        console.log('POST /api/goals via db.data for user', uid);
        return res.json({ success: true, data: g });
      }
    }
    // file fallback write
    const fb2 = readFallback() || { users:[], foods:[], goals:[], metrics:[], meta: { nextUserId:1, nextFoodId:1, nextGoalId:1, nextMetricId:1 } };
    fb2.goals = fb2.goals || [];
    let g2 = fb2.goals.find(x => Number(x.user_id) === uid);
    if (!g2) {
      const id = fb2.meta && fb2.meta.nextGoalId ? fb2.meta.nextGoalId++ : (fb2.goals.length + 1);
      g2 = { id, user_id: uid, ...payload, updated_at: new Date().toISOString() };
      fb2.goals.push(g2);
    } else {
      Object.assign(g2, payload);
      g2.updated_at = new Date().toISOString();
    }
  writeFallback(fb2);
  console.log('POST /api/goals via file fallback for user', uid);
  return res.json({ success: true, data: g2 });

    return res.status(501).json({ success: false, error: 'goals not supported in current DB backend' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- Metrics: simple health metrics like weight (protected)
app.get('/api/metrics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const type = req.query.type || null;
    if (db.listMetricsByUser) {
      const rows = await db.listMetricsByUser(userId, type);
      return res.json({ success: true, data: rows });
    }
    if (db && db.init) {
      await db.init();
      if (db.data) {
        const rows = (db.data.metrics || []).filter(m => m.user_id === userId && (!type || m.type === type)).sort((a,b) => new Date(a.date) - new Date(b.date));
        return res.json({ success: true, data: rows });
      }
    }
    // file fallback read
    const fbM = readFallback();
    if (fbM && fbM.metrics) {
      const rows = (fbM.metrics || []).filter(m => m.user_id === userId && (!type || m.type === type)).sort((a,b) => new Date(a.date) - new Date(b.date));
      return res.json({ success: true, data: rows });
    }
    return res.status(501).json({ success: false, error: 'metrics not supported in current DB' });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.post('/api/metrics', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, value, date } = req.body || {};
    if (db.createMetric) {
      const rec = await db.createMetric(userId, type || 'weight', value, date);
      return res.json({ success: true, data: rec });
    }
    if (db && db.init) {
      await db.init();
      if (db.data) {
        db.data.metrics = db.data.metrics || [];
        const id = db.data.meta.nextMetricId++;
        const rec = { id, user_id: userId, type: type || 'weight', value, date: date || new Date().toISOString(), created_at: new Date().toISOString() };
        db.data.metrics.push(rec);
        await db.write();
        return res.json({ success: true, data: rec });
      }
    }
    // file fallback write
    const fbW = readFallback() || { users:[], foods:[], goals:[], metrics:[], meta: { nextUserId:1, nextFoodId:1, nextGoalId:1, nextMetricId:1 } };
    fbW.metrics = fbW.metrics || [];
    const id = fbW.meta && fbW.meta.nextMetricId ? fbW.meta.nextMetricId++ : (fbW.metrics.length + 1);
    const rec = { id, user_id: userId, type: type || 'weight', value, date: date || new Date().toISOString(), created_at: new Date().toISOString() };
    fbW.metrics.push(rec);
    writeFallback(fbW);
    return res.json({ success: true, data: rec });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

// --- Profile
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const userId = Number(req.user.id);
    if (db.findUserByUsername) {
      // db implementation stores users with id and username
      const users = await db.listUsers();
      const me = users.find(u => Number(u.id) === userId) || null;
      if (!me) return res.status(404).json({ success: false, error: 'user not found' });
      res.json({ success: true, data: { id: me.id, username: me.username, nickname: me.nickname } });
    } else {
      const [rows] = await db.query('SELECT id, username, nickname FROM users WHERE id = ?', [userId]);
      if (!rows.length) return res.status(404).json({ success: false, error: 'user not found' });
      res.json({ success: true, data: rows[0] });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = process.env.PORT || 3000;

async function runMigrationsIfNeeded() {
  if (process.env.USE_SQLITE && process.env.USE_SQLITE.toLowerCase() === 'yes') {
    const fs = require('fs');
    const path = require('path');
    const migPath = path.join(__dirname, 'migrations', 'init.sqlite.sql');
    if (fs.existsSync(migPath) && db.exec) {
      const sql = fs.readFileSync(migPath, 'utf8');
      try {
        db.exec(sql);
        console.log('SQLite migration executed');
      } catch (err) {
        console.warn('SQLite migration failed:', err.message);
      }
    }
  }
}

runMigrationsIfNeeded().then(() => {
  app.listen(PORT, () => {
    console.log(`server started: http://localhost:${PORT}`);
  });
});

// DEBUG: report which helpers the db module exposes
app.get('/debug/db', (req, res) => {
  try {
    const keys = Object.keys(db).sort();
    res.json({ success: true, keys });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
