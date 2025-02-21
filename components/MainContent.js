import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodRecordsPage from './FoodRecordsPage';
import AddFoodRecordForm from './AddFoodRecordForm';

const MainContent = () => {
  const [foodRecords, setFoodRecords] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3000/food')
      .then(response => {
        setFoodRecords(response.data);
      })
      .catch(error => {
        console.error('Error fetching food records:', error);
      });
  }, []);

  const handleAddFoodRecord = (newRecord) => {
    // 在這裡處理添加新記錄的邏輯，例如更新狀態或發送API請求
  };

  return (
    <main>
      <h2>Food Records</h2>
      <ul>
        {foodRecords.map(record => (
          <li key={record.record_id}>
            {record.food_name} - {record.calories} calories
          </li>
        ))}
      </ul>
      <FoodRecordsPage />
      <AddFoodRecordForm onAdd={handleAddFoodRecord} />
    </main>
  );
};

export default MainContent;
