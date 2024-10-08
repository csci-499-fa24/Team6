'use client';
import * as React from 'react';
import Navbar from "../components/navbar";
import RegistrationStep1 from './regStep1';
import RegistrationStep2 from './regStep2';
import RegistrationStep3 from './regStep3';
import RegistrationStep4 from './regStep4';
import styles from './register.module.css';
import { useState } from 'react';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);

  const [email, setEmail] = useState('');        
  const [password, setPassword] = useState('');  
  const [error, setError] = useState('');        
  const [success, setSuccess] = useState('');

  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prevStep) => (prevStep > 1 ? prevStep - 1 : prevStep));
  };

  const handleAddIngredient = () => {
    if (quantity > 0 && unit && ingredient) {
      setPantry((prev) => [
        ...prev,
        { quantity, unit, ingredient }
      ]);
      setQuantity('');
      setUnit('');
      setIngredient('');
    }
  };

  //Register 
  const handleSignup = async () => {
    console.log("button clicked!")
    setError('');
    setSuccess('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Signup successful. Please log in.');
        window.location.href = "/login"; // Redirect to login after success
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <Navbar />
      <div className={styles.regPageWrapper}>
        <div className={styles.regWrapper}>
          <img src="../assets/logoTitle.png" className={styles.regImage} />

          {error && <p style={{ color: 'red' }}>{error}</p>}
          {success && <p style={{ color: 'green' }}>{success}</p>}

          {currentStep === 1 && (
            <RegistrationStep1
              currentStep={currentStep}
              handleNextStep={handleNextStep}
              email={email}                   
              setEmail={setEmail}              
              password={password}              
              setPassword={setPassword}
            />
          )}
          {currentStep === 2 && (
            <RegistrationStep2
              currentStep={currentStep}
              handleNextStep={handleNextStep}
              handlePrevStep={handlePrevStep}
            />
          )}
          {currentStep === 3 && (
            <RegistrationStep3
              currentStep={currentStep}
              handleNextStep={handleNextStep}
              handlePrevStep={handlePrevStep}
            />
          )}
          {currentStep === 4 && (
            <RegistrationStep4
              currentStep={currentStep}
              handlePrevStep={handlePrevStep}
              handleFinish={handleSignup} 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;