import Navbar from "../components/navbar";
import IngredientInput from './IngredientInput';
import React from "react";
import styles from './pantry.module.css';

const Pantry = () => {
  return (
    <div>
      <Navbar />
      <div className={styles.pageWrapper}>
        <div className={styles.title}>Welcome to your pantry</div>
        <div className={styles.pantryContent}>
          <div className={styles.sidebar}>
            <div>
              Ingredients
            </div>
            <div>
              Allergens
            </div>
            <div>
              Nutrition
            </div>
          </div>
          <div className={styles.seperator}></div>
          <div className={styles.ingredientInput}>
            <IngredientInput />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pantry;