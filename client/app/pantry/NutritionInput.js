"use client";

import React, { useState, useEffect } from 'react';
import styles from './pantry.module.css';
import { CustomTextField, CustomCircularProgress } from "../components/customComponents.js";

const NutritionInput = () => {
    const [goals, setGoals] = useState({
        protein: '',
        carbohydrates: '',
        total_fat: '',
        saturated_fat: '',
        fiber: '',
        sodium: '',
        sugar: ''
    });
    const [consumed, setConsumed] = useState(null);

    useEffect(() => {
        const fetchNutritionData = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/nutrition-get', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                const { goals, consumed } = data;
                
                // Remove user_id and set goals
                const filteredGoals = { ...goals };
                delete filteredGoals.user_id;
                setGoals(filteredGoals);
                setConsumed(consumed);
            } catch (error) {
                console.error("Error fetching nutrition data", error);
            }
        };

        fetchNutritionData();
    }, []);

    const handleGoalChange = (e) => {
        const { name, value } = e.target;
        setGoals(prevGoals => ({
            ...prevGoals,
            [name]: value
        }));
    };

    const handleSaveGoals = async () => {
        const token = localStorage.getItem('token');
    
        // Convert empty strings to null before sending to the backend
        const cleanedGoals = Object.fromEntries(
            Object.entries(goals).map(([key, value]) => [key, value === "" ? null : value])
        );
    
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/nutrition-update', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ goals: cleanedGoals })  // Send cleaned goals
            });
            if (response.ok) {
                // Fetch the latest consumed data after saving the goals
                const fetchResponse = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/nutrition-get', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await fetchResponse.json();
                setConsumed(data.consumed);  // Update the consumed data
            } else {
                console.error('Error updating nutritional goals');
            }
        } catch (error) {
            console.error("Error saving nutritional goals", error);
        }
    };
    

    if (!consumed) {
        return <div>Loading...</div>;
    }

    const NutritionalGoals = Object.keys(goals).filter((key) => goals[key] !== null);

    return (
        <div className={styles.nutritionalGoalsPage}>
            <div className={styles.goalsFormSection}>
                <div className={styles.header}>Set Your Nutritional Goals</div>
                <div className={styles.formWrapper}>
                    {Object.keys(goals).map((goal) => (
                        <div key={goal} className={styles.inputGroup}>
                            <label>{goal.charAt(0).toUpperCase() + goal.slice(1)}</label>
                            <CustomTextField
                                name={goal}
                                value={goals[goal] || ''}
                                onChange={handleGoalChange}
                                size="small"
                            />
                        </div>
                    ))}
                    <button onClick={handleSaveGoals} className={styles.saveButton}>Save</button>
                </div>
            </div>

            <div className={styles.trackerSection}>
                <div className={styles.header}>Daily Nutrition Tracker</div>
                <div className={styles.trackerWrapper}>
                    {NutritionalGoals.map((nutrient) => (
                        <div key={nutrient} className={styles.trackerItem}>
                            <div className={styles.trackerVisual}>
                                <div className={styles.trackerItemTitle}>{nutrient}</div>
                                <CustomCircularProgress
                                    value={(consumed[nutrient] / goals[nutrient]) * 100 || 0}
                                    progressColor="#74DE72"
                                    backgroundColor="#C3F5C2"
                                />
                            </div>
                            <div className={styles.data}>
                                {consumed[nutrient] || 0} / {goals[nutrient] || 0} g
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NutritionInput;
