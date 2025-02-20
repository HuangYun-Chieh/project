import React from 'react';
import FoodRecordsPage from './FoodRecordsPage';
import AddFoodRecordForm from './AddFoodRecordForm';

const MainContent = () => {
  const handleAddFoodRecord = (newRecord) => {
    // 在這裡處理添加新記錄的邏輯，例如更新狀態或發送API請求
  };

  return (
    <main>
      <FoodRecordsPage />
      <AddFoodRecordForm onAdd={handleAddFoodRecord} />
    </main>
  );
};

export default MainContent;
