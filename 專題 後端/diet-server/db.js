const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

// ensure data dir
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

// allow overriding path via env
const file = path.resolve(process.env.SQLITE_FILE || path.join(dbDir, 'db.json'));
const adapter = new JSONFile(file);

// Provide default data to satisfy lowdb v6 requirement
const defaultData = { users: [], foods: [], goals: [], metrics: [], meta: { nextUserId: 1, nextFoodId: 1, nextGoalId: 1, nextMetricId: 1 } };
const db = new Low(adapter, defaultData);

// initialize
async function init() {
  await db.read();
  db.data ||= defaultData;
  await db.write();
}

// users helpers
async function createUser(username, password, nickname) {
  await init();
  const id = db.data.meta.nextUserId++;
  const user = { id, username, password, nickname: nickname || null, created_at: new Date().toISOString() };
  db.data.users.push(user);
  await db.write();
  return user;
}

async function findUserByUsername(username) {
  await init();
  return db.data.users.find(u => u.username === username) || null;
}

async function listUsers() {
  await init();
  return db.data.users.map(u => ({ id: u.id, username: u.username, nickname: u.nickname, created_at: u.created_at }));
}

// goals helpers
async function getGoalsByUser(userId) {
  await init();
  const uid = Number(userId);
  return db.data.goals.find(g => Number(g.user_id) === uid) || null;
}

async function upsertGoals(userId, payload) {
  await init();
  const uid = Number(userId);
  let g = db.data.goals.find(x => Number(x.user_id) === uid);
  if (!g) {
    const id = db.data.meta.nextGoalId++;
    g = { id, user_id: uid, ...payload, updated_at: new Date().toISOString() };
    db.data.goals.push(g);
  } else {
    Object.assign(g, payload);
    g.updated_at = new Date().toISOString();
  }
  await db.write();
  return g;
}

// foods helpers
async function listFoodsByUser(userId) {
  await init();
  const uid = Number(userId);
  return db.data.foods.filter(f => Number(f.user_id) === uid).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
}

async function createFood(userId, food_name, calories, meal_type) {
  await init();
  const id = db.data.meta.nextFoodId++;
  const rec = { id, user_id: Number(userId), food_name, calories: calories || 0, meal_type: meal_type || '其他', created_at: new Date().toISOString() };
  db.data.foods.push(rec);
  await db.write();
  return rec;
}

async function updateFood(id, userId, fields) {
  await init();
  const uid = Number(userId);
  const idx = db.data.foods.findIndex(f => f.id === id && Number(f.user_id) === uid);
  if (idx === -1) return false;
  db.data.foods[idx] = { ...db.data.foods[idx], ...fields };
  await db.write();
  return true;
}

async function deleteFood(id, userId) {
  await init();
  const uid = Number(userId);
  const before = db.data.foods.length;
  db.data.foods = db.data.foods.filter(f => !(f.id === id && Number(f.user_id) === uid));
  const changed = db.data.foods.length !== before;
  if (changed) await db.write();
  return changed;
}

// metrics helpers (simple time-series like weight)
async function listMetricsByUser(userId, type) {
  await init();
  const uid = Number(userId);
  return db.data.metrics.filter(m => Number(m.user_id) === uid && (!type || m.type === type)).sort((a,b) => new Date(a.date) - new Date(b.date));
}

async function createMetric(userId, type, value, date) {
  await init();
  const id = db.data.meta.nextMetricId++;
  const rec = { id, user_id: Number(userId), type: type || 'weight', value: value, date: date || new Date().toISOString(), created_at: new Date().toISOString() };
  db.data.metrics.push(rec);
  await db.write();
  return rec;
}

module.exports = {
  init,
  createUser,
  findUserByUsername,
  listUsers,
  listFoodsByUser,
  createFood,
  updateFood,
  deleteFood,
  // goals
  getGoalsByUser,
  upsertGoals,
  // metrics
  listMetricsByUser,
  createMetric,
  _internal: { file }
};
