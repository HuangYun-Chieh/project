
document.addEventListener('DOMContentLoaded', () => {
  const theme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', theme); // 確保主題樣式正確應用
});

document.getElementById('save-reminder').addEventListener('click', () => {
  const waterTime = document.getElementById('water-reminder').value;
  const mealTime = document.getElementById('meal-reminder').value;

  if (waterTime) {
    scheduleReminder(waterTime, '該喝水了！');
  }
  if (mealTime) {
    scheduleReminder(mealTime, '該吃飯了！');
  }

  alert('提醒時間已設定！');
  const theme = localStorage.getItem('theme') || 'light';
  document.body.setAttribute('data-theme', theme); // 強制更新主題屬性
});

function scheduleReminder(time, message) {
  const [hours, minutes] = time.split(':').map(Number);
  const now = new Date();
  const reminderTime = new Date();

  reminderTime.setHours(hours, minutes, 0, 0);

  if (reminderTime <= now) {
    reminderTime.setDate(reminderTime.getDate() + 1); // 如果時間已過，設定為明天
  }

  const timeout = reminderTime - now;
  setTimeout(() => alert(message), timeout);
}