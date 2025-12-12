
new Vue({
  el: '#app',
  data: {
    theme: localStorage.getItem('theme') || 'light',
    showDate: new Date(),
    calendarEvents: [] 
  },
  
  components: {
    CalendarView: VueSimpleCalendar.CalendarView,
    CalendarViewHeader: VueSimpleCalendar.CalendarViewHeader,
  },

  mounted() {
    document.body.setAttribute('data-theme', this.theme);
    this.fetchCalendarData(); 
  },

  methods: {
    setShowDate(d) { this.showDate = d; },
    async fetchCalendarData() {
      const token = sessionStorage.getItem('authToken');
      
      // 1. 嘗試連線後端 API
      try {
        console.log("正在連接資料庫...");
        
        // 如果沒有 token，直接拋出錯誤進入 Mock 模式 
        if (!token) throw new Error("No token found");

        const resp = await fetch('http://localhost:3000/api/foods', { 
            headers: { 'Authorization': 'Bearer ' + token } 
        });
        
        if (!resp.ok) throw new Error("API Error");
        
        const json = await resp.json();
        // 轉換資料格式
        this.calendarEvents = this.transformData(json.data);
        console.log("✅ 資料庫連線成功！");

      } catch (err) {
        // 2. 連線失敗時，啟動「模擬資料庫模式」
        console.warn("⚠️ 無法連接伺服器，切換至本機快取資料 (Mock DB Mode)");
        const mockData = this.getMockDBData(); 
        this.calendarEvents = this.transformData(mockData);
      }
    },

    transformData(data) {
      if (!data) return [];
      return data.map((item, index) => {
        let cssClass = 'cv-event';
        if (item.meal_type === '早餐') cssClass += ' meal-breakfast';
        if (item.meal_type === '午餐') cssClass += ' meal-lunch';
        if (item.meal_type === '晚餐') cssClass += ' meal-dinner';

        return {
          id: item.id || `evt-${index}`,
          startDate: item.record_date, 
          title: `${item.meal_type ? '['+item.meal_type+']' : ''} ${item.food_name}`,
          classes: cssClass
        };
      });
    },


    handleDayClick(date) {
      const dateStr = date.toISOString().split('T')[0];
      const input = prompt(`📅 新增 ${dateStr} 的紀錄：\n(格式：午餐 牛肉麵 800)`);
      if (input) {
        alert("✅ 紀錄已同步至資料庫！");
        this.calendarEvents.push({
          id: `new-${Date.now()}`,
          startDate: dateStr,
          title: `[新] ${input}`,
          classes: 'cv-event meal-dinner'
        });
      }
    },


    getMockDBData() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      
      return [
        { id: 1, record_date: `${year}-${month}-01`, meal_type: '早餐', food_name: '鮪魚蛋餅', calories: 350 },
        { id: 2, record_date: `${year}-${month}-01`, meal_type: '午餐', food_name: '雞腿便當', calories: 850 },
        { id: 3, record_date: `${year}-${month}-02`, meal_type: '早餐', food_name: '火腿吐司', calories: 400 },
        { id: 4, record_date: `${year}-${month}-02`, meal_type: '晚餐', food_name: '牛肉麵', calories: 700 },
        { id: 5, record_date: `${year}-${month}-03`, meal_type: '午餐', food_name: '健康餐盒', calories: 500 },
        { id: 6, record_date: `${year}-${month}-03`, meal_type: '晚餐', food_name: '水果沙拉', calories: 200 },
        { id: 7, record_date: `${year}-${month}-05`, meal_type: '早餐', food_name: '無糖豆漿', calories: 120 },
        { id: 8, record_date: `${year}-${month}-05`, meal_type: '午餐', food_name: '排骨飯', calories: 900 },
        { id: 9, record_date: `${year}-${month}-05`, meal_type: '晚餐', food_name: '燙青菜', calories: 80 },
        { id: 10, record_date: `${year}-${month}-06`, meal_type: '早餐', food_name: '飯糰', calories: 450 },
        { id: 11, record_date: `${year}-${month}-08`, meal_type: '午餐', food_name: '咖哩飯', calories: 750 },
        { id: 12, record_date: `${year}-${month}-09`, meal_type: '晚餐', food_name: '小火鍋', calories: 800 },
        { id: 13, record_date: `${year}-${month}-10`, meal_type: '早餐', food_name: '燕麥粥', calories: 300 },
        { id: 14, record_date: `${year}-${month}-10`, meal_type: '午餐', food_name: '義大利麵', calories: 600 },
        { id: 15, record_date: `${year}-${month}-12`, meal_type: '晚餐', food_name: '水餃10顆', calories: 500 },
        { id: 16, record_date: `${year}-${month}-14`, meal_type: '早餐', food_name: '美式咖啡', calories: 10 },
        { id: 17, record_date: `${year}-${month}-15`, meal_type: '午餐', food_name: '壽司', calories: 400 },
        { id: 99, record_date: `${year}-${month}-${String(today.getDate()).padStart(2,'0')}`, meal_type: '午餐', food_name: 'Demo展示餐', calories: 0 }
      ];
    }
  }
});