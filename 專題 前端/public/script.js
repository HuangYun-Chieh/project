// 主程式碼
// 解析 Google OAuth redirect 帶回的 token (#token=...)
(() => {
    try {
        const hash = window.location.hash;
        if (hash && hash.includes('token=')) {
            const m = hash.match(/token=([^&]+)/);
            if (m) {
                const token = decodeURIComponent(m[1]);
                sessionStorage.setItem('authToken', token);
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    } catch (e) { console.warn('parse token failed', e); }
})();

document.addEventListener("DOMContentLoaded", function () {
    // 1. 初始化主題
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);

    // 2. 抓取使用者資料 (如果有 token)
    (async function fetchProfile(){
        const token = sessionStorage.getItem('authToken');
        if (!token) return;
        try {
            const resp = await fetch('http://localhost:3000/api/me', { headers: { 'Authorization': 'Bearer ' + token } });
            const data = await resp.json();
            if (resp.ok && data.data) {
                sessionStorage.setItem('currentNickname', data.data.nickname || '');
                sessionStorage.setItem('currentUser', data.data.username || '');
                const h = document.getElementById('welcome-h2');
                if (h) h.textContent = `歡迎回來，${data.data.nickname || data.data.username}！`;
            }
        } catch (e) { console.warn('fetch profile failed', e); }
    })();

    // 3. 切換主題按鈕
    const toggleButton = document.getElementById("toggle-mode");
    if (toggleButton) {
        toggleButton.addEventListener("click", function () {
            const currentTheme = document.body.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            document.body.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
        });
    }
    const saveReminderBtn = document.getElementById('save-reminder');
    if (saveReminderBtn) {
        const waterInput = document.getElementById('water-reminder');
        const mealInput = document.getElementById('meal-reminder');

        // 載入上次儲存的時間
        const savedWater = localStorage.getItem('water_time_val');
        const savedMeal = localStorage.getItem('meal_time_val');
        if (savedWater && waterInput) waterInput.value = savedWater;
        if (savedMeal && mealInput) mealInput.value = savedMeal;

        // 綁定儲存按鈕
        saveReminderBtn.addEventListener('click', function() {
            const wTime = waterInput.value;
            const mTime = mealInput.value;

            if (wTime) {
                scheduleReminder(wTime, '該喝水囉！保持水噹噹！💧');
                localStorage.setItem('water_time_val', wTime);
            }
            if (mTime) {
                scheduleReminder(mTime, '吃飯時間到！記得紀錄熱量喔！🍱');
                localStorage.setItem('meal_time_val', mTime);
            }

            alert('✅ 設定已儲存！系統將會準時提醒您。');
        });
    }
    // -----------------------------------------------------------

    // 4. 登入表單
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const username = loginForm.querySelector('input[name="username"]').value.trim();
            const password = loginForm.querySelector('input[name="password"]').value.trim();

            try {
                const resp = await fetch('http://localhost:3000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await resp.json();
                if (resp.ok && data.token) {
                    sessionStorage.setItem('authToken', data.token);
                    sessionStorage.setItem('currentUser', username);
                    sessionStorage.setItem('currentNickname', data.nickname || '');
                    alert('登入成功！');
                    window.location.href = 'home.html';
                    return;
                }
            } catch (err) { console.warn('backend login failed', err); }

            // fallback local
            const storedUser = JSON.parse(localStorage.getItem(username));
            if (storedUser) {
                const hashedPassword = await hashPassword(password);
                if (storedUser.password === hashedPassword) {
                    alert("登入成功（本機）！");
                    sessionStorage.setItem("currentUser", username);
                    sessionStorage.setItem("currentNickname", storedUser.nickname);
                    window.location.href = "home.html";
                } else { alert("密碼錯誤！"); }
            } else { alert("帳號不存在！"); }
        });
    }
});

// --- 輔助函式區域 ---

function scheduleReminder(time, message) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();

    reminderTime.setHours(hours, minutes, 0, 0);

    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1); // 如果時間已過，設為明天
    }

    const timeout = reminderTime - now;
    console.log(`[系統] 提醒已設定: ${message} (將在 ${timeout/1000} 秒後觸發)`);
    setTimeout(() => alert(`🔔 溫馨提醒：\n${message}`), timeout);
}

// 密碼雜湊
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// 註冊功能
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = registerForm.querySelector('input[name="username"]').value;
        const password = registerForm.querySelector('input[name="password"]').value;
        const nickname = registerForm.querySelector('input[name="nickname"]').value;

        try {
            const resp = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, nickname })
            });
            const data = await resp.json();
            if (resp.ok && data.token) {
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('currentUser', username);
                sessionStorage.setItem('currentNickname', nickname || '');
                alert('註冊成功！已登入');
                window.location.href = 'home.html';
                return;
            } else {
                alert(data.error || '註冊失敗');
                return;
            }
        } catch (err) { console.warn('backend register failed', err); }

        if (localStorage.getItem(username)) {
            alert('帳號已存在！');
        } else {
            const hashedPassword = await hashPassword(password);
            const user = { password: hashedPassword, nickname };
            localStorage.setItem(username, JSON.stringify(user));
            alert('註冊成功（本機）！請登入');
            window.location.href = 'login.html';
        }
    });
}

// 登出功能
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
        sessionStorage.removeItem('currentUser');
        alert('已登出');
        window.location.href = 'index.html';
    });
}

