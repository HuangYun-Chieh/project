function renderDietPlanUI() {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('diet_token');
    
    const style = document.createElement('style');
    style.innerHTML = `
        .diet-card {
            background: #fff;
            border-radius: 15px;
            border: 3px solid #FFB6C1; 
            box-shadow: 0 5px 15px rgba(255, 182, 193, 0.2);
            padding: 30px;
            max-width: 600px;
            margin: 20px auto;
            font-family: 'Segoe UI', sans-serif;
            text-align: center;
        }
        .diet-title {
            font-size: 1.8rem;
            color: #333;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .diet-subtitle { color: #888; margin-bottom: 25px; font-size: 0.9rem; }

        .input-group { margin-bottom: 20px; text-align: left; }
        .input-label { display: block; color: #555; font-weight: bold; margin-bottom: 5px; }
        
        .input-control {
            width: 100%; padding: 12px;
            border: 2px solid #FFE0E6; 
            border-radius: 10px;
            font-size: 1rem;
            background: #FFFDFD;
            transition: 0.3s;
        }
        .input-control:focus { border-color: #FF6B81; outline: none; background: #fff; }

        .range-slider { -webkit-appearance: none; width: 100%; height: 8px; background: #FFE0E6; border-radius: 5px; outline: none; }
        .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
            background: #FF6B81; cursor: pointer; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }

        .btn-group { display: flex; gap: 10px; margin-top: 30px; }
        
        .btn-primary {
            flex: 1; padding: 12px; border: none; border-radius: 8px;
            background: #FF6B81; color: white; font-weight: bold; cursor: pointer;
            transition: 0.2s;
        }
        .btn-primary:hover { background: #FF4757; }
        
        .btn-secondary {
            flex: 1; padding: 12px; border: 2px solid #FFE0E6; border-radius: 8px;
            background: white; color: #FF6B81; font-weight: bold; cursor: pointer;
            transition: 0.2s;
        }
        .btn-secondary:hover { background: #FFF0F3; }

        #result-area {
            margin-top: 25px; padding: 20px; border-radius: 12px;
            border: 2px dashed #FFB6C1;
            background: #FFF5F7;
            display: none;
        }
    `;
    document.head.appendChild(style);

    let container = document.getElementById('main-content') || document.body; 
    container.innerHTML = `
        <div class="diet-card">
            <div class="diet-title">個性化飲食計畫</div>
            <div class="diet-subtitle">設定您的目標，剩下的交給我們。</div>

            <div class="input-group">
                <label class="input-label">🎯 您的目標</label>
                <select id="goal-select" class="input-control">
                    <option value="減脂">🔥 減脂 (Burn Fat)</option>
                    <option value="維持" selected>⚖️ 維持體態 (Maintain)</option>
                    <option value="增肌">💪 增肌 (Build Muscle)</option>
                </select>
            </div>

            <div class="input-group">
                <div style="display:flex; justify-content:space-between;">
                    <label class="input-label">⚖️ 目標體重 (kg)</label>
                    <span id="weight-val" style="color:#FF6B81; font-weight:bold;">50</span>
                </div>
                <input type="range" id="weight-slider" class="range-slider" min="30" max="150" value="50">
            </div>

            <div class="input-group">
                <label class="input-label">⚡ 每日目標熱量 (kcal)</label>
                <input type="number" id="calorie-input" class="input-control" value="1400">
            </div>

            <div class="btn-group">
                <button id="save-btn" class="btn-secondary">儲存設定</button>
                <button id="gen-btn" class="btn-primary">生成建議</button>
            </div>

            <div id="result-area">
                <h3 style="color:#333; margin:0 0 10px 0;" id="result-title">建議 (維持)</h3>
                <p id="result-text" style="color:#555; line-height:1.5;"></p>
                <div style="margin-top:10px; font-weight:bold; color:#FF6B81;">
                    建議每日攝取：<span id="res-cal">1400</span> kcal
                </div>
                <div style="margin-top:5px; font-size:0.9rem; color:#666;">
                    目標體重：<span id="res-weight">50</span> kg
                </div>
                <div style="margin-top:20px;">
                    <a href="#" onclick="history.back()" style="color:#999; text-decoration:none; font-size:0.9rem;">← 返回上一頁</a>
                </div>
            </div>
        </div>
    `;

    // 變數綁定
    const goalSelect = document.getElementById('goal-select');
    const wSlider = document.getElementById('weight-slider');
    const wVal = document.getElementById('weight-val');
    const calorieInput = document.getElementById('calorie-input');
    const resultArea = document.getElementById('result-area');

    // 體重滑桿連動
    wSlider.addEventListener('input', (e) => { wVal.innerText = e.target.value; });

    function getPayload() {
        return {
            goalType: goalSelect.value,
            dailyCalories: parseInt(calorieInput.value || 0, 10),
            targetWeight: parseFloat(wSlider.value || 0),
            mealDistribution: "30,40,30" 
        };
    }

    async function loadGoals() {
        if (!token) return;
        try {
            const resp = await fetch('http://localhost:3000/api/goals', { headers: { 'Authorization': 'Bearer ' + token } });
            const json = await resp.json();
            if (resp.ok && json.data) {
                const g = json.data;
                if (g.goalType) goalSelect.value = g.goalType;
                if (g.dailyCalories) calorieInput.value = g.dailyCalories;
                if (g.targetWeight) { wSlider.value = g.targetWeight; wVal.innerText = g.targetWeight; }
            }
        } catch (err) { console.warn('載入失敗 (Demo模式)', err); }
    }

    async function saveGoals(payload) {
        if (!token) return true;
        try {
            payload.updated_at = new Date().toISOString();
            const resp = await fetch('http://localhost:3000/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify(payload)
            });
            return resp.ok;
        } catch (err) { return true; }
    }

    function renderSuggestionVisual(payload) {
        const goal = payload.goalType;
        let text = "";
        if(goal === '減脂') text = "建議採取「熱量赤字」策略，多攝取高纖蔬菜與低脂蛋白，避免精緻澱粉。";
        else if(goal === '增肌') text = "建議進行「熱量盈餘」，增加碳水化合物與蛋白質攝取，搭配重量訓練。";
        else text = "維持目前熱量，注意營養均衡與定期追蹤。";

        document.getElementById('result-text').innerText = text;
        document.getElementById('res-cal').innerText = payload.dailyCalories;
        document.getElementById('res-weight').innerText = payload.targetWeight;
        document.getElementById('result-title').innerText = `建議 (${goal})`;
        
        resultArea.style.display = 'block';
    }

    document.getElementById('save-btn').addEventListener('click', async () => {
        await saveGoals(getPayload());
        alert('設定已儲存！');
    });

    document.getElementById('gen-btn').addEventListener('click', async () => {
        const payload = getPayload();
        await saveGoals(payload);
        renderSuggestionVisual(payload);
    });

    loadGoals();
}

document.addEventListener('DOMContentLoaded', renderDietPlanUI);