"use client";

import React, { useEffect, useState } from 'react';
import { MenuItem, IconButton, Button } from '@mui/material';
import { RemoveCircleOutlineRounded, EditRounded, SaveRounded, CloseRounded } from '@mui/icons-material';
import styles from './account.module.css';
import { CustomTextField, CustomDropdown } from "../components/customComponents.js"

const capitalizeFirstLetter = (string) => {
    return string
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

// IngredientForm Component
const IngredientForm = ({ onUpdate }) => {
    return <button onClick={onUpdate}>Refresh Ingredients</button>; // Button to trigger refresh
};

// Main IngredientList Component
const IngredientList = () => {
    const [userIngredients, setUserIngredients] = useState([]);
    const [editAmounts, setEditAmounts] = useState({});  // Amount in edit mode
    const [editUnits, setEditUnits] = useState({});
    const [editPossibleUnits, setEditPossibleUnits] = useState({});
    const [error, setError] = useState(null);

    console.log(editUnits)

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
            setUserIngredients(data); // Update state with fetched ingredients
            setEditAmounts(data.reduce((acc, ingredient) => ({ ...acc, [ingredient.ingredient_id]: ingredient.amount }), {}));
            setEditUnits(data.reduce((acc, ingredient) => ({ ...acc, [ingredient.ingredient_id]: ingredient.unit || '' }), {}));
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Error fetching user ingredients:', error);
            setError('Failed to load ingredients. Please try again later.'); // Set error message
        }
    };

    useEffect(() => {
        fetchUserIngredients(); // Fetch ingredients when the component mounts
    }, []);


    const fetchPossibleUnits = async (ingredientName, ingredientId) => {
        // Fetch ingredients from Spoonacular API
        try {
            const response = await fetch(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/ingredients/autocomplete?query=${ingredient}&number=5&metaInformation=true`, {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY, 
                    'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
                }
            });
            const data = await response.json();
            const units = data[0]?.possibleUnits || [];
            setEditPossibleUnits((prev) => ({ ...prev, [ingredientId]: units }));
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

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

    const handleSave = async (ingredientId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients/update', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredientId,
                    amount: editAmounts[ingredientId],
                    unit: editUnits[ingredientId],
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update ingredient');
            }
            fetchUserIngredients(); // Refresh the ingredient list
        } catch (error) {
            console.error('Error updating ingredient:', error);
        }
    };

    return (
        <div className={styles.ingredientInputContainer}>
            <div className={styles.header}>Your Ingredients</div>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {userIngredients.length === 0 ? (
                <p>No ingredients found. Please add some ingredients.</p>
            ) : (
                <ul>
                    {userIngredients.map((ingredient) => (
                        <li key={ingredient.ingredient_id} className={styles.ingredientItem}>
                            {/* Always in edit mode */}
                            <CustomTextField
                                value={editAmounts[ingredient.ingredient_id] || ''}
                                onChange={(e) => setEditAmounts((prev) => ({ ...prev, [ingredient.ingredient_id]: e.target.value }))}
                                type="number"
                                size="small"
                                className={styles.amountTextField}
                            />
                            <CustomDropdown
                                value={editUnits[ingredient.ingredient_id] || ""}
                                onChange={(e) => setEditUnits((prev) => ({ ...prev, [ingredient.ingredient_id]: e.target.value }))}
                                className={styles.unitSelect}
                                size="small"
                            >
                                {editPossibleUnits[ingredient.ingredient_id]?.map((unit) => (
                                    <MenuItem key={unit} value={unit}>
                                        {unit}
                                    </MenuItem>
                                ))}
                            </CustomDropdown>
                            <div>{capitalizeFirstLetter(ingredient.name)}</div>
                            <IconButton onClick={() => handleSave(ingredient.ingredient_id)}>
                                <SaveRounded />
                            </IconButton>
                            <IconButton onClick={() => handleRemove(ingredient.ingredient_id)}>
                                <RemoveCircleOutlineRounded />
                            </IconButton>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default IngredientList;