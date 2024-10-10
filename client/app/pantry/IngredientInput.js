"use client";

import React, { useState } from 'react';
import styles from './pantry.module.css';


const IngredientInput = () => {
    const [ingredient, setIngredient] = useState('');
    const [amount, setAmount] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState(null);

    // Fetch ingredients from Spoonacular API
    const fetchIngredients = async (query) => {
        try {
            const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
            const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?query=${query}&number=5&apiKey=${apiKey}`);
            const data = await response.json();
            setSuggestions(data); // Update suggestions with the fetched data
        } catch (error) {
            console.error('Error fetching ingredients:', error);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setIngredient(value);

        if (value.length > 0) {
            fetchIngredients(value); // Fetch suggestions as the user types
        } else {
            setSuggestions([]); // Clear suggestions if the input is empty
        }

        setSelectedIngredient(null); // Clear selected ingredient when typing
    };

    const handleSuggestionClick = (suggestion) => {
        setIngredient(suggestion.name);
        setSelectedIngredient(suggestion);
        setSuggestions([]); // Clear suggestions after selection
    };

    const handleAdd = () => {
        // Log the values for debugging
        console.log('Selected Ingredient:', selectedIngredient);
        console.log('Amount:', amount);

        if (selectedIngredient && amount) { // Check if both ingredient and amount are provided
            const payload = {
                ingredient_name: selectedIngredient.name, // Adjust based on your API
                user_id: 1, // Replace with actual user ID
                amount: parseInt(amount), // Ensure amount is an integer
            };

            // Send the ingredient and amount to the backend API
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
                    // Optionally reset the form
                    setIngredient('');
                    setAmount(''); // Reset amount as well
                    setSuggestions([]);
                })
                .catch((error) => {
                    console.error('Error adding ingredient:', error);
                });
        } else {
            console.error('Please select an ingredient and specify an amount.');
        }
    };


    return (
        <div>
            <div className={styles.header}>Add an ingredient</div>
            <input
                type="text"
                value={ingredient}
                onChange={handleInputChange}
                placeholder="Type an ingredient"
            />
            {suggestions.length > 0 && (
                <ul>
                    {suggestions.map((suggestion) => (
                        <li key={suggestion.id} onClick={() => handleSuggestionClick(suggestion)}>
                            <img src={suggestion.image} alt={suggestion.name} width="50" height="50"/>
                            <div>
                                <strong>{suggestion.name}</strong>
                                <p>Aisle: {suggestion.aisle}</p>

                            </div>
                        </li>
                    ))}
                </ul>
            )}
            <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)} // This should correctly set the amount
                placeholder="Amount"
            />
            <button onClick={handleAdd}>Add</button>
        </div>
    );
};

export default IngredientInput;
