const fs = require('fs');
(async ()=>{
  const out = { steps: [] };
  try{
    const base = 'http://localhost:3000';
    const user = 'itest_' + Date.now();
    const password = 'Pass123!';
    // register
    try{
      const r = await fetch(base + '/api/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: user, password, nickname: 'ITest' }) });
      out.steps.push({ step: 'register', status: r.status, body: await r.text() });
    }catch(e){ out.steps.push({ step: 'register_error', error: e.message }); }

    // login
    let token = null;
    try{
      const r = await fetch(base + '/api/login', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ username: user, password }) });
      const body = await r.json();
      out.steps.push({ step: 'login', status: r.status, body });
      if (r.ok && body.token) token = body.token;
    }catch(e){ out.steps.push({ step: 'login_error', error: e.message }); }

    if (!token) {
      // try login with existing test user
      out.steps.push({ note: 'no token obtained, aborting remaining steps' });
      fs.writeFileSync('integration_result.json', JSON.stringify(out, null, 2));
      return;
    }

    // save goals
    try{
      const payload = { goalType: '減脂', dailyCalories: 1500, targetWeight: 65, mealDistribution: '早餐:30,午餐:40,晚餐:30' };
      const r = await fetch(base + '/api/goals', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify(payload) });
      out.steps.push({ step: 'post_goals', status: r.status, body: await r.json() });
    }catch(e){ out.steps.push({ step: 'post_goals_error', error: e.message }); }

    // get goals
    try{
      const r = await fetch(base + '/api/goals', { headers: {'Authorization':'Bearer '+token} });
      out.steps.push({ step: 'get_goals', status: r.status, body: await r.json() });
    }catch(e){ out.steps.push({ step: 'get_goals_error', error: e.message }); }

    // post breakfast/lunch/dinner
    try{
      const today = new Date().toISOString().split('T')[0];
      const entries = [
        { food_name: `早餐 ${today} - 蛋饅頭`, calories: 300, meal_type: '早餐' },
        { food_name: `午餐 ${today} - 雞肉飯`, calories: 700, meal_type: '午餐' },
        { food_name: `晚餐 ${today} - 青菜豆腐`, calories: 400, meal_type: '晚餐' }
      ];
      out.posted = [];
      for (const e of entries) {
        const r = await fetch(base + '/api/foods', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify(e) });
        out.posted.push({ status: r.status, body: await r.json() });
      }
    }catch(e){ out.steps.push({ step: 'post_foods_error', error: e.message }); }

    // get monthly report JSON
    try{
      const r = await fetch(base + '/api/reports/monthly', { headers: {'Authorization':'Bearer '+token} });
      const txt = await r.text();
      out.steps.push({ step: 'report_json', status: r.status, body: txt });
      if (r.ok) {
        try{ fs.writeFileSync('monthly_report.json', txt); }catch(e){}
      }
    }catch(e){ out.steps.push({ step: 'report_json_error', error: e.message }); }

    // get monthly report CSV
    try{
      const r = await fetch(base + '/api/reports/monthly?format=csv', { headers: {'Authorization':'Bearer '+token} });
      out.steps.push({ step: 'report_csv_status', status: r.status });
      if (r.ok) {
        const blob = await r.arrayBuffer();
        fs.writeFileSync('monthly_report.csv', Buffer.from(blob));
        out.steps.push({ step: 'report_csv_saved', file: 'monthly_report.csv' });
      } else {
        out.steps.push({ step: 'report_csv_failed', text: await r.text() });
      }
    }catch(e){ out.steps.push({ step: 'report_csv_error', error: e.message }); }

    // post a metric (weight)
    try{
      const r = await fetch(base + '/api/metrics', { method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+token}, body: JSON.stringify({ type: 'weight', value: 70.5, date: new Date().toISOString().split('T')[0] }) });
      out.steps.push({ step: 'post_metric', status: r.status, body: await r.json() });
    }catch(e){ out.steps.push({ step: 'post_metric_error', error: e.message }); }

    // get metrics
    // debug: fetch runtime db keys
    try{
      const r = await fetch(base + '/debug/db');
      out.debug = await r.json();
    }catch(e){ out.debug_error = e.message; }
    try{
      const r = await fetch(base + '/api/metrics?type=weight', { headers: {'Authorization':'Bearer '+token} });
      out.steps.push({ step: 'get_metrics', status: r.status, body: await r.json() });
    }catch(e){ out.steps.push({ step: 'get_metrics_error', error: e.message }); }

  }catch(e){ out.error = e.message; }
  fs.writeFileSync('integration_result.json', JSON.stringify(out, null, 2));
  console.log('done');
})();
