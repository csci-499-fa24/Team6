"use client";

import React, { useState } from 'react';
import { CustomTextField } from "../components/customComponents"
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import styles from './IngredientInput.module.css'; // Import the CSS module

const IngredientInput = ({ onAddIngredient }) => {
    const [ingredient, setIngredient] = useState('');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

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
        <div>
            <div className={styles.header}>Add an ingredient</div>
            <div className={styles.container}>
            <input
                    type="text"
                    value={ingredient}
                    onChange={handleInputChange}
                    placeholder="Type an ingredient"
                    className={styles.input}
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
                <div className={styles.amountContainer}>
                    <CustomTextField
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        className={styles.amountInput}
                    />
                    {selectedIngredient && selectedIngredient.possibleUnits && (
                        <select
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className={styles.unitSelect}
                        >
                            <option value="">Select unit</option>
                            {selectedIngredient.possibleUnits.map((possibleUnit) => (
                                <option key={possibleUnit} value={possibleUnit}>
                                    {possibleUnit}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <button onClick={handleAdd}>Add</button>
                <AddCircleOutlineRounded onClick={handleAdd} className={styles.addButton} />
            </div>
        </div>
    );
};

export default IngredientInput;
