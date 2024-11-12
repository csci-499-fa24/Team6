'use client';
import * as React from 'react';
import { CustomTextField, CustomLinearProgress } from "../components/customComponents.js";
import styles from './register.module.css';

const RegistrationStep4 = ({ currentStep, handlePrevStep, handleFinish, formData, setFormData }) => {
    const [nutritionGoals, setNutritionGoals] = React.useState(formData.nutritionalGoals || {
        protein: '',
        carbohydrates: '',
        total_fat: '',
        saturated_fat: '',
        fiber: '',
        sodium: '',
        sugar: '',
        calories: ''
    });

    const NutritionList = [
        "Protein",
        "Carbohydrates",
        "Total Fat",
        "Saturated Fat",
        "Fiber",
        "Sodium",
        "Sugar",
        "Calories",
    ];

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        // Ensure the value is either a number or null (if the field is empty)
        setNutritionGoals((prevGoals) => ({
            ...prevGoals,
            [name]: value === '' ? null : parseFloat(value)
        }));
    };

    const handleFinishClick = () => {
        setFormData((prev) => ({
            ...prev,
            nutritionalGoals: nutritionGoals  // Save nutrition goals to formData
        }));

        handleFinish();
    };

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
                            name={nutrition.toLowerCase().replace(" ", "_")}  // Set the name based on nutrition
                            className={styles.nutritionInput}
                            value={nutritionGoals[nutrition.toLowerCase().replace(" ", "_")] || ''}  // Make sure that empty fields show as blank
                            onChange={handleInputChange}  // Handle input change
                            size="small"
                        />
                        grams
                    </div>
                ))}
            </div>
            <div className={styles.navButtons}>
                <div className={styles.navButton} onClick={handlePrevStep}>Back</div>
                <div className={styles.navButton} onClick={handleFinishClick}>Finish</div>
            </div>
        </div>
    );
};

export default RegistrationStep4;
