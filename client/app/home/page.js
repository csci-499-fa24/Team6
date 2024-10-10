"use client";
import React, { useState } from 'react';
import Navbar from "../components/navbar";


const Home = () => {
 const [notification, setNotification] = useState('');
 const hostUrl = process.env.NEXT_PUBLIC_API_URL;


 const handleSendEmail = async () => {
   try {
       const response = await fetch(`${hostUrl}/send-email`);
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
     <Navbar />
     <h1>User personalized home page</h1>
     <button onClick={handleSendEmail}>Send Email</button>


   </div>
 );
};


export default Home;
