"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import styles from './favorite.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import FavoriteInfo from './favoriteInfo';

const FavoritePage = () => {
    const [favorites, setFavorites] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user's favorite recipes
    const fetchFavoriteRecipes = async (token) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch favorites.');
            }

            const data = await response.json();
            setFavorites(data.recipes);
        } catch (error) {
            console.error('Error fetching favorite recipes:', error);
            setError('Failed to load your favorite recipes.');
        } finally {
            setLoading(false);
        }
    };

    const removeFavoriteRecipe = async (recipeId, token) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ recipeId }),
            });

            if (!response.ok) {
                throw new Error('Failed to remove favorite.');
            }

            setFavorites((prevFavorites) =>
                prevFavorites.filter((recipe) => recipe.id !== recipeId)
            );
        } catch (error) {
            console.error('Error removing favorite recipe:', error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        fetchFavoriteRecipes(token);
    }, []);

    const handleRecipeClick = (recipe) => {
        setSelectedRecipe(recipe);
    };

    const closeRecipeInfo = () => {
        setSelectedRecipe(null);
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

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
                                <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                                <div className={styles.recipeTitleWrapper}>
                                    <div className={styles.recipeTitle}>{recipe.title}</div>
                                    <FavoriteIcon
                                        className={styles.recipeHeart}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFavoriteRecipe(recipe.id, localStorage.getItem('token'));
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
                                        {recipe.extendedIngredients?.length || 0} Ingredients
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No favorite recipes yet.</p>
                    )}
                </div>
            </div>

            {/* Display FavoriteInfo component when a recipe is selected */}
            {selectedRecipe && <FavoriteInfo recipe={selectedRecipe} onClose={closeRecipeInfo} />}
        </div>
    );
};

export default FavoritePage;
