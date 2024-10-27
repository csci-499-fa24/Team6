"use client";

import React from 'react';
import styles from './favoriteinfo.module.css';

const FavoriteInfo = ({ recipe, onClose }) => {
    if (!recipe) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <button className={styles.closeButton} onClick={onClose}>
                    &times;
                </button>
                <h2>{recipe.title}</h2>
                <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />

                {/* Dietary Labels */}
                {recipe.diets && recipe.diets.length > 0 && (
                    <p><strong>Dietary Labels:</strong> {recipe.diets.join(", ")}</p>
                )}

                {/* Nutrition Info */}
                {recipe.nutrition?.nutrients && (
                    <div>
                        <strong>Nutrition Info:</strong>
                        <ul>
                            {recipe.nutrition.nutrients.map((nutrient) => (
                                <li key={nutrient.name}>
                                    {nutrient.name}: {nutrient.amount} {nutrient.unit}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Cooking Instructions */}
                {recipe.analyzedInstructions?.length > 0 ? (
                    <div>
                        <strong>Instructions:</strong>
                        <ol>
                            {recipe.analyzedInstructions[0].steps.map((step) => (
                                <li key={step.number}>{step.step}</li>
                            ))}
                        </ol>
                    </div>
                ) : (
                    <p>No instructions available.</p>
                )}

                <p>
                    <strong>Cooking Time:</strong> {recipe.readyInMinutes} minutes
                </p>
            </div>
        </div>
    );
};

export default FavoriteInfo;
