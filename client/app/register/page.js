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

  return (
    <div>
      <Navbar />
      <div className={styles.regPageWrapper}>
        <div className={styles.regWrapper}>
          <img src="../assets/logoTitle.png" className={styles.regImage} />
          {currentStep === 1 && (
            <RegistrationStep1
              currentStep={currentStep}
              handleNextStep={handleNextStep}
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
              handleNextStep={handleNextStep}
              handlePrevStep={handlePrevStep}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;