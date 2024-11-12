'use client';
import * as React from 'react';
import { useState } from 'react';
import Navbar from "../components/navbar";
import RegistrationStep1 from './regStep1';
import RegistrationStep2 from './regStep2';
import RegistrationStep3 from './regStep3';
import RegistrationStep4 from './regStep4';
import styles from './register.module.css';

const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState('');        
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    ingredients: [],
    allergy: [],
    nutritionalGoals: {
      protein: '',
      carbohydrates: '',
      total_fat: '',
      saturated_fat: '',
      fiber: '',
      sodium: '',
      sugar: '',
      calories: '',
    }
  });

  const handleNextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prevStep) => (prevStep > 1 ? prevStep - 1 : prevStep));
  };

  const handleSignup = async () => {
    console.log("Submitting form data...", JSON.stringify(formData, null, 2));
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Signup successful. Please log in.');
        window.location.href = "/login"; // Redirect to login after success
      } else {
        console.error('Signup failed:', data);
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Error during signup:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <Navbar />
      <div className={styles.regPageWrapper}>
        <div className={styles.regWrapper}>
          <img src="../assets/logoTitle.png" className={styles.regImage} alt="Logo" />

          {error && <div style={{ color: 'red' }}>{error}</div>}
          {success && <div style={{ color: 'green' }}>{success}</div>}

          {currentStep === 1 && (
            <RegistrationStep1
              currentStep={currentStep}
              handleNextStep={handleNextStep}
              formData={formData}
              setFormData={setFormData}
            />
          )}

          {currentStep === 2 && (
            <RegistrationStep2
              currentStep={currentStep}
              handleNextStep={handleNextStep}
              handlePrevStep={handlePrevStep}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {currentStep === 3 && (
            <RegistrationStep3
              currentStep={currentStep}
              handleNextStep={handleNextStep}
              handlePrevStep={handlePrevStep}
              formData={formData}
              setFormData={setFormData}
            />
          )}
          {currentStep === 4 && (
            <RegistrationStep4
              currentStep={currentStep}
              handlePrevStep={handlePrevStep}
              handleFinish={handleSignup}
              formData={formData}
              setFormData={setFormData}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;