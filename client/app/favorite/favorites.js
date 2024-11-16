"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import styles from './favorite.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import LoadingScreen from '../components/loading';
import ErrorScreen from '../components/error';
import FavoriteButton from '../components/addAndRemoveFavorites';
import Link from 'next/link';

const FavoritePage = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userIngredients, setUserIngredients] = useState([]);

    const fetchFavoriteRecipes = async (token) => {
        try {
            await new Promise((resolve) => setTimeout(resolve, 500));
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

    const fetchUserIngredients = async (token) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            const ingredientNames = data.map(ingredient => ingredient.name.toLowerCase());
            setUserIngredients(ingredientNames);
        } catch (error) {
            console.error('Error fetching user ingredients:', error);
            setError('Failed to fetch user ingredients.');
        }
    };

    const toggleFavoriteState = (recipeId, isFavorite) => {
        setFavorites((prevFavorites) =>
            isFavorite
                ? [...prevFavorites, { id: recipeId }]
                : prevFavorites.filter((recipe) => recipe.id !== recipeId)
        );
    };

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            setError('User not authenticated');
            setLoading(false);
            return;
        }

        fetchFavoriteRecipes(token);
        fetchUserIngredients(token);
    }, []);

    if (loading) return <div className={styles.favoriteWrapper}><Navbar/><LoadingScreen title='your favorite recipes' className={styles.loadingScreen}/></div>;
    if (error) return <div className={styles.favoriteWrapper}><Navbar/><ErrorScreen error={error} className={styles.loadingScreen}/></div>;

    return (
        <div className={styles.favoriteWrapper}>
            <Navbar />
            <div className={styles.recipePageWrapper}>
                <div className={styles.title}>
                    <div className={styles.recipePageTitle}>Your Favorite Recipes</div>
                    <div className={styles.recipePageDescription}>Based on your selections</div>
                </div>
                <div className={styles.recipesContainer}>
                    {favorites.length > 0 ? (
                        favorites.map((recipe) => (
                            <Link
                                href={`/discover/${recipe.id}`}
                                key={recipe.id}
                                className={styles.recipeCard}
                                onClick={() => {
                                    localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                                }}
                            >
                                <img
                                    src={recipe.image || '/assets/noImage.png'}
                                    alt={recipe.title}
                                    className={styles.recipeImage}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/assets/noImage.png';
                                    }}
                                />
                                <div className={styles.recipeTitleWrapper}>
                                    <div className={styles.recipeTitle}>{recipe.title}</div>
                                    <FavoriteButton
                                        recipeId={recipe.id}
                                        isFavorite={true}
                                        onToggleFavorite={(isFavorite) => toggleFavoriteState(recipe.id, isFavorite)}
                                    />
                                </div>
                                <div className={styles.recipeInfoWrapper}>
                                    <div className={styles.recipeTime}>
                                        <AccessTimeIcon className={styles.recipeClock} />
                                        {recipe.readyInMinutes} min
                                    </div>
                                    <div className={styles.recipeIngredients}>
                                        <LocalDiningIcon className={styles.recipeClock} />
                                        {recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount} Ingredients
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>No favorite recipes yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FavoritePage;
