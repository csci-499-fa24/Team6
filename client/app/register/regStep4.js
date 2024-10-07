'use client';
import * as React from 'react';
import { CustomTextField, CustomDropdown, CustomLinearProgress } from "../components/customComponents"
import styles from './register.module.css';
import { MenuItem } from '@mui/material';
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import Link from "next/link";
import { useState } from 'react';

const RegistrationStep3 = ({ currentStep, handleNextStep, handlePrevStep }) => {
    const [quantity, setQuantity] = useState('');

    const NutritionList = [
        "Protein",
        "Carbohydrates",
        "Total Fat",
        "Saturated Fat",
        "Fiber",
        "Sodium",
        "Sugar",
    ]

    return (
        <div className={styles.step1}>
            <div className={styles.regTitle}>Add your daily nutritional goals</div>
            <CustomLinearProgress
                variant="determinate"
                value={(currentStep / 4) * 100}
                className={styles.progressBar}
            />
            <div className={styles.nutritionalGoals}>
                {NutritionList.map((nutrition) => (
                    <div key={nutrition} className={styles.nutritionalItem}>
                        <div className={styles.nutritionName}>{nutrition}</div>
                        <CustomTextField
                            type="number"
                            className= {styles.nutritionInput}
                        />
                        grams
                    </div>
                ))}
            </div>
            <div className={styles.navButtons}>
                <div className={styles.navButton} onClick={handlePrevStep}>Back</div>
                <div className={styles.navButton}>Finish</div>
            </div>
        </div>
    );
};

export default RegistrationStep3;