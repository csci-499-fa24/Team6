"use client";

import React, { useState } from 'react';
import styles from './pantry.module.css';
import { CustomTextField } from "../components/customComponents"

const NutritionInput = () => {
    const NutritionList = [
        "Protein",
        "Carbohydrates",
        "Total Fat",
        "Saturated Fat",
        "Fiber",
        "Sodium",
        "Sugar",
    ];

    return (
        <div className={styles.nutritionalGoals}>
            Modify your nutritional goals
            <div className={styles.nutritionInputs}>
                {NutritionList.map((nutrition) => (
                    <div key={nutrition} className={styles.nutritionalItem}>
                        <div className={styles.nutritionName}>{nutrition}</div>
                        <CustomTextField
                            type="number"
                            name={nutrition.toLowerCase().replace(" ", "_")}
                            className={styles.nutritionInput}
                            size="small"
                        />
                        grams
                    </div>
                ))}
            </div>
        </div>
    )
}

export default NutritionInput;