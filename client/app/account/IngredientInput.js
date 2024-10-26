"use client";

import React, { useState } from 'react';
import { CustomTextField, CustomDropdown } from "../components/customComponents.js"
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import styles from './account.module.css'
import { MenuItem } from '@mui/material';

const IngredientInput = () => {
    const [ingredient, setIngredient] = useState('');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    console.log(selectedIngredient)
    
    const fetchIngredients = async (query) => {
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
        if (ingredient && amount && unit) {
            const payload = {
                ingredient_name: ingredient,
                amount: parseInt(amount),
                unit: unit,
            };
    
            // Retrieve the token from local storage
            const token = localStorage.getItem("token");
            console.log(payload);
            fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/ingredient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Add the token in the Authorization header
                },
                body: JSON.stringify(payload),
            })
            .then((response) => {
                console.log(response);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then((data) => {
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