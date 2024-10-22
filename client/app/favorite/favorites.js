"use client";

import React, { useState } from 'react';
import Navbar from '../components/navbar';
import styles from './favorite.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

const FavoritePage = () => {
    const [favorites, setFavorites] = useState([
        {
            id: 1,
            title: 'Butter Chicken',
            readyInMinutes: 45,
            usedIngredientCount: 0,
            totalIngredientCount: 4,
            image: '',
        },
        {
            id: 2,
            title: 'Chicken Broccoli',
            readyInMinutes: 45,
            usedIngredientCount: 0,
            totalIngredientCount: 4,
            image: '',
        },
    ]);

    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isPopupOpen, setPopupOpen] = useState(false);

    const handleRecipeClick = (recipe) => {
        setSelectedRecipe(recipe);
        setPopupOpen(true);
    };

    const handleClosePopup = () => {
        setPopupOpen(false);
        setSelectedRecipe(null);
    };

    const handleUseRecipe = () => {
        // Currently just closes the pop-up; modify later for actual functionality
        setPopupOpen(false);
        setSelectedRecipe(null);
        console.log(`Using recipe: ${selectedRecipe.title}`); // Optional: Log action
    };

    const handleRemoveFavorite = (recipeId) => {
        setFavorites((prevFavorites) =>
            prevFavorites.filter(recipe => recipe.id !== recipeId)
        );
    };

    return (
        <div>
            <Navbar />
            <div className={styles.recipePageWrapper}>
                <div className={styles.title}>
                    <div className={styles.recipePageTitle}>Your Favorite Recipes</div>
                    <div className={styles.recipePageDescription}>Based on your selections</div>
                </div>
                <div className={styles.recipesContainer}>
                    {favorites.length > 0 ? (
                        favorites.map((recipe) => (
                            <div
                                key={recipe.id}
                                className={styles.recipeCard}
                                onClick={() => handleRecipeClick(recipe)}
                            >
                                <div className={styles.recipeImagePlaceholder} />
                                <div className={styles.recipeTitleWrapper}>
                                    <div className={styles.recipeTitle}>{recipe.title}</div>
                                    <FavoriteBorderIcon
                                        className={styles.recipeHeart}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFavorite(recipe.id);
                                        }}
                                    />
                                </div>
                                <div className={styles.recipeInfoWrapper}>
                                    <div className={styles.recipeTime}>
                                        <AccessTimeIcon className={styles.recipeClock} />
                                        {recipe.readyInMinutes} min
                                    </div>
                                    <div className={styles.recipeIngredients}>
                                        <LocalDiningIcon className={styles.recipeClock} />
                                        {recipe.usedIngredientCount}/{recipe.totalIngredientCount} Ingredients
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No favorite recipes yet.</p>
                    )}
                </div>
            </div>

            {isPopupOpen && selectedRecipe && (
                <div className={styles.popupOverlay}>
                    <div className={styles.popup}>
                        <button className={styles.closeButton} onClick={handleClosePopup}>Close</button>
                        <img src={selectedRecipe.image} alt={selectedRecipe.title} className={styles.popupImage} />
                        <h2 className={styles.popupTitle}>{selectedRecipe.title}</h2>
                        <p className={styles.popupTime}>{selectedRecipe.readyInMinutes} min</p>
                        <h3>Ingredients:</h3>
                        <p>Placeholder</p>
                        <h3>Instructions:</h3>
                        <p>Placeholder</p>
                        <button className={styles.useRecipeButton} onClick={handleUseRecipe}>Use Recipe</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FavoritePage;
