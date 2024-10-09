'use client';
import Navbar from "../components/navbar";
import IngredientInput from './IngredientInput';
import AllergenInput from "./AllergenInput";
import React from "react";
import styles from './pantry.module.css';
import { useState } from 'react';

const Pantry = () => {
  const [activeSection, setActiveSection] = useState('Ingredients');

  const handleSectionClick = (section) => {
    setActiveSection(section);
  };

  return (
    <div>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.title}>Welcome to your pantry</div>
        <div className={styles.pantryContent}>
          <div className={styles.sidebar}>
            <div
              onClick={() => handleSectionClick('Ingredients')}
              className={activeSection === 'Ingredients' ? styles.active : styles.notActive}
            >
              Ingredients
            </div>
            <div
              onClick={() => handleSectionClick('Allergens')}
              className={activeSection === 'Allergens' ? styles.active : styles.notActive}
            >
              Allergens
            </div>
            <div
              onClick={() => handleSectionClick('Nutrition')}
              className={activeSection === 'Nutrition' ? styles.active : styles.notActive}
            >
              Nutrition
            </div>
          </div>
          <div className={styles.seperator}></div>
          <div className={styles.pantrySection}>
            {activeSection === 'Ingredients' && <IngredientInput />}
            {activeSection === 'Allergens' && <AllergenInput />}
            {activeSection === 'Nutrition' && <div className={styles.header}>Modify your nutritional goals</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pantry;