
'use client';
import * as React from 'react';
import { CustomTextField, CustomDropdown, CustomLinearProgress } from "../components/customComponents.js";
import styles from './register.module.css';
import { MenuItem } from '@mui/material';
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import { useState } from 'react';

const RegistrationStep2 = ({ currentStep, handleNextStep, handlePrevStep, formData, setFormData }) => {
    const [ingredient, setIngredient] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unit, setUnit] = useState('');
    const [ingredients, setIngredients] = useState(formData.ingredients || []);
    const [suggestions, setSuggestions] = useState([]);
    const [possibleUnits, setPossibleUnits] = useState([]);
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
    const handleInputChange = (event) => {
        const value = event.target.value;
        setIngredient(value);
        setUnit('');
        setQuantity('');
        setPossibleUnits([]);

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

    //handle ingredient select
    const handleIngredientSelect = (selectedIngredient) => {
        setIngredient(selectedIngredient.name);
        setSuggestions([]);
        setPossibleUnits(selectedIngredient.possibleUnits);
    };

    const handleAddIngredient = () => {
        if (quantity > 0 && unit && ingredient) {
            const newIngredient = { ingredient, quantity, unit, possibleUnits };
            setIngredients((prev) => [...prev, newIngredient]);
            setQuantity('');
            setUnit('');
            setIngredient('');
            setPossibleUnits([]);
        }
    };

    const handleRemoveIngredient = (index) => {
        setIngredients((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSaveAndNext = () => {
        setFormData((prev) => ({
            ...prev,
            ingredients
        }));
        handleNextStep();
    };

    return (
        <div className={styles.step1}>
            <div className={styles.regTitle}>Add any ingredients that you own</div>
            <CustomLinearProgress
                variant="determinate"
                value={(currentStep / 4) * 100}
                className={styles.progressBar}
            />
            <div className={styles.addIngredient}>
                <div className={styles.ingredient}>
                    <div className={styles.labelText}>Ingredient</div>
                    <CustomTextField
                        value={ingredient}
                        onChange={handleInputChange}
                        size="small"
                    />
                    {suggestions.length > 0 && (
                        <div className={styles.suggestions}>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={styles.suggestionItem}
                                    onClick={() => handleIngredientSelect(suggestion)}
                                >
                                    {suggestion.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {possibleUnits.length > 0 && (
                    <div className={styles.unit}>
                        <div className={styles.labelText}>Unit</div>
                        <CustomDropdown
                            value={unit}
                            onChange={(event) => setUnit(event.target.value)}
                            size="small"
                        >
                            {possibleUnits.map((unitOption, index) => (
                                <MenuItem
                                    key={index}
                                    value={unitOption}
                                    sx={{ '&.MuiMenuItem-root': { fontFamily: 'Inter' } }}
                                >
                                    {unitOption}
                                </MenuItem>
                            ))}
                        </CustomDropdown>
                    </div>
                )}

                {unit && (
                    <div className={styles.quantity}>
                        <div className={styles.labelText}>Quantity</div>
                        <CustomTextField
                            type="number"
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value >= 0 ? event.target.value : '')}
                            size="small"
                        />
                    </div>
                )}
                <AddCircleOutlineRounded onClick={handleAddIngredient} className={styles.addButton} />
            </div>

            <div className={styles.ingredientList}>
                {ingredients.length > 0 && (
                    <div className={styles.scrollableContainer}>
                        {ingredients.map((item, index) => (
                            <div key={index} className={styles.ingredientItem}>
                                {item.quantity} {item.unit} {item.ingredient}
                                <RemoveCircleOutlineRounded onClick={() => handleRemoveIngredient(index)} className={styles.removeButton} />
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

export default RegistrationStep2;