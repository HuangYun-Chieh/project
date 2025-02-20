import React, { useState } from 'react';

const AddFoodRecordForm = ({ onAdd }) => {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ foodName, calories });
    setFoodName('');
    setCalories('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Food Name"
        value={foodName}
        onChange={(e) => setFoodName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Calories"
        value={calories}
        onChange={(e) => setCalories(e.target.value)}
      />
      <button type="submit">Add Food</button>
    </form>
  );
};

export default AddFoodRecordForm;
