// 1. Vue 實例 
new Vue({
    el: '#app',
    data: {
        theme: localStorage.getItem('theme') || 'light'
    },
    methods: {
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', this.theme);
            document.body.setAttribute('data-theme', this.theme);
        }
    },
    mounted() {
        // 初始化主題
        document.body.setAttribute('data-theme', this.theme);
        initReminderLogic();
    }
});

// 2. 健康提醒功能的邏輯 
function initReminderLogic() {
    const waterInput = document.getElementById('water-reminder');
    const mealInput = document.getElementById('meal-reminder');
    const saveBtn = document.getElementById('save-reminder');

    // 載入上次儲存的時間
    const savedWater = localStorage.getItem('water_time_val');
    const savedMeal = localStorage.getItem('meal_time_val');
    
    if(savedWater && waterInput) waterInput.value = savedWater;
    if(savedMeal && mealInput) mealInput.value = savedMeal;

    // 儲存按鈕事件
    if(saveBtn) {
        saveBtn.addEventListener('click', () => {
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
}

// 3. 提醒計時器核心邏輯
function scheduleReminder(time, message) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const reminderTime = new Date();
    
    reminderTime.setHours(hours, minutes, 0, 0);

    // 如果時間已經過了，就設為明天
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }

    const timeout = reminderTime - now;
    
    // 開發者除錯訊息
    console.log(`[系統] 已設定提醒: "${message}"，將在 ${timeout/1000} 秒後觸發`);
    
    // 設定計時器
    setTimeout(() => alert(`🔔 溫馨提醒：\n${message}`), timeout);
}