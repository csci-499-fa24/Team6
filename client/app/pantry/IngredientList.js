"use client";

import React, { useEffect, useState } from 'react';

const IngredientList = () => {
    const [userIngredients, setUserIngredients] = useState([]);
    const [amounts, setAmounts] = useState({}); // State to hold the amounts for each ingredient
    const [error, setError] = useState(null); // State to manage error messages

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

    const handleSubmit = () => {
        const updates = Object.entries(amounts).map(([ingredient_id, amount]) => ({
            ingredient_id: ingredient_id,
            amount: parseInt(amount) // Convert to integer
        }));

        Promise.all(
            updates.map(({ ingredient_id, amount }) => {
                const payload = {
                    ingredient_name: userIngredients.find(ing => ing.ingredient_id === parseInt(ingredient_id)).name,
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
                // Check if all responses are OK
                responses.forEach(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                });
                console.log('All ingredient amounts updated successfully');
                fetchUserIngredients(); // Refresh the ingredient list after updating
            })
            .catch((error) => {
                console.error('Error updating ingredient amounts:', error);
                setError('Failed to update ingredient amounts. Please try again.'); // Set error message
            });
    };

    return (
        <div>
            <h2>Your Ingredients</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message if any */}
            {userIngredients.length === 0 ? ( // Check if there are no ingredients
                <p>No ingredients found. Please add some ingredients.</p>
            ) : (
                <ul>
                    {userIngredients.map((ingredient) => (
                        <li key={ingredient.ingredient_id}>
                            <strong>{ingredient.name}</strong>
                            <input
                                type="number"
                                placeholder="Amount"
                                value={amounts[ingredient.ingredient_id] || ''} // Display the current amount
                                onChange={(e) => handleAmountChange(ingredient.ingredient_id, e.target.value)}
                            />
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={handleSubmit}>Update Amounts</button> {/* Submit button to update all amounts */}
        </div>
    );
};

export default IngredientList;
