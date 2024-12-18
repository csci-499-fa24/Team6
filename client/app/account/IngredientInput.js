"use client";

import React, { useEffect, useState } from 'react';
import { MenuItem, IconButton, Button } from '@mui/material';
import { RemoveCircleOutlineRounded, AddCircleOutlineRounded } from '@mui/icons-material';
import styles from './account.module.css';
import { CustomTextField, CustomDropdown } from "../components/customComponents.js"
import ErrorScreen from '../components/error';

// Main IngredientList Component
const IngredientInput = () => {
    // user's ingredients
    const [userIngredients, setUserIngredients] = useState([]);
    const [userAmounts, setUserAmounts] = useState({});
    const [userUnits, setUserUnits] = useState({});
    const [userPossibleUnits, setUserPossibleUnits] = useState({});
    const [error, setError] = useState(null);

    // API's ingredients 
    const [ingredient, setIngredient] = useState('');
    const [amount, setAmount] = useState('');
    const [unit, setUnit] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [possibleUnits, setPossibleUnits] = useState([]);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const capitalizeFirstLetter = (string) => {
        return string
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleQuantityChange = (ingredientId, newAmount) => {
        // Convert to number and handle empty string
        const numericAmount = newAmount === '' ? '' : Number(newAmount);
        
        // Update the amount in state
        setUserAmounts(prev => ({ ...prev, [ingredientId]: newAmount }));

        // If amount becomes 0 or negative, ask user if they want to remove the ingredient
        if (numericAmount <= 0) {
            if (window.confirm('Do you want to remove this ingredient from your pantry?')) {
                handleRemove(ingredientId);
            } else {
                // Reset to previous value or 0
                setUserAmounts(prev => ({ ...prev, [ingredientId]: 0 }));
            }
        }
    };

    const validateAmount = (value) => {
        // Allow empty string for input clearing
        if (value === '') return true;
        
        const numValue = Number(value);
        return !isNaN(numValue) && numValue > 0;
    };

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
        setSelectedIngredient(null);
    };

    const handleSuggestionClick = (suggestion) => {
        setIngredient(suggestion.name);
        setSelectedIngredient(suggestion);
        setPossibleUnits(suggestion.possibleUnits)
        setSuggestions([]);
        setUnit('');
    };

    const handleAdd = () => {
        if (ingredient && validateAmount(amount) && unit) {
            const payload = {
                ingredient_name: ingredient,
                amount: parseFloat(amount),
                unit: unit,
                possibleUnits: possibleUnits
            };

            const token = localStorage.getItem("token");

            fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/ingredient', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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
                setIngredient('');
                setAmount('');
                setUnit('');
                setSuggestions([]);
                setPossibleUnits([]);
                fetchUserIngredients();
            })
            .catch((error) => {
                console.error('Error adding ingredient:', error);
                setError('Failed to add ingredient.');
            });
        } else {
            setError('Please enter a valid amount greater than 0.');
        }
    };

    // Fetch user ingredients from the server
    const fetchUserIngredients = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve the token
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Pass the token in the Authorization header
                }
            });
            if (!response.ok) {
                console.log(response);
                throw new Error('Failed to fetch ingredients');
            }
            const data = await response.json();
            const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));

            setUserIngredients(sortedData); // Update state with fetched ingredients
            setUserAmounts(data.reduce((acc, ingredient) => ({ ...acc, [ingredient.ingredient_id]: ingredient.amount }), {}));
            setUserUnits(data.reduce((acc, ingredient) => ({ ...acc, [ingredient.ingredient_id]: ingredient.unit || '' }), {}));
            setUserPossibleUnits(data.reduce((acc, ingredient) => ({
                ...acc,
                [ingredient.ingredient_id]: ingredient.possible_units || []
            }), {}));

            setError(null);

        } catch (error) {
            console.error('Error fetching user ingredients:', error);
            setError('Failed to load ingredients. Please try again later.'); // Set error message
        }
    };

    useEffect(() => {
        fetchUserIngredients(); // Fetch ingredients when the component mounts
    }, []);

    const handleRemove = async (ingredientId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients/remove', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ingredientId })
            });
            if (!response.ok) {
                throw new Error('Failed to remove ingredient');
            }
            fetchUserIngredients(); // Refresh list after deletion
        } catch (error) {
            console.error('Error removing ingredient:', error);
            setError('Failed to remove ingredient.');
        }
    };

    const handleSaveAll = async () => {
        const token = localStorage.getItem('token');
        try {
            const updates = userIngredients.filter(ingredient => {
                const amount = userAmounts[ingredient.ingredient_id];
                return amount !== '' && Number(amount) > 0;
            });

            const promises = updates.map(ingredient => {
                return fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients/update', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ingredientId: ingredient.ingredient_id,
                        amount: userAmounts[ingredient.ingredient_id],
                        unit: userUnits[ingredient.ingredient_id],
                    }),
                });
            });

            await Promise.all(promises);
            fetchUserIngredients();
        } catch (error) {
            console.error('Error updating ingredients:', error);
            setError('Failed to update ingredients.');
        }
    };

    return (
        <div className={styles.ingredientContainer}>
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
                                sx={{ width: '100%' }}
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
            <div className={styles.ingredientInputContainer}>
                <div className={styles.header}>Your Ingredients</div>
                {error && <div className={styles.errorWrapper}><ErrorScreen error={error}/></div>}
                {userIngredients.length === 0 ? (
                    <p>No ingredients found. Please add some ingredients.</p>
                ) : (
                    <ul className={styles.scrollableContainer}>
                        {userIngredients.map((ingredient) => (
                            <li key={ingredient.ingredient_id} className={styles.ingredientItem}>
                                <CustomTextField
                                    value={userAmounts[ingredient.ingredient_id] || ''}
                                    onChange={(e) => handleQuantityChange(ingredient.ingredient_id, e.target.value)}
                                    type="number"
                                    size="small"
                                    className={styles.amountTextField}
                                    inputProps={{ min: "0", step: "0.01" }}
                                />
                                <CustomDropdown
                                    value={userUnits[ingredient.ingredient_id] || ""}
                                    onChange={(e) => setUserUnits((prev) => ({
                                        ...prev,
                                        [ingredient.ingredient_id]: e.target.value
                                    }))}
                                    className={styles.unitSelect}
                                    size="small"
                                >
                                    {userPossibleUnits[ingredient.ingredient_id]?.map((unit) => (
                                        <MenuItem key={unit} value={unit}>
                                            {unit}
                                        </MenuItem>
                                    ))}
                                </CustomDropdown>
                                <div className={styles.ingredientName}>
                                    {capitalizeFirstLetter(ingredient.name)}
                                </div>
                                <RemoveCircleOutlineRounded
                                    onClick={() => handleRemove(ingredient.ingredient_id)}
                                    className={styles.removeButton}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div onClick={handleSaveAll} className={styles.saveButton}>
                Save Changes
            </div>
        </div>
    );
};

export default IngredientInput;