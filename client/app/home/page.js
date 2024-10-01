"use client";
import React, { useState } from 'react';
import Navbar from "../components/navbar";

const Home = () => {
  const [notification, setNotification] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const handleSendEmail = async () => {
    try {
      const response = await fetch('http://localhost:8080/send-email');
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error('Error:', error);
      alert('Error sending email: ' + error.message);
    }
  };

  const handleNotificationClick = async () => {
    try {
      const response = await fetch('http://localhost:8080/get-low-ingredients'); // Adjust this endpoint as necessary
      if (!response.ok) {
        throw new Error('Failed to fetch low ingredients');
      }
      const data = await response.json();

      // Create notification message
      let message = `Hi ${data.name},\n\nYou are low on:\n`;
      data.lowIngredients.forEach(ingredient => {
        message += `- ${ingredient.name}: you currently have ${ingredient.amount} units remaining\n`;
      });

      setNotification(message);
      setIsVisible(true);
    } catch (error) {
      console.error('Error fetching low ingredients:', error);
      setNotification('Error fetching low ingredients: ' + error.message);
      setIsVisible(true);
    }
  };

  return (
    <div>
      <Navbar/>
      <h1>User personalized home page</h1>
      <button onClick={handleSendEmail}>Send Email</button>
      <button onClick={handleNotificationClick}>Show Notification</button>

      {isVisible && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          zIndex: 1000
        }}>
          <pre>{notification}</pre>
          <button onClick={() => setIsVisible(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Home;
