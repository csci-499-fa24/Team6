"use client";

import React, { useEffect, useState } from 'react';
import styles from './pantry.module.css';

// IngredientItem Component
const IngredientItem = ({ ingredient, amount, unit, onAmountChange, isEditable, onToggleEdit }) => {
    return (
        <li key={ingredient.ingredient_id}>
            <strong>{ingredient.name}</strong>
            {/* Toggle between display and input mode */}
            {isEditable ? (
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount || ''}
                    onChange={(e) => onAmountChange(ingredient.ingredient_id, e.target.value)}
                />
            ) : (
                <span onClick={() => onToggleEdit(ingredient.ingredient_id)}>{amount || '0'}</span>
            )}
            {unit && <span>{` ${unit}`}</span>}
        </li>
    );
};

// IngredientForm Component
const IngredientForm = ({ userIngredients, amounts, onSubmit, onResetAmounts }) => {
    const handleSubmit = () => {
        // Reset editable ingredients to an empty set when the update is initiated
        onResetAmounts(); // Reset amounts and editable state first

        console.log('Current amounts:', amounts); // Log current amounts

        const updates = Object.entries(amounts).reduce((acc, [ingredient_id, amount]) => {
            const originalIngredient = userIngredients.find(ing => ing.ingredient_id === parseInt(ingredient_id));
            const originalAmount = originalIngredient ? originalIngredient.amount : null; // Safely get the original amount

            // Log the original and updated amounts for comparison
            console.log(`Ingredient ID: ${ingredient_id}, Original Amount: ${originalAmount}, Updated Amount: ${amount}`);

            // Check if amount is a number and then compare
            if (amount !== '' && originalAmount !== null) {
                const parsedAmount = parseFloat(amount); // Parse the updated amount to float
                const parsedOriginalAmount = parseFloat(originalAmount); // Parse the original amount to float

                // Log parsed amounts
                console.log(`Parsed Amount: ${parsedAmount}, Parsed Original Amount: ${parsedOriginalAmount}`);

                // Only include the ingredient if the amount has changed
                if (parsedAmount !== parsedOriginalAmount) {
                    acc.push({
                        ingredient_id: parseInt(ingredient_id), // Ensure ingredient_id is a number
                        amount: parsedAmount, // Use parsed amount directly
                    });
                }
            }

            return acc; // Return the accumulator for the next iteration
        }, []);

        console.log('Updates after reduction:', updates); // Log the updates array after reduction

        // Proceed only if there are updates to send
        if (updates.length > 0) {
            Promise.all(
                updates.map(({ ingredient_id, amount }) => {
                    const payload = {
                        ingredient_name: userIngredients.find(ing => ing.ingredient_id === ingredient_id).name,
                        amount: amount,
                    };

                    return fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/modify-ingredient', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload),
                    });
                })
            )
                .then(responses => {
                    responses.forEach(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                    });
                    console.log('All ingredient amounts updated successfully');
                })
                .catch((error) => {
                    console.error('Error updating ingredient amounts:', error);
                })
                .finally(() => {
                    // Always fetch the updated ingredient list
                    onSubmit(); // Call the submit handler to refresh the ingredient list
                });
        } else {
            console.log('No amounts have changed, nothing to update.');
            // Always fetch the updated ingredient list even if no updates were made
            onSubmit(); // Call the submit handler to refresh the ingredient list
        }
    };

    return <button onClick={handleSubmit}>Update Amounts</button>; // Submit button to update all amounts
};

// Main IngredientList Component
const IngredientList = () => {
    const [userIngredients, setUserIngredients] = useState([]);
    const [amounts, setAmounts] = useState({});
    const [editableIngredients, setEditableIngredients] = useState(new Set()); // Set to track editable ingredients
    const [error, setError] = useState(null);

    // Fetch user ingredients from the server
    const fetchUserIngredients = async () => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients');
            if (!response.ok) {
                throw new Error('Failed to fetch ingredients');
            }
            const data = await response.json();
            setUserIngredients(data); // Update state with fetched ingredients
            setError(null); // Clear any previous errors

            // Initialize amounts state with current amounts
            const initialAmounts = {};
            data.forEach(ingredient => {
                initialAmounts[ingredient.ingredient_id] = ingredient.amount; // Set initial amount for each ingredient
            });
            setAmounts(initialAmounts); // Set the amounts state
        } catch (error) {
            console.error('Error fetching user ingredients:', error);
            setError('Failed to load ingredients. Please try again later.'); // Set error message
        }
    };

    useEffect(() => {
        fetchUserIngredients(); // Fetch ingredients when the component mounts
    }, []);

    const handleAmountChange = (ingredient_id, value) => {
        setAmounts(prevAmounts => ({
            ...prevAmounts,
            [ingredient_id]: value // Update the amount for the specific ingredient
        }));
    };

    const handleToggleEdit = (ingredient_id) => {
        setEditableIngredients(prev => {
            const newEditable = new Set(prev);
            if (newEditable.has(ingredient_id)) {
                newEditable.delete(ingredient_id); // If already editable, remove it
            } else {
                newEditable.add(ingredient_id); // Add to editable set
            }
            return newEditable;
        });
    };

    const handleUpdate = () => {
        fetchUserIngredients(); // Refresh the ingredient list after updating
    };

    const handleResetAmounts = () => {
        // Reset amounts to empty strings after update
        const resetAmounts = {};
        userIngredients.forEach(ingredient => {
            resetAmounts[ingredient.ingredient_id] = ''; // Reset to empty string
        });
        setAmounts(resetAmounts); // Update amounts state

        // Reset editable ingredients to an empty set
        setEditableIngredients(new Set()); // Make all ingredients non-editable
    };

    return (
        <div>
            <div className={styles.header}>Your Ingredients</div>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if any */}
            {userIngredients.length === 0 ? ( // Check if there are no ingredients
                <p>No ingredients found. Please add some ingredients.</p>
            ) : (
                <ul>
                    {userIngredients.map((ingredient) => (
                        <IngredientItem
                            key={ingredient.ingredient_id}
                            ingredient={ingredient}
                            amount={amounts[ingredient.ingredient_id]}
                            unit={ingredient.unit}
                            isEditable={editableIngredients.has(ingredient.ingredient_id)} // Check if the ingredient is editable
                            onAmountChange={handleAmountChange}
                            onToggleEdit={handleToggleEdit} // Pass toggle function
                        />
                    ))}
                </ul>
            )}
            <IngredientForm userIngredients={userIngredients} amounts={amounts} onSubmit={handleUpdate} onResetAmounts={handleResetAmounts} />
        </div>
    );
};

export default IngredientList;
