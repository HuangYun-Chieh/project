document.addEventListener('DOMContentLoaded', () => {
  const token = sessionStorage.getItem('authToken');
  const goalSelect = document.getElementById('goal-select');
  const generateBtn = document.getElementById('generate-plan');
  const saveBtn = document.getElementById('save-goals');
  const planResult = document.getElementById('plan-result');
  const dailyCaloriesInput = document.getElementById('dailyCalories');
  const targetWeightInput = document.getElementById('targetWeight');
  const mealDistributionInput = document.getElementById('mealDistribution');

  async function loadGoals() {
    if (!token) return;
    try {
      const resp = await fetch('http://localhost:3000/api/goals', { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await resp.json();
      if (resp.ok && data.data) {
        const g = data.data;
        if (g.goalType) goalSelect.value = g.goalType;
        if (g.dailyCalories) dailyCaloriesInput.value = g.dailyCalories;
        if (g.targetWeight) targetWeightInput.value = g.targetWeight;
        if (g.mealDistribution) mealDistributionInput.value = g.mealDistribution;
      }
    } catch (err) {
      console.warn('load goals failed', err);
    }
  }

  async function saveGoals(payload) {
    if (!token) return;
    try {
      payload.updated_at = new Date().toISOString();
      const resp = await fetch('http://localhost:3000/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (resp.ok) {
        return data.data;
      } else {
        console.warn('save goals failed', data);
      }
    } catch (err) { console.warn(err); }
    return null;
  }

  function renderSuggestion(goalType, payload) {
    let html = '';
    if (!payload) payload = {};
    if (goalType === '減脂') {
      html = `<h3>建議（減脂）</h3><p>建議每日熱量：以 TDEE - 500 kcal 為目標，均衡攝取蛋白質與蔬菜。</p>`;
    } else if (goalType === '增肌') {
      html = `<h3>建議（增肌）</h3><p>建議增加總熱量，強調訓練後蛋白質攝取與充足碳水化合物。</p>`;
    } else {
      html = `<h3>建議（維持）</h3><p>維持目前熱量，注意營養均衡與定期追蹤。</p>`;
    }
    if (payload.dailyCalories) html += `<p>您設定的每日熱量：${payload.dailyCalories} kcal</p>`;
    if (payload.targetWeight) html += `<p>目標體重：${payload.targetWeight} kg</p>`;
    if (payload.mealDistribution) html += `<p>餐別分配：${payload.mealDistribution}</p>`;
    planResult.innerHTML = html;
  }

  generateBtn.addEventListener('click', async () => {
    const goalType = goalSelect.value;
    const payload = {
      goalType,
      dailyCalories: parseInt(dailyCaloriesInput.value || 0, 10) || null,
      targetWeight: parseFloat(targetWeightInput.value || 0) || null,
      mealDistribution: mealDistributionInput.value || null
    };
    await saveGoals(payload);
    renderSuggestion(goalType, payload);
    alert('個人化目標已儲存並生成建議');
  });

  saveBtn.addEventListener('click', async () => {
    const payload = {
      goalType: goalSelect.value,
      dailyCalories: parseInt(dailyCaloriesInput.value || 0, 10) || null,
      targetWeight: parseFloat(targetWeightInput.value || 0) || null,
      mealDistribution: mealDistributionInput.value || null
    };
    await saveGoals(payload);
    alert('目標設定已儲存');
  });

  // 初始化
  loadGoals();
});
