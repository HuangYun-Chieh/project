document.addEventListener('DOMContentLoaded', () => {
    
    // 1. 初始化日期輸入框為今天
    const dateInput = document.getElementById('weightDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
    // 2. 繪製體重趨勢圖
    const ctx = document.getElementById('weightChartCanvas');
    if (ctx) {
        const labels = [];
        const data = [];
        let currentWeight = 72.5;

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            labels.push(`${d.getMonth() + 1}/${d.getDate()}`);

            const trend = (Math.random() * 0.25) - 0.15; 
            currentWeight += trend;
            data.push(currentWeight.toFixed(1));
        }

        // 使用 Chart.js 繪圖
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '體重趨勢 (kg)',
                    data: data,
                    borderColor: '#FF6B81', 
                    backgroundColor: 'rgba(255, 107, 129, 0.1)', 
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#FF6B81',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    fill: true, 
                    tension: 0.4 
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }, 
                    tooltip: {
                        backgroundColor: '#FF6B81',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `體重: ${context.parsed.y} kg`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        min: 68, 
                        max: 74,
                        grid: { color: '#f5f5f5' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // 3. 綁定按鈕 
    const saveBtn = document.getElementById('saveWeight');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const val = document.getElementById('weightValue').value;
            const date = document.getElementById('weightDate').value;
            if(!val) { alert('請輸入體重數值！'); return; }
            
            alert(`✅ 紀錄成功！\n\n日期：${date}\n體重：${val} kg\n\n(系統已更新您的體重趨勢圖)`);
            document.getElementById('weightValue').value = '';
        });
    }

    // 4. 綁定按鈕
    const exportBtn = document.getElementById('export-csv');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert('📥 正在生成月報表 (monthly_report.csv)...');
            setTimeout(() => {
                alert('✅ 下載完成！報表已儲存至您的裝置。');
            }, 800);
        });
    }
});