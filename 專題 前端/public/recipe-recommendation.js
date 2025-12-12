document.getElementById('recommend-btn').addEventListener('click', () => {
  
  // ★★★ 100 道全方位美食資料庫 (Emoji 版) ★★★
  const recipes = [
      // --- 🇹🇼 台式早餐 (1-10) ---
      { name: '鮪魚蛋餅', description: '早餐店人氣王，富含蛋白質。', calories: 350, icon: "🌯" },
      { name: '豬排蛋吐司', description: '醃製入味的里肌豬排配上荷包蛋。', calories: 420, icon: "🥪" },
      { name: '燒餅油條', description: '傳統經典，酥脆油條與芝麻燒餅。', calories: 500, icon: "🥖" },
      { name: '鹹豆漿', description: '加入菜脯、蝦米、油條的鹹香滋味。', calories: 180, icon: "🥣" },
      { name: '蘿蔔糕加蛋', description: '煎得恰恰的蘿蔔糕，淋上醬油膏。', calories: 320, icon: "⬜" },
      { name: '鐵板麵', description: '黑胡椒口味，早餐店必點重口味。', calories: 450, icon: "🍝" },
      { name: '飯糰', description: '糯米包裹油條與酸菜，飽足感十足。', calories: 500, icon: "🍙" },
      { name: '蔥抓餅', description: '外酥內軟，層次豐富的口感。', calories: 400, icon: "🫓" },
      { name: '饅頭夾蛋', description: '簡單樸實的美味，健康蒸饅頭。', calories: 280, icon: "🥯" },
      { name: '米漿', description: '濃郁花生香氣，傳統好滋味。', calories: 200, icon: "🥤" },

      // --- 🍱 台式便當與正餐 (11-20) ---
      { name: '滷肉飯', description: '肥瘦適中的滷肉淋在白飯上。', calories: 450, icon: "🍚" },
      { name: '嘉義雞肉飯', description: '手撕雞肉絲搭配特製雞油與油蔥酥。', calories: 400, icon: "🥢" },
      { name: '炸排骨飯', description: '酥脆多汁的炸排骨，午餐最佳選擇。', calories: 750, icon: "🍖" },
      { name: '紅燒牛肉麵', description: '濃郁湯頭搭配軟嫩牛腱肉。', calories: 600, icon: "🍜" },
      { name: '雞腿便當', description: '整隻大雞腿，外皮酥脆肉質鮮嫩。', calories: 850, icon: "🍗" },
      { name: '水餃(10顆)', description: '皮薄餡多，咬下去湯汁四溢。', calories: 500, icon: "🥟" },
      { name: '咖哩飯', description: '充滿媽媽味道的台式家常咖哩。', calories: 650, icon: "🍛" },
      { name: '焢肉飯', description: '大塊三層肉滷得入口即化。', calories: 800, icon: "🥓" },
      { name: '排骨酥麵', description: '湯頭濃郁，排骨酥軟爛入味。', calories: 550, icon: "🍜" },
      { name: '肉燥乾麵', description: '簡單肉燥淋在麵條上，快速美味。', calories: 400, icon: "🍝" },

      // --- 🍳 家常熱炒 (21-30) ---
      { name: '番茄炒蛋', description: '酸甜開胃，營養均衡的家常菜。', calories: 220, icon: "🍅" },
      { name: '三杯雞', description: '麻油、醬油、米酒與九層塔香氣。', calories: 380, icon: "🍲" },
      { name: '炒高麗菜', description: '大火快炒保留蔬菜脆度。', calories: 100, icon: "🥬" },
      { name: '麻婆豆腐', description: '香辣下飯，滑嫩豆腐搭配肉末。', calories: 350, icon: "🥘" },
      { name: '玉米排骨湯', description: '湯頭甘甜，老少咸宜。', calories: 180, icon: "🌽" },
      { name: '蔥爆牛肉', description: '大蔥與牛肉大火快炒，香氣逼人。', calories: 300, icon: "🥩" },
      { name: '客家小炒', description: '魷魚、豆干與五花肉的鹹香組合。', calories: 350, icon: "🦑" },
      { name: '鳳梨蝦球', description: '酥脆蝦仁搭配美乃滋與鳳梨。', calories: 450, icon: "🍤" },
      { name: '菜脯蛋', description: '充滿古早味的厚實煎蛋。', calories: 200, icon: "🍳" },
      { name: '蛤蜊絲瓜', description: '清爽鮮甜，夏天消暑聖品。', calories: 120, icon: "🥒" },

      // --- 🌃 夜市小吃 (31-45) ---
      { name: '鹽酥雞', description: '宵夜首選，酥脆雞肉配上九層塔。', calories: 550, icon: "🥡" },
      { name: '蚵仔煎', description: '新鮮蚵仔搭配雞蛋與小白菜。', calories: 450, icon: "🦪" },
      { name: '大腸包小腸', description: '糯米腸夾香腸，搭配酸菜蒜頭。', calories: 500, icon: "🌭" },
      { name: '珍珠奶茶', description: 'Q彈珍珠搭配濃郁奶香，台灣代表。', calories: 450, icon: "🧋" },
      { name: '地瓜球', description: '外酥內軟，充滿地瓜香氣。', calories: 300, icon: "🍠" },
      { name: '彰化肉圓', description: 'Q彈外皮包裹鮮肉筍丁。', calories: 400, icon: "🍘" },
      { name: '臭豆腐', description: '外酥內嫩，搭配台式泡菜。', calories: 500, icon: "🧊" },
      { name: '章魚燒', description: '日式小吃台灣化，外皮酥脆。', calories: 350, icon: "🐙" },
      { name: '烤玉米', description: '塗滿特製沙茶醬，炭火燒烤。', calories: 300, icon: "🌽" },
      { name: '藥燉排骨', description: '中藥湯頭溫補暖身。', calories: 400, icon: "🥣" },
      { name: '胡椒餅', description: '炭烤餅皮包裹多汁蔥肉餡。', calories: 350, icon: "🫓" },
      { name: '刈包', description: '台式漢堡，滷肉配酸菜花生粉。', calories: 450, icon: "🌮" },
      { name: '潤餅', description: '薄餅皮包裹大量蔬菜與紅燒肉。', calories: 350, icon: "🌯" },
      { name: '豬血糕', description: '沾滿花生粉與香菜的傳統美味。', calories: 200, icon: "🍢" },
      { name: '木瓜牛奶', description: '新鮮木瓜與牛奶打製，香濃滑順。', calories: 250, icon: "🥤" },

      // --- 🥗 健康餐與輕食 (46-55) ---
      { name: '舒肥雞胸', description: '低溫烹調鎖住肉汁，健身首選。', calories: 150, icon: "🥗" },
      { name: '蒸地瓜', description: '優質澱粉，富含膳食纖維。', calories: 180, icon: "🍠" },
      { name: '水煮蛋(2顆)', description: '最簡單的優質蛋白質來源。', calories: 140, icon: "🥚" },
      { name: '無糖豆漿', description: '植物性蛋白，清爽無負擔。', calories: 100, icon: "🥛" },
      { name: '水果沙拉', description: '當季水果搭配無糖優格。', calories: 200, icon: "🥗" },
      { name: '健康餐盒', description: '紫米飯搭配水煮蔬菜與主食。', calories: 500, icon: "🍱" },
      { name: '燕麥粥', description: '富含纖維，熱熱吃暖胃又飽足。', calories: 250, icon: "🥣" },
      { name: '希臘優格', description: '濃郁口感，補充好菌與蛋白質。', calories: 150, icon: "🥛" },
      { name: '綜合堅果', description: '優質油脂來源，解饞小點心。', calories: 180, icon: "🥜" },
      { name: '香蕉', description: '快速補充能量，運動前後皆宜。', calories: 90, icon: "🍌" },

      // --- 🍔 西式與速食 (56-65) ---
      { name: '起司牛肉堡', description: '厚實牛肉排搭配融化起司。', calories: 650, icon: "🍔" },
      { name: '肉醬義大利麵', description: '酸甜番茄紅醬吸附Q彈麵條。', calories: 580, icon: "🍝" },
      { name: '披薩', description: '番茄、羅勒、起司的經典組合。', calories: 700, icon: "🍕" },
      { name: '凱薩沙拉', description: '蘿蔓生菜撒上麵包丁與起司粉。', calories: 350, icon: "🥗" },
      { name: '肋眼牛排', description: '五分熟軟嫩口感，富含鐵質。', calories: 600, icon: "🥩" },
      { name: '總匯三明治', description: '層層堆疊火腿、蛋、生菜。', calories: 400, icon: "🥪" },
      { name: '炸雞', description: '酥脆外皮鎖住肉汁，聚餐首選。', calories: 600, icon: "🍗" },
      { name: '薯條', description: '外酥內軟，讓人一口接一口。', calories: 450, icon: "🍟" },
      { name: '熱狗堡', description: '經典美式風味，搭配黃芥末。', calories: 450, icon: "🌭" },
      { name: '貝果', description: '紮實口感，塗上奶油乳酪最對味。', calories: 300, icon: "🥯" },

      // --- 🇯🇵🇰🇷 日韓料理 (66-75) ---
      { name: '握壽司', description: '新鮮生魚片搭配醋飯。', calories: 350, icon: "🍣" },
      { name: '豚骨拉麵', description: '濃郁大骨湯頭搭配軟嫩叉燒。', calories: 700, icon: "🍜" },
      { name: '日式牛丼', description: '牛肉片吸滿鹹甜醬汁淋在白飯上。', calories: 650, icon: "🍛" },
      { name: '石鍋拌飯', description: '多種蔬菜拌入辣醬，鍋巴焦香。', calories: 550, icon: "🥘" },
      { name: '泡菜豆腐鍋', description: '酸辣湯頭開胃暖身。', calories: 400, icon: "🍲" },
      { name: '大阪燒', description: '高麗菜煎至金黃，淋上美乃滋。', calories: 500, icon: "🥞" },
      { name: '味噌湯', description: '日本國民湯品，加入魚肉更營養。', calories: 120, icon: "🥣" },
      { name: '炸蝦天婦羅', description: '金黃酥脆麵衣包裹鮮蝦。', calories: 450, icon: "🍤" },
      { name: '韓式炸雞', description: '裹上甜辣醬汁的酥脆炸雞。', calories: 600, icon: "🍗" },
      { name: '關東煮', description: '清爽高湯煮蘿蔔與魚漿製品。', calories: 300, icon: "🍢" },

      // --- 🌏 異國風味 (76-85) ---
      { name: '泰式打拋豬', description: '辣炒豬絞肉，超級下飯。', calories: 500, icon: "🍛" },
      { name: '越南河粉', description: '清爽牛骨高湯配上滑順河粉。', calories: 400, icon: "🍜" },
      { name: '越南麵包', description: '酥脆法國麵包夾醃蘿蔔與肉片。', calories: 450, icon: "🥪" },
      { name: '綠咖哩雞', description: '椰奶香氣濃郁，微辣開胃。', calories: 550, icon: "🥘" },
      { name: '印度烤餅', description: '搭配濃郁咖哩醬汁食用。', calories: 300, icon: "🫓" },
      { name: '海南雞飯', description: '雞油悶飯搭配滑嫩白斬雞。', calories: 500, icon: "🍚" },
      { name: '港式燒臘', description: '蜜汁叉燒與脆皮燒肉雙拼。', calories: 600, icon: "🍖" },
      { name: '港式點心', description: '燒賣、蝦餃，精緻美味。', calories: 400, icon: "🥟" },
      { name: '墨西哥捲餅', description: '餅皮包裹豆泥、肉類與莎莎醬。', calories: 500, icon: "🌯" },
      { name: '西班牙燉飯', description: '番紅花香氣與豐富海鮮。', calories: 600, icon: "🥘" },

      // --- 🍰 甜點與飲料 (86-100) ---
      { name: '花生豆花', description: '綿密豆花搭配軟爛花生。', calories: 250, icon: "🍮" },
      { name: '葡式蛋塔', description: '酥皮搭配濃郁蛋奶餡。', calories: 300, icon: "🥧" },
      { name: '蜂蜜鬆餅', description: '外酥內軟，下午茶最佳選擇。', calories: 400, icon: "🥞" },
      { name: '美式黑咖啡', description: '無糖無奶，提神醒腦。', calories: 10, icon: "☕" },
      { name: '拿鐵', description: '濃縮咖啡加入香醇牛奶。', calories: 150, icon: "☕" },
      { name: '西瓜汁', description: '清涼消暑，純天然水果甜味。', calories: 120, icon: "🍹" },
      { name: '芒果冰', description: '夏天必吃，滿滿新鮮芒果。', calories: 450, icon: "🍧" },
      { name: '紅豆餅', description: '飽滿紅豆餡，外皮酥脆。', calories: 200, icon: "🍘" },
      { name: '雞蛋仔', description: '港式街頭點心，外脆內Q。', calories: 350, icon: "🧇" },
      { name: '鳳梨酥', description: '台灣伴手禮，酸甜鳳梨餡。', calories: 200, icon: "🍍" },
      { name: '檸檬塔', description: '酸V酸V的清爽甜點。', calories: 300, icon: "🍋" },
      { name: '提拉米蘇', description: '咖啡酒香與馬斯卡彭起司。', calories: 400, icon: "🍰" },
      { name: '巧克力蛋糕', description: '濃郁巧克力，甜點控最愛。', calories: 450, icon: "🎂" },
      { name: '燒仙草', description: '熱騰騰仙草湯配芋圓。', calories: 250, icon: "🍵" },
      { name: '白開水', description: '0熱量，人體最重要的水分來源！', calories: 0, icon: "💧" },
  ];

  // 2. 隨機挑選 3 道菜 (保證每次按都不一樣)
  const randomRecipes = recipes.sort(() => 0.5 - Math.random()).slice(0, 3);

  // 3. 渲染畫面 (使用 Emoji 取代 img 標籤)
  const recipeList = document.getElementById('recipe-list');
  
  recipeList.innerHTML = randomRecipes.map(recipe => `
    <div class="recipe" style="border: 1px solid #eee; border-radius: 10px; padding: 15px; margin-bottom: 15px; display: flex; align-items: center; gap: 15px; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
      
      <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 8px; font-size: 3rem; flex-shrink: 0;">
        ${recipe.icon}
      </div>
      
      <div style="flex: 1;">
        <h3 style="margin: 0 0 5px 0; color: #333; font-size: 1.1rem;">${recipe.name}</h3>
        
        <span style="background: #ffe0e0; color: #ff4757; padding: 2px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; margin-bottom: 5px; display: inline-block;">
          🔥 ${recipe.calories} kcal
        </span>
        
        <p style="margin: 5px 0 0 0; color: #666; font-size: 0.9rem; line-height: 1.4;">${recipe.description}</p>
      </div>
    </div>
  `).join('');
});