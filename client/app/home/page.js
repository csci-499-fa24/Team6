// const Home = () => {
//   return (
//     <div>
//       <h1>User personalized home page</h1>
//       <button> Send Email</button>
//     </div>
//   );
// };

// export default Home;


"use client";

import React from 'react';

const Home = () => {
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

  return (
    <div>
      <h1>User personalized home page</h1>
      <button onClick={handleSendEmail}>Send Email</button>
    </div>
  );
};

export default Home;
