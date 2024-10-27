"use client";

import React, { useState, useEffect } from 'react';
import styles from './favoriteinfo.module.css';

const FavoriteInfo = ({ recipe, userId, onClose }) => {
    const [ingredientStatus, setIngredientStatus] = useState({});
    const [missingIngredients, setMissingIngredients] = useState([]);
    const [hasMissingIngredients, setHasMissingIngredients] = useState(false);

    useEffect(() => {
        // Check each ingredient's status for the current user
        const checkIngredients = async () => {
            try {
                const ingredientIds = recipe.extendedIngredients.map((ing) => ing.id);
                const response = await fetch('/api/check-ingredients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, ingredientIds }),
                });
                const data = await response.json();
                setIngredientStatus(data); // { [ingredientId]: true/false }
            } catch (error) {
                console.error('Error checking ingredients', error);
            }
        };

        checkIngredients();
    }, [recipe, userId]);

    const handleUseRecipe = async () => {
        console.log("Using recipe...");
        try {
            const response = await fetch('/api/use-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, ingredients: recipe.extendedIngredients }),
            });

            const result = await response.json();
            console.log('Response:', result); // Log the response

            if (result.missingIngredients && result.missingIngredients.length > 0) {
                // If there are missing ingredients, display them
                console.log('Missing ingredients:', result.missingIngredients); // Log missing ingredients
                setMissingIngredients(result.missingIngredients);
                setHasMissingIngredients(true);
            } else {
                // Close the pop-up if the recipe was successfully used
                console.log('Recipe used successfully'); // Log success
                onClose();
            }
        } catch (error) {
            console.error('Error using recipe:', error);
        }
    };

    if (!recipe) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2>{recipe.title}</h2>

                <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />

                <div className={styles.dietaryLabels}>
                    <p><strong>Dietary Labels:</strong> {recipe.diets.join(', ') || 'N/A'}</p>
                </div>

                <div className={styles.nutritionInfo}>
                    <strong>Nutrition:</strong>
                    <ul>
                        {recipe.nutrition?.nutrients.map((nutrient) => (
                            <li key={nutrient.name}>
                                {nutrient.name}: {nutrient.amount} {nutrient.unit}
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <strong>Ingredients:</strong>
                    <ul>
                        {recipe.extendedIngredients?.map((ingredient) => (
                            <li
                                key={ingredient.id}
                                style={{ color: ingredientStatus[ingredient.id] ? 'black' : 'red' }}
                            >
                                {ingredient.original}
                            </li>
                        ))}
                    </ul>
                </div>

                <p><strong>Cooking Time:</strong> {recipe.readyInMinutes} minutes</p>

                <div className={styles.instructions}>
                    <strong>Instructions:</strong>
                    <ol>
                        {recipe.instructions
                            ? recipe.instructions.split('. ').map((step, index) => (
                                  <li key={index}>{step.trim()}.</li>
                              ))
                            : 'No instructions available.'}
                    </ol>
                </div>

                {/* Display missing ingredients if any */}
                {hasMissingIngredients && (
                    <div className={styles.missingIngredients}>
                        <strong>Missing Ingredients:</strong>
                        <ul>
                            {missingIngredients.map((ingredient) => (
                                <li key={ingredient.id}>{ingredient.name}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Use Recipe Button */}
                <div className={styles.buttonContainer}>
                    <button className={styles.useRecipeButton} onClick={handleUseRecipe}>
                        Use Recipe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FavoriteInfo;
