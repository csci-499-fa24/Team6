'use client';
import * as React from 'react';
import { CustomTextField, CustomLinearProgress } from "../components/customComponents";
import styles from './register.module.css';

const RegistrationStep4 = ({ currentStep, handlePrevStep, handleFinish, setFormData }) => {
    const [nutritionGoals, setNutritionGoals] = React.useState({
        protein: '',
        carbohydrates: '',
        total_fat: '',
        saturated_fat: '',
        fiber: '',
        sodium: '',
        sugar: ''
    });

    const NutritionList = [
        "Protein",
        "Carbohydrates",
        "Total Fat",
        "Saturated Fat",
        "Fiber",
        "Sodium",
        "Sugar",
    ];

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setNutritionGoals((prevGoals) => ({
            ...prevGoals,
            [name]: value
        }));
    };

    const handleFinishClick = () => {
        // Save nutritional goals to formData
        setFormData((prevFormData) => ({
            ...prevFormData,
            ...nutritionGoals // Merging nutritional goals into formData
        }));

        // Call the finish function
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
                            name={nutrition.toLowerCase().replace(" ", "_")} // Set the name based on nutrition
                            className={styles.nutritionInput}
                            value={nutritionGoals[nutrition.toLowerCase().replace(" ", "_")]} // Set the value from state
                            onChange={handleInputChange} // Handle input change
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
