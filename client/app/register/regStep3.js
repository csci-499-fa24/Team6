
'use client';
import * as React from 'react';
import { CustomTextField, CustomLinearProgress } from "../components/customComponents.js";
import styles from './register.module.css';
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import { useState } from 'react';

const RegistrationStep3 = ({ currentStep, handleNextStep, handlePrevStep, formData, setFormData }) => {
    const [allergy, setAllergy] = useState('');
    const [allergies, setAllergies] = useState(formData.allergy || []);
    const [suggestions, setSuggestions] = useState([]);
    const [debounceTimer, setDebounceTimer] = useState(null);

    // Fetch ingredients suggestions from Spoonacular API
    const fetchIngredients = async (query) => {
        if (!query) return;
        try {
            const response = await fetch(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/ingredients/autocomplete?query=${query}&number=5&metaInformation=true`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
                }
            });
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    //handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setAllergy(value);

        // Clear previous debounce timer
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        // Set new debounce timer
        const newTimer = setTimeout(() => {
            if (value.length > 0) {
                fetchIngredients(value);
            } else {
                setSuggestions([]);
            }
        }, 1000); // 1 second debounce

        setDebounceTimer(newTimer);
    };

    // handle key down 
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddAllergy();
        }
    };

    //handle add allergy
    const handleAddAllergy = () => {
        if (allergy) {
            setAllergies((prev) => [...prev, { allergen: allergy }]);
            setAllergy('');
            setSuggestions([]);
        }
    };

    //handle suggestion select
    const handleSuggestionSelect = (suggestion) => {
        setAllergy(suggestion.name);
        setSuggestions([]);
    };

    //handle remove allergy
    const handleRemoveAllergy = (index) => {
        setAllergies((prev) => prev.filter((_, i) => i !== index));
    };

    //handle save and next
    const handleSaveAndNext = () => {
        setFormData((prev) => ({
            ...prev,
            allergy: allergies // Update allergies in formData
        }));
        handleNextStep();
    };

    return (
        <div className={styles.step1}>
            <div className={styles.regTitle}>Add any food allergies</div>
            <CustomLinearProgress
                variant="determinate"
                value={(currentStep / 4) * 100}
                className={styles.progressBar}
            />
            <div className={styles.addAllergy}>
                <div className={styles.allergyInput}>
                    <div className={styles.labelText}>Allergy</div>
                    <CustomTextField
                        value={allergy}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        size="small"
                    />
                    {suggestions.length > 0 && (
                        <div className={styles.suggestions}>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={styles.suggestionItem}
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                >
                                    {suggestion.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <AddCircleOutlineRounded onClick={handleAddAllergy} className={styles.addButton} />
            </div>
            <div className={styles.ingredientList}>
                {allergies.length > 0 && (
                    <div className={styles.scrollableContainer}>
                        {allergies.map((item, index) => (
                            <div key={index} className={styles.ingredientItem}>
                                {item.allergen}
                                <RemoveCircleOutlineRounded onClick={() => handleRemoveAllergy(index)} className={styles.removeButton} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.navButtons}>
                <div className={styles.navButton} onClick={handlePrevStep}>Back</div>
                <div className={styles.navButton} onClick={handleSaveAndNext}>Next</div>
            </div>
        </div>
    );
};

export default RegistrationStep3;