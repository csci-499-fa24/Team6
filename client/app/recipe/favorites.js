"use client";

import React, { useState } from 'react';
import styles from './Favorites.module.css';

const sampleFavorites = [
    { title: 'Fried Rice', image: '' },
    { title: 'Butter Chicken', image: '' }
];

const Favorites = ({ favorites, onClose, removeFavorite }) => {
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const handleRecipeClick = (recipe) => {
        setSelectedRecipe(recipe);
    };

    const handleCloseDetails = () => {
        setSelectedRecipe(null);
    };

    const handleUseRecipe = () => {
        alert(`Using recipe: ${selectedRecipe.title}`);
        handleCloseDetails();
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.popup}>
                <h2>Your Favorites</h2>
                <button onClick={onClose}>Close</button>
                {favorites.length > 0 ? (
                    <ul>
                        {favorites.map((recipe, index) => (
                            <li key={index} className={styles.favoriteItem}>
                                <h3 onClick={() => handleRecipeClick(recipe)} className={styles.clickable}>
                                    {recipe.title}
                                </h3>
                                <div className={styles.imagePlaceholder}></div>
                                <button className={styles.removeButton} onClick={() => removeFavorite(index)}>Remove</button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No favorites yet.</p>
                )}
                {selectedRecipe && (
                    <div className={styles.detailsOverlay}>
                        <div className={styles.detailsPopup}>
                            <h2>{selectedRecipe.title}</h2>
                            {selectedRecipe.image ? (
                                <img src={selectedRecipe.image} alt={selectedRecipe.title} />
                            ) : (
                                <div className={styles.placeholder}></div>
                            )}
                            <h3>Ingredients</h3>
                            <p>Temporary</p>
                            <h3>How to Prepare</h3>
                            <p>Temporary</p>
                            <button onClick={handleCloseDetails}>Close</button>
                            <button onClick={handleUseRecipe}>Use Recipe</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const FavoritesPage = ({ onClose }) => {
    const [favorites, setFavorites] = useState(sampleFavorites);

    const removeFavorite = (index) => {
        setFavorites((prevFavorites) =>
            prevFavorites.filter((_, i) => i !== index)
        );
    };

    return (
        <div>
            <Favorites favorites={favorites} onClose={onClose} removeFavorite={removeFavorite} />
        </div>
    );
};

export default FavoritesPage;
