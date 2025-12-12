function renderHealthReminderUI() {
    
    // 1. 確保主題樣式正確應用
    const theme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', theme);

    // 2. 注入 CSS 
    const style = document.createElement('style');
    style.innerHTML = `
        .reminder-card {
            background: #fff;
            border-radius: 15px;
            border: 3px solid #FFB6C1; /* 粉紅框框 */
            box-shadow: 0 5px 15px rgba(255, 182, 193, 0.2);
            padding: 30px;
            max-width: 500px;
            margin: 20px auto;
            font-family: 'Segoe UI', sans-serif;
            text-align: center;
        }
        .page-title { font-size: 1.8rem; color: #333; margin-bottom: 5px; font-weight: bold; }
        .page-desc { color: #888; margin-bottom: 30px; font-size: 0.9rem; }
        .setting-item {
            display: flex; align-items: center; background: #FFF5F7;
            padding: 15px; border-radius: 12px; margin-bottom: 15px;
            border: 1px solid #FFE0E6; transition: 0.3s;
        }
        .setting-item:hover { border-color: #FFB6C1; transform: translateY(-2px); }
        .icon-box {
            width: 50px; height: 50px; background: #fff; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 1.5rem; margin-right: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .setting-content { flex: 1; text-align: left; }
        .setting-label { font-weight: bold; color: #555; font-size: 1rem; }
        .setting-sub { font-size: 0.8rem; color: #999; }
        
        /* 這裡對應你原本的 input */
        .time-input {
            border: 2px solid #FFB6C1; border-radius: 8px; padding: 5px 10px;
            font-size: 1rem; color: #555; outline: none; background: #fff; cursor: pointer;
        }
        
        .btn-save {
            width: 100%; padding: 12px; border: none; border-radius: 8px;
            background: #FF6B81; color: white; font-weight: bold; cursor: pointer;
            margin-top: 10px; transition: 0.2s; font-size: 1rem;
            box-shadow: 0 4px 10px rgba(255, 107, 129, 0.3);
        }
        .btn-save:hover { background: #FF4757; }

        /* 假開關 */
        .toggle-switch { position: relative; width: 40px; height: 22px; margin-left: 10px; }
        .toggle-input { opacity: 0; width: 0; height: 0; }
        .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px; }
        .toggle-slider:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        .toggle-input:checked + .toggle-slider { background-color: #FF6B81; }
        .toggle-input:checked + .toggle-slider:before { transform: translateX(18px); }
    `;
    document.head.appendChild(style);

    // 3. 注入 HTML 
    let container = document.getElementById('main-content') || document.body;
    container.innerHTML = `
        <div class="reminder-card">
            <div class="page-title">⏰ 健康提醒</div>
            <div class="page-desc">設定提醒時間，讓我們幫助您保持健康的生活習慣。</div>

            <div class="setting-item">
                <div class="icon-box">💧</div>
                <div class="setting-content">
                    <div class="setting-label">飲水提醒</div>
                    <div class="setting-sub">每天定時提醒喝水</div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" class="toggle-input" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div style="margin-bottom: 20px; text-align: right;">
                <span style="font-size:0.9rem; color:#666; margin-right:5px;">設定時間：</span>
                <input type="time" id="water-reminder" class="time-input">
            </div>

            <div class="setting-item">
                <div class="icon-box">🍽️</div>
                <div class="setting-content">
                    <div class="setting-label">飲食紀錄</div>
                    <div class="setting-sub">提醒您記錄三餐</div>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" class="toggle-input" checked>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div style="margin-bottom: 20px; text-align: right;">
                <span style="font-size:0.9rem; color:#666; margin-right:5px;">設定時間：</span>
                <input type="time" id="meal-reminder" class="time-input">
            </div>

            <button id="save-reminder" class="btn-save">💾 儲存設定</button>

            <div style="margin-top:20px;">
                <a href="#" onclick="history.back()" style="color:#999; text-decoration:none; font-size:0.9rem;">← 返回上一頁</a>
            </div>
        </div>
    `;

    // 4. (你的邏輯) 載入上次儲存的時間 (如果有存的話)
    // 為了讓使用者體驗更好，我們加一點點代碼來「記住」上次選的時間
    const savedWater = localStorage.getItem('water_time_val');
    const savedMeal = localStorage.getItem('meal_time_val');
    if(savedWater) document.getElementById('water-reminder').value = savedWater;
    if(savedMeal) document.getElementById('meal-reminder').value = savedMeal;

    // 5. (你的邏輯) 綁定儲存按鈕事件
    document.getElementById('save-reminder').addEventListener('click', () => {
        const waterTime = document.getElementById('water-reminder').value;
        const mealTime = document.getElementById('meal-reminder').value;

        if (waterTime) {
            scheduleReminder(waterTime, '該喝水了！');
            localStorage.setItem('water_time_val', waterTime); // 順便存起來
        }
        if (mealTime) {
            scheduleReminder(mealTime, '該吃飯了！');
            localStorage.setItem('meal_time_val', mealTime); // 順便存起來
        }

        alert('提醒時間已設定！');
        
        const currentTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', currentTheme);
    });

    // 6. (你的邏輯) 這是你寫的計時器函式，完全保留
    function scheduleReminder(time, message) {
        const [hours, minutes] = time.split(':').map(Number);
        const now = new Date();
        const reminderTime = new Date();

        reminderTime.setHours(hours, minutes, 0, 0);

        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1); // 如果時間已過，設定為明天
        }

        const timeout = reminderTime - now;
        
        console.log(`已設定提醒：${message}，將在 ${timeout/1000} 秒後跳出`);
        
        setTimeout(() => alert(message), timeout);
    }
}

// 啟動頁面渲染
document.addEventListener('DOMContentLoaded', renderHealthReminderUI);