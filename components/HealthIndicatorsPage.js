import React, { useState } from 'react';
import axios from 'axios';

const HealthIndicatorsPage = () => {
  const [formData, setFormData] = useState({
    user_id: '',
    weight: '',
    exercise_minutes: '',
    record_date: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put('http://localhost:3000/updateHealthIndicator', formData);
      alert('Health indicator updated successfully');
    } catch (error) {
      console.error('Error updating health indicator:', error);
    }
  };

  return (
    <div>
      <h2>Update Health Indicators</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="user_id" value={formData.user_id} onChange={handleChange} placeholder="User ID" />
        <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="Weight" />
        <input type="text" name="exercise_minutes" value={formData.exercise_minutes} onChange={handleChange} placeholder="Exercise Minutes" />
        <input type="date" name="record_date" value={formData.record_date} onChange={handleChange} />
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default HealthIndicatorsPage;
