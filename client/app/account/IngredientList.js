"use client";

import React, { useEffect, useState } from 'react';
import { MenuItem, IconButton, TextField, Button } from '@mui/material';
import { RemoveCircleOutlineRounded, EditRounded, SaveRounded, CloseRounded } from '@mui/icons-material';
import styles from './account.module.css';
import { CustomTextField, CustomDropdown } from "../components/customComponents.js"

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
    const [editIndex, setEditIndex] = useState(null);
    const [editAmount, setEditAmount] = useState('');  // Amount in edit mode
    const [editUnit, setEditUnit] = useState('');
    const [editPossibleUnits, setEditPossibleUnits] = useState([]);
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


    const fetchPossibleUnits = async (ingredient) => {
        // Fetch ingredients from Spoonacular API
        try {
            const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
            const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${ingredient}&number=5&apiKey=${apiKey}&metaInformation=true`);
            const data = await response.json();
            const units = data[0]?.possibleUnits || [];
            setEditPossibleUnits(units);
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
                body: JSON.stringify({ingredientId})
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

    const handleEdit = (index, ingredient) => {
        setEditIndex(index);  // Set the index of the ingredient being edited
        setEditAmount(ingredient.amount);  // Initialize the amount input with the current value
        setEditUnit(ingredient.unit || '');  // Initialize the unit input with the current unit
    
        // Fetch the possible units for this ingredient when entering edit mode
        fetchPossibleUnits(ingredient.name);
    };


    const handleSave = async (ingredient_id) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients/update', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ingredientId: ingredient_id,
                    amount: editAmount,
                    unit: editUnit,
                }),
            });
            if (!response.ok) {
                throw new Error('Failed to update ingredient');
            }
            setEditIndex(null); // Exit edit mode
            fetchUserIngredients(); // Refresh the ingredient list
        } catch (error) {
            console.error('Error updating ingredient:', error);
        }
    };

    // Handle cancelling the edit
    const handleCancelEdit = () => {
        setEditIndex(null);  // Exit edit mode without saving
        setEditAmount('');   // Reset the amount
        setEditUnit('');     // Reset the unit
        setEditPossibleUnits([]);  // Clear possible units
    };

    return (
        <div className={styles.ingredientInputContainer}>
            <div className={styles.header}>Your Ingredients</div>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if any */}
            {userIngredients.length === 0 ? (
                <p>No ingredients found. Please add some ingredients.</p>
            ) : (
                <ul>
                    {userIngredients.map((ingredient, index) => (
                        <li key={ingredient.ingredient_id} className={styles.ingredientItem}>
                            {editIndex === index ? (
                                // Edit mode: show input fields
                                <>
                                    <strong>{ingredient.name}</strong>
                                    <TextField
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        type="number"
                                        size="small"
                                        className={styles.amountTextField}
                                    />
                                    <CustomDropdown
                                        value={editUnit || ""}
                                        onChange={(e) => setEditUnit(e.target.value)}
                                        className={styles.unitSelect}
                                    >
                                        {editPossibleUnits.map((unit) => (
                                            <MenuItem key={unit} value={unit}>
                                                {unit}
                                            </MenuItem>
                                        ))}
                                    </CustomDropdown>
                                    <IconButton onClick={() => handleSave(ingredient.ingredient_id)}>
                                        <SaveRounded />
                                    </IconButton>
                                    <IconButton onClick={handleCancelEdit}>
                                        <CloseRounded />
                                    </IconButton>
                                </>
                            ) : (
                                // Normal mode: display amount and unit
                                <>
                                    <strong>{ingredient.name}</strong> {ingredient.amount} {ingredient.unit}
                                    <IconButton onClick={() => handleEdit(index, ingredient)}>
                                        <EditRounded />
                                    </IconButton>
                                    <IconButton onClick={() => handleRemove(ingredient.ingredient_id)}>
                                        <RemoveCircleOutlineRounded />
                                    </IconButton>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            <IngredientForm onUpdate={fetchUserIngredients} /> {/* Refresh button */}
        </div>
    );
};

export default IngredientList;