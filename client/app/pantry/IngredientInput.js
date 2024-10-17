"use client";

import React, { useState } from 'react';
import { CustomTextField, CustomDropdown } from "../components/customComponents"
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import styles from './pantry.module.css'
import { MenuItem } from '@mui/material';

const IngredientInput = ({ onAddIngredient }) => {
    const [ingredient, setIngredient] = useState('');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    console.log(selectedIngredient)
    
    const fetchIngredients = async (query) => {
        // Fetch ingredients from Spoonacular API
        try {
            const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
            const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&number=5&apiKey=${apiKey}&metaInformation=true`);
            const data = await response.json();
            setSuggestions(data);
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setIngredient(value);

        if (value.length > 0) {
            fetchIngredients(value);
        } else {
            setSuggestions([]);
        }

        setSelectedIngredient(null);
    };

    const handleSuggestionClick = (suggestion) => {
        setIngredient(suggestion.name);
        setSelectedIngredient(suggestion);
        setSuggestions([]);
        setUnit('');
    };

    const handleAdd = () => {
        if (selectedIngredient && amount && unit) {
            const payload = {
                ingredient_name: selectedIngredient.name,
                user_id: 1,
                amount: parseInt(amount),
                unit: unit,
            };

            fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/add-ingredient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then((data) => {
                    console.log('Ingredient added:', data);
                    // Call the function to add the ingredient to the list
                    onAddIngredient({
                        ingredient_id: data.ingredient_id, // Make sure to include the id from the response if applicable
                        name: selectedIngredient.name,
                        amount: parseInt(amount),
                        unit: unit,
                    });
                    // Reset the form
                    setIngredient('');
                    setAmount('');
                    setUnit('');
                    setSuggestions([]);
                })
                .catch((error) => {
                    console.error('Error adding ingredient:', error);
                });
        } else {
            console.error('Please select an ingredient, specify an amount, and choose a unit.');
        }
    };

    return (
        <div className={styles.ingredientContainer}>
            <div className={styles.header}>Add an ingredient</div>
            <div className={styles.input}>
                <div className={styles.ingredient}>
                    <div className={styles.textfieldLabel}>Ingredient</div>
                    <CustomTextField
                        type="text"
                        value={ingredient}
                        onChange={handleInputChange}
                        size="small"
                    />

                    {suggestions.length > 0 && (
                        <ul className={styles.suggestions}>
                            {suggestions.map((suggestion) => (
                                <li
                                    key={suggestion.id}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={styles.suggestionItem}
                                >
                                    {suggestion.name} {/* Display name without image */}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className={styles.amount}>
                    <div className={styles.textfieldLabel}>Quantity</div>
                    <CustomTextField
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)} // This should correctly set the amount
                        size="small"
                    />
                </div>
                <div className={styles.unitContainer}>
                {selectedIngredient && selectedIngredient.possibleUnits && (
                    <div className={styles.units}>
                        <div className={styles.textfieldLabel}>Unit</div>
                        <CustomDropdown
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className={styles.unitSelect}
                            size="small"
                            sx={{ width: '100%'}}
                        >
                            {selectedIngredient.possibleUnits.map((possibleUnit) => (
                                <MenuItem
                                    key={possibleUnit}
                                    value={possibleUnit}
                                    sx={{ '&.MuiMenuItem-root': { fontFamily: 'Inter' } }}
                                >
                                    {possibleUnit}
                                </MenuItem>
                            ))}
                        </CustomDropdown>
                    </div>
                )}
                </div>
                <AddCircleOutlineRounded onClick={handleAdd} className={styles.addButton} />
            </div>
        </div>
    );
};

export default IngredientInput;
