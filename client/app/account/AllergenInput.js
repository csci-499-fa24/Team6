
"use client";

import React, { useState, useEffect } from 'react';
import styles from './account.module.css';
import { CustomTextField } from "../components/customComponents.js";
import { AddCircleOutlineRounded, RemoveCircleOutlineRounded } from '@mui/icons-material';
import ErrorScreen from '../components/error';

const AllergenInput = () => {
    const [allergies, setAllergies] = useState([]);
    const [allergy, setAllergy] = useState('');
    const [error, setError] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [debounceTimer, setDebounceTimer] = useState(null);

    // Fetch all allergens on component mount
    useEffect(() => {
        fetchAllergies();
    }, []);

    // Fetch allergens from the backend
    const fetchAllergies = async () => {
        try {
            const token = localStorage.getItem('token'); // Retrieve token from local storage
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/allergies', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setAllergies(data.allergies); // Update allergies state with server data
                setError(null);
            } else {
                setError('Error fetching allergies');
            }
        } catch (err) {
            setError('Error communicating with server');
        }
    };

    // Fetch ingredient suggestions from Spoonacular API
    const fetchIngredients = async (query) => {
        if (!query) return;
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

    
    //handle input change
    const handleInputChange = (event) => {
        const value = event.target.value;
        setAllergy(value);

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

    };

    //handle suggestion select
    const handleSuggestionSelect = (selectedSuggestion) => {
        setAllergy(selectedSuggestion.name);
        setSuggestions([]);
    };

    // Add allergy to backend
    const handleAddAllergy = async () => {
        if (allergy) {
            try {
                const token = localStorage.getItem('token'); // Retrieve token from local storage
                const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/allergies/add`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ allergy })
                });
                if (response.ok) {
                    setError(null);
                    setAllergy(''); // Clear input field
                    fetchAllergies(); // Refresh allergies after adding
                } else {
                    setError('Error adding allergen');
                }
            } catch (err) {
                setError('Error communicating with server');
            }
        }
    };

    //handle key down
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleAddAllergy();
        }
    };

    // Remove allergy from backend
    const handleRemoveAllergy = async (allergyToRemove) => {
        try {
            const token = localStorage.getItem('token'); // Retrieve token from local storage
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + `/api/allergies/remove`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ allergy: allergyToRemove }), // Send the allergy to be removed
            });
            if (response.ok) {
                setError(null);
                fetchAllergies(); // Refresh allergies after removing
            } else {
                setError('Error removing allergen');
            }
        } catch (err) {
            setError('Error communicating with server');
        }
    };

    return (
        <div className={styles.allergiesWrapper}>
            <div className={styles.addAllergy}>
                <div className={styles.allergyInput}>  
                    <div className={styles.textfieldLabel}>Add an allergen</div>
                    <CustomTextField
                        value={allergy}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        size="small"
                    />
                     {suggestions.length > 0 && (
                        <div className={styles.suggestions}> 
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className={styles.suggestionItem}
                                    onClick={() => handleSuggestionSelect(suggestion)}
                                >
                                    {suggestion.name}
                                </div>
                            ))}                            
                        </div>
                    )}              
                </div>
                <AddCircleOutlineRounded onClick={handleAddAllergy} className={styles.addButton} />
            </div>

            <div className={styles.allergies}>
                <div className={styles.header}>Your Food Allergies</div>
                {error && <div className={styles.errorWrapper}><ErrorScreen error={error}/></div>}
                {allergies.length > 0 && (
                    <div className={styles.allergyScrollableContainer}>
                        {allergies.map((item, index) => (
                            <div key={index} className={styles.allergy}>
                                {item}
                                <RemoveCircleOutlineRounded
                                    fontSize="small"
                                    onClick={() => handleRemoveAllergy(item)}
                                    className={styles.removeButton}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllergenInput; 