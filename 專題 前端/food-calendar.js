<<<<<<< HEAD
new Vue({
  el: '#app',
  data: {
    mealRecords: {} // 用於儲存每一天的餐點紀錄
  },
  async mounted() {
    // load existing foods for the user and populate mealRecords
    const token = sessionStorage.getItem('authToken');
    if (!token) return;
    try {
      const resp = await fetch('http://localhost:3000/api/foods', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await resp.json();
      if (resp.ok && data.data) {
        data.data.forEach(f => {
          const day = new Date(f.created_at || f.createdAt).toISOString().split('T')[0];
          const existing = this.mealRecords[day] || '早餐: , 午餐: , 晚餐: ';
          // append food_name to existing based on meal_type
          let newStr = existing;
          if (f.meal_type && f.meal_type !== '日曆') {
            // try to place into meal slot by meal_type
            if (f.meal_type === '早餐') newStr = replaceSlot(existing, '早餐', f.food_name);
            else if (f.meal_type === '午餐') newStr = replaceSlot(existing, '午餐', f.food_name);
            else if (f.meal_type === '晚餐') newStr = replaceSlot(existing, '晚餐', f.food_name);
            else newStr = existing + '\n' + f.food_name;
          } else if (f.meal_type === '日曆') {
            // attach to end
            newStr = existing + '\n' + f.food_name;
          }
          this.$set(this.mealRecords, day, newStr);
        });
      }
    } catch (err) { console.warn('load foods failed', err); }
  },
  methods: {
    handleDayClick(day) {
      const date = day.date.toISOString().split('T')[0];
      const existingMeals = this.mealRecords[date] || "早餐: , 午餐: , 晚餐: ";
      const meals = prompt(`查看或新增 ${date} 的餐點紀錄：`, existingMeals);
      if (meals) {
        const token = sessionStorage.getItem('authToken');
        // parse meals string into slots
        const slots = parseMealsString(meals);
        // if token, post separate records for each non-empty slot
        if (token) {
          Object.keys(slots).forEach(slot => {
            const text = slots[slot];
            if (text && text.trim()) {
              fetch('http://localhost:3000/api/foods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ food_name: text, calories: 0, meal_type: slot })
              }).then(r => { if (!r.ok) console.warn('post failed', r.status); }).catch(e => console.warn(e));
            }
          });
          alert(`已同步並儲存 ${date} 的餐點紀錄`);
        }
        this.$set(this.mealRecords, date, meals); // 更新本地餐點紀錄（local UI）
        alert(`已儲存 ${date} 的餐點紀錄：\n${meals}`);
      }
    }
  }
});

function parseMealsString(s) {
  // expected format: 早餐: xxx, 午餐: yyy, 晚餐: zzz
  const res = { 早餐: '', 午餐: '', 晚餐: '' };
  if (!s) return res;
  // split by comma or newline
  const parts = s.split(/[\n,]/).map(p => p.trim()).filter(Boolean);
  parts.forEach(p => {
    const m = p.match(/^(早餐|午餐|晚餐)[:：]\s*(.*)$/);
    if (m) res[m[1]] = m[2];
  });
  // fallback: if no labeled parts, put entire text into '日曆' as breakfast
  if (!Object.values(res).some(x => x)) res.早餐 = s;
  return res;
}

function replaceSlot(original, slot, value) {
  // original like '早餐: , 午餐: , 晚餐: '
  const parts = original.split(',').map(p => p.trim());
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith(slot + ':')) {
      parts[i] = `${slot}: ${value}`;
      return parts.join(', ');
    }
  }
  return original + '\n' + `${slot}: ${value}`;
}
=======
new Vue({
  el: '#app',
  data: {
    mealRecords: {} // 用於儲存每一天的餐點紀錄
  },
  async mounted() {
    // load existing foods for the user and populate mealRecords
    const token = sessionStorage.getItem('authToken');
    if (!token) return;
    try {
      const resp = await fetch('http://localhost:3000/api/foods', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await resp.json();
      if (resp.ok && data.data) {
        data.data.forEach(f => {
          const day = new Date(f.created_at || f.createdAt).toISOString().split('T')[0];
          const existing = this.mealRecords[day] || '早餐: , 午餐: , 晚餐: ';
          // append food_name to existing based on meal_type
          let newStr = existing;
          if (f.meal_type && f.meal_type !== '日曆') {
            // try to place into meal slot by meal_type
            if (f.meal_type === '早餐') newStr = replaceSlot(existing, '早餐', f.food_name);
            else if (f.meal_type === '午餐') newStr = replaceSlot(existing, '午餐', f.food_name);
            else if (f.meal_type === '晚餐') newStr = replaceSlot(existing, '晚餐', f.food_name);
            else newStr = existing + '\n' + f.food_name;
          } else if (f.meal_type === '日曆') {
            // attach to end
            newStr = existing + '\n' + f.food_name;
          }
          this.$set(this.mealRecords, day, newStr);
        });
      }
    } catch (err) { console.warn('load foods failed', err); }
  },
  methods: {
    handleDayClick(day) {
      const date = day.date.toISOString().split('T')[0];
      const existingMeals = this.mealRecords[date] || "早餐: , 午餐: , 晚餐: ";
      const meals = prompt(`查看或新增 ${date} 的餐點紀錄：`, existingMeals);
      if (meals) {
        const token = sessionStorage.getItem('authToken');
        // parse meals string into slots
        const slots = parseMealsString(meals);
        // if token, post separate records for each non-empty slot
        if (token) {
          Object.keys(slots).forEach(slot => {
            const text = slots[slot];
            if (text && text.trim()) {
              fetch('http://localhost:3000/api/foods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ food_name: text, calories: 0, meal_type: slot })
              }).then(r => { if (!r.ok) console.warn('post failed', r.status); }).catch(e => console.warn(e));
            }
          });
          alert(`已同步並儲存 ${date} 的餐點紀錄`);
        }
        this.$set(this.mealRecords, date, meals); // 更新本地餐點紀錄（local UI）
        alert(`已儲存 ${date} 的餐點紀錄：\n${meals}`);
      }
    }
  }
});

function parseMealsString(s) {
  // expected format: 早餐: xxx, 午餐: yyy, 晚餐: zzz
  const res = { 早餐: '', 午餐: '', 晚餐: '' };
  if (!s) return res;
  // split by comma or newline
  const parts = s.split(/[\n,]/).map(p => p.trim()).filter(Boolean);
  parts.forEach(p => {
    const m = p.match(/^(早餐|午餐|晚餐)[:：]\s*(.*)$/);
    if (m) res[m[1]] = m[2];
  });
  // fallback: if no labeled parts, put entire text into '日曆' as breakfast
  if (!Object.values(res).some(x => x)) res.早餐 = s;
  return res;
}

function replaceSlot(original, slot, value) {
  // original like '早餐: , 午餐: , 晚餐: '
  const parts = original.split(',').map(p => p.trim());
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith(slot + ':')) {
      parts[i] = `${slot}: ${value}`;
      return parts.join(', ');
    }
  }
  return original + '\n' + `${slot}: ${value}`;
}
>>>>>>> 5d447e9 (10/28完成)