// 飲食紀錄功能
const foodForm = document.getElementById('food-form');
const foodList = document.getElementById('food-list');
const currentUser = sessionStorage.getItem('currentUser');

if (foodForm && currentUser) {
    loadFoodList();
    foodForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const inputs = foodForm.querySelectorAll('input, select');
        const foodName = inputs[0].value;
        const calories = parseInt(inputs[1].value || '0', 10);
        const mealType = inputs[2].value;

        const token = sessionStorage.getItem('authToken');
        if (token) {
            try {
                const resp = await fetch('http://localhost:3000/api/foods', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({ food_name: foodName, calories, meal_type: mealType })
                });
                if (resp.ok) {
                    inputs[0].value = ''; inputs[1].value = ''; inputs[2].value = '';
                    loadFoodList();
                    return;
                }
            } catch (err) { console.warn('backend create food failed', err); }
        }

        const foodRecord = { foodName, calories, mealType, time: new Date().toLocaleString() };
        let records = JSON.parse(localStorage.getItem(currentUser + '_food')) || [];
        records.push(foodRecord);
        localStorage.setItem(currentUser + '_food', JSON.stringify(records));
        inputs[0].value = ''; inputs[1].value = ''; inputs[2].value = '';
        loadFoodList();
    });
}

function loadFoodList() {
    if (!foodList || !currentUser) return;
    foodList.innerHTML = '';
    const token = sessionStorage.getItem('authToken');
    if (token) {
        try {
            fetch('http://localhost:3000/api/foods', { headers: { 'Authorization': 'Bearer ' + token } })
                .then(r => r.json())
                .then(data => {
                    if (data && data.data) {
                        let totalCalories = 0;
                        data.data.forEach((record) => {
                            const li = document.createElement('li');
                            li.innerHTML = `${new Date(record.created_at).toLocaleString()} - 【${record.meal_type}】${record.food_name} (${record.calories} kcal) <button data-id="${record.id}" class="delete-btn">刪除</button>`;
                            foodList.appendChild(li);
                            totalCalories += parseInt(record.calories || 0);
                        });
                        const totalEl = document.getElementById('total-calories');
                        if (totalEl) totalEl.textContent = `今日總熱量：${totalCalories} kcal`;
                        
                        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', async (e) => {
                            const id = e.target.getAttribute('data-id');
                            const resp = await fetch('http://localhost:3000/api/foods/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
                            if (resp.ok) loadFoodList();
                        }));
                    }
                });
            return;
        } catch (err) { console.warn('fetch foods failed', err); }
    }

    const records = JSON.parse(localStorage.getItem(currentUser + '_food')) || [];
    let totalCalories = 0;
    records.forEach((record, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${record.time} - 【${record.mealType}】${record.foodName} (${record.calories} kcal) <button onclick="deleteRecord(${index})" class="delete-btn">刪除</button>`;
        foodList.appendChild(li);
        totalCalories += parseInt(record.calories);
    });
    const totalEl = document.getElementById('total-calories');
    if (totalEl) totalEl.textContent = `今日總熱量：${totalCalories} kcal`;
}

function deleteRecord(index) {
    let records = JSON.parse(localStorage.getItem(currentUser + '_food')) || [];
    records.splice(index, 1);
    localStorage.setItem(currentUser + '_food', JSON.stringify(records));
    loadFoodList();
}

// 主頁面歡迎訊息
if (document.body.contains(document.querySelector('.container h2'))) {
    const nickname = sessionStorage.getItem('currentNickname');
    if (nickname) {
        document.querySelector('.container h2').textContent = `歡迎回來，${nickname}！`;
    }
}

// ----------------------------------------------------
// 更新密碼 (Settings)
const updatePasswordForm = document.getElementById('update-password-form');
if (updatePasswordForm && currentUser) {
    updatePasswordForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const newPassword = updatePasswordForm.querySelector('input[name="new-password"]').value;
        const user = JSON.parse(localStorage.getItem(currentUser));
        if (!user) { alert('帳號不存在！'); return; }
        if (newPassword) {
            user.password = await hashPassword(newPassword);
            localStorage.setItem(currentUser, JSON.stringify(user));
            alert('密碼更新成功！');
            updatePasswordForm.reset();
        }
    });
}

// 更新暱稱 (Settings)
const updateNicknameForm = document.getElementById('update-nickname-form');
if (updateNicknameForm && currentUser) {
    updateNicknameForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const newNickname = updateNicknameForm.querySelector('input[name="new-nickname"]').value;
        const user = JSON.parse(localStorage.getItem(currentUser));
        if (!user) { alert('帳號不存在！'); return; }
        if (newNickname) {
            user.nickname = newNickname;
            sessionStorage.setItem('currentNickname', newNickname);
            localStorage.setItem(currentUser, JSON.stringify(user));
            alert('暱稱更新成功！');
            updateNicknameForm.reset();
        }
    });
}

// 刪除帳號 (Settings)
const deleteAccountBtn = document.getElementById('delete-account-btn');
if (deleteAccountBtn && currentUser) {
    deleteAccountBtn.addEventListener('click', function () {
        if (confirm('確定要刪除帳號嗎？此操作無法復原！')) {
            localStorage.removeItem(currentUser);
            sessionStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentNickname');
            alert('帳號已刪除！');
            window.location.href = 'register.html';
        }
    });
}