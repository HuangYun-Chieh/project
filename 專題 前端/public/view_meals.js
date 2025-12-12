// view_meals.js - 查看紀錄頁面邏輯

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 初始化主題
    const savedTheme = localStorage.getItem("theme") || "light";
    document.body.setAttribute("data-theme", savedTheme);

    // 2. 載入資料
    fetchMealsData();
});

async function fetchMealsData() {
    const listContainer = document.getElementById('meal-list');
    const token = sessionStorage.getItem('authToken');

    try {
        // 嘗試連線後端
        if (!token) throw new Error("No token");
        
        const resp = await fetch('http://localhost:3000/api/foods', { 
            headers: { 'Authorization': 'Bearer ' + token } 
        });
        
        if (!resp.ok) throw new Error("API Error");
        
        const json = await resp.json();
        renderList(json.data); // 有後端資料就渲染後端資料

    } catch (err) {
        // 連線失敗，載入 Mock Data (跟日曆一樣的假資料)
        console.warn("⚠️ 載入失敗，切換至 Demo 模式");
        const mockData = getMockDBData();
        renderList(mockData);
    }
}

// ★★★ 渲染列表 (Render) ★★★
function renderList(data) {
    const listContainer = document.getElementById('meal-list');
    
    if (!data || data.length === 0) {
        listContainer.innerHTML = '<div class="empty-state">目前沒有紀錄 🍃</div>';
        return;
    }

    // 依照日期排序 (新的在上面)
    data.sort((a, b) => new Date(b.record_date) - new Date(a.record_date));

    listContainer.innerHTML = data.map(item => {
        // 解析日期
        const dateObj = new Date(item.record_date);
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        // 決定標籤顏色
        let tagClass = 'bg-dinner';
        if (item.meal_type === '早餐') tagClass = 'bg-breakfast';
        if (item.meal_type === '午餐') tagClass = 'bg-lunch';
        if (item.meal_type === '點心') tagClass = 'bg-snack';

        return `
            <div class="meal-card" id="card-${item.id}">
                <div class="date-box">
                    <div class="date-month">${month}月</div>
                    <div class="date-day">${day}</div>
                </div>
                <div class="meal-info">
                    <div class="meal-name">
                        <span class="meal-tag ${tagClass}">${item.meal_type}</span>
                        ${item.food_name}
                    </div>
                    <div class="meal-cal">
                        🔥 熱量: ${item.calories} kcal
                    </div>
                </div>
                <button class="btn-delete" onclick="deleteMockItem('${item.id}')" title="刪除">🗑️</button>
            </div>
        `;
    }).join('');
}

// 假裝刪除功能
window.deleteMockItem = function(id) {
    if(confirm("確定要刪除這筆紀錄嗎？(Demo)")) {
        const card = document.getElementById(`card-${id}`);
        if(card) {
            card.style.opacity = '0';
            card.style.transform = 'translateX(20px)';
            setTimeout(() => card.remove(), 300); // 動畫消失
        }
    }
};

// ★★★ 跟日曆一模一樣的假資料 (確保連動感) ★★★
function getMockDBData() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    
    return [
        { id: 1, record_date: `${y}-${m}-01`, meal_type: '早餐', food_name: '鮪魚蛋餅', calories: 350 },
        { id: 2, record_date: `${y}-${m}-01`, meal_type: '午餐', food_name: '雞腿便當', calories: 850 },
        { id: 3, record_date: `${y}-${m}-02`, meal_type: '早餐', food_name: '火腿吐司', calories: 400 },
        { id: 4, record_date: `${y}-${m}-02`, meal_type: '晚餐', food_name: '牛肉麵', calories: 700 },
        { id: 5, record_date: `${y}-${m}-03`, meal_type: '午餐', food_name: '健康餐盒', calories: 500 },
        { id: 6, record_date: `${y}-${m}-03`, meal_type: '晚餐', food_name: '水果沙拉', calories: 200 },
        { id: 7, record_date: `${y}-${m}-05`, meal_type: '早餐', food_name: '無糖豆漿', calories: 120 },
        { id: 8, record_date: `${y}-${m}-05`, meal_type: '午餐', food_name: '排骨飯', calories: 900 },
        { id: 9, record_date: `${y}-${m}-05`, meal_type: '晚餐', food_name: '燙青菜', calories: 80 },
        { id: 10, record_date: `${y}-${m}-06`, meal_type: '早餐', food_name: '飯糰', calories: 450 },
        { id: 11, record_date: `${y}-${m}-08`, meal_type: '午餐', food_name: '咖哩飯', calories: 750 },
        { id: 12, record_date: `${y}-${m}-09`, meal_type: '晚餐', food_name: '小火鍋', calories: 800 },
        { id: 13, record_date: `${y}-${m}-10`, meal_type: '早餐', food_name: '燕麥粥', calories: 300 },
        { id: 14, record_date: `${y}-${m}-10`, meal_type: '午餐', food_name: '義大利麵', calories: 600 },
        { id: 15, record_date: `${y}-${m}-12`, meal_type: '晚餐', food_name: '水餃10顆', calories: 500 },
        { id: 16, record_date: `${y}-${m}-14`, meal_type: '早餐', food_name: '美式咖啡', calories: 10 },
        { id: 17, record_date: `${y}-${m}-15`, meal_type: '午餐', food_name: '壽司', calories: 400 },
        { id: 18, record_date: `${y}-${m}-18`, meal_type: '晚餐', food_name: '鹹酥雞', calories: 600 },
        { id: 19, record_date: `${y}-${m}-20`, meal_type: '早餐', food_name: '燒餅油條', calories: 500 },
        { id: 20, record_date: `${y}-${m}-22`, meal_type: '午餐', food_name: '麥當勞', calories: 900 },
        // 新增點心
        { id: 21, record_date: `${y}-${m}-23`, meal_type: '點心', food_name: '珍珠奶茶', calories: 450 },
        { id: 22, record_date: `${y}-${m}-24`, meal_type: '點心', food_name: '雞蛋糕', calories: 300 },
        
        // 今天的紀錄 (假裝今天也有吃)
        { id: 99, record_date: `${y}-${m}-${String(today.getDate()).padStart(2,'0')}`, meal_type: '午餐', food_name: 'Demo展示餐', calories: 0 }
    ];
}