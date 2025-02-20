import React, { useEffect, useState } from 'react';
import axios from 'axios';

const FoodRecordsPage = () => {
  const [foodRecords, setFoodRecords] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFoodRecords = async () => {
      try {
        const response = await axios.get('http://localhost:3000/foodRecords');
        setFoodRecords(response.data);
      } catch (error) {
        console.error('Error fetching food records:', error);
        setError('Failed to fetch food records');
      }
    };

    fetchFoodRecords();
  }, []);

  return (
    <div>
      <h2>Food Records</h2>
      {error && <p>{error}</p>}
      {foodRecords.length === 0 ? (
        <p>Loading or no food records found.</p>
      ) : (
        <ul>
          {foodRecords.map(record => (
            <li key={record.record_id}>{record.food_name} - {record.calories} calories</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FoodRecordsPage;
