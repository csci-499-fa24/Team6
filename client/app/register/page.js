'use client';
import * as React from 'react';
import Navbar from "../components/navbar";
import RegistrationStep1 from './regStep1';
import RegistrationStep2 from './regStep2';
import styles from './register.module.css';
import { useState } from 'react';

const Units = [
  { value: "g", label: "Gram(s)" },
  { value: "oz", label: "Ounce(s)" },
  { value: "lb", label: "Pound(s)" },
  { value: "C", label: "Cup(s)" },
  { value: "pt", label: "Pint(s)" },
  { value: "qt", label: "Quart(s)" },
  { value: "gal", label: "Gallon(s)" },
  { value: "mL", label: "Milliliter(s)" },
  { value: "L", label: "Liter(s)" },
  { value: "tsp", label: "Teaspoon(s)" },
  { value: "tbsp", label: "Tablespoon(s)" },
]

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
        </div>
      </div>
    </div>
  );
};

export default Register;