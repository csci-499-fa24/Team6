"use client";

import React, { useEffect, useState } from 'react';
import styles from './pantry.module.css';
import { CustomTextField } from "../components/customComponents"

const capitalizeFirstLetter = (string) => {
    return string
        .split(' ') 
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) 
        .join(' ');
};

// IngredientItem Component
const IngredientItem = ({ ingredient, amount, unit, onAmountChange, isEditable, onToggleEdit }) => {
    return (
        <div className={styles.ingredientItem} key={ingredient.ingredient_id}>
            <div className={styles.ingredientItemTitle}>{capitalizeFirstLetter(ingredient.name)}</div>
            {/* {isEditable ? ( */}
                <CustomTextField
                    type="number"
                    placeholder="Amount"
                    value={amount || ''}
                    onChange={(e) => onAmountChange(ingredient.ingredient_id, e.target.value)}
                    size="small"
                    sx={{ width: '10%'}}
                />
            {unit && <span className={styles.ingredientItemUnit}>{` ${unit}`}</span>}
        </div>
    );
};

// IngredientForm Component
const IngredientForm = ({ onUpdate }) => {
    return <button onClick={onUpdate}>Refresh Ingredients</button>; // Button to trigger refresh
};

// Main IngredientList Component
const IngredientList = () => {
    const [userIngredients, setUserIngredients] = useState([]);
    const [error, setError] = useState(null);

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
            setError(null); // Clear any previous errors
        } catch (error) {
            console.error('Error fetching user ingredients:', error);
            setError('Failed to load ingredients. Please try again later.'); // Set error message
        }
    };

    useEffect(() => {
        fetchUserIngredients(); // Fetch ingredients when the component mounts
    }, []);

    const handleUpdate = () => {
        fetchUserIngredients();
    }

    return (
        <div className={styles.ingredientInputContainer}>
            <div className={styles.header}>Your Ingredients</div>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if any */}
            {userIngredients.length === 0 ? ( // Check if there are no ingredients
                <p>No ingredients found. Please add some ingredients.</p>
            ) : (
                <div className={styles.ingredientList}>
                    {userIngredients.map((ingredient) => (
                        <li key={ingredient.ingredient_id}> {/* Ensure each list item has a unique key */}
                            <strong>{ingredient.name}</strong> {ingredient.amount} {ingredient.unit && <span>{ingredient.unit}</span>}
                        </li>
                    ))}
                </div>
            )}
            <IngredientForm onUpdate={handleUpdate} />
        </div>
    );
};

export default IngredientList;