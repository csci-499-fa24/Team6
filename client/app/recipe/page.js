"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import axios from 'axios';
import styles from './RecipePage.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userIngredients, setUserIngredients] = useState([]);
    const [favorites, setFavorites] = useState(new Set());

    // Fetch user ingredients
    const fetchUserIngredients = async () => {
        try {
            const token = localStorage.getItem('token');
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

    // Fetch recipes
    const fetchRecipes = async () => {
        if (userIngredients.length === 0) return;
        try {
            const ingredients = userIngredients.join(',');
            const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
                params: {
                    apiKey: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    ingredients,
                    number: 3
                }
            });

            const basicRecipes = response.data;
            const detailedRecipes = [];
            for (const recipe of basicRecipes) {
                const recipeDetails = await axios.get(`https://api.spoonacular.com/recipes/${recipe.id}/information`, {
                    params: {
                        apiKey: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                        includeNutrition: true
                    }
                });
                const detailedRecipe = recipeDetails.data;
                const usedIngredients = [];
                const missingIngredients = [];

                detailedRecipe.extendedIngredients.forEach(ingredient => {
                    if (userIngredients.includes(ingredient.name.toLowerCase())) {
                        usedIngredients.push(ingredient.original);
                    } else {
                        missingIngredients.push(ingredient.original);
                    }
                });

                detailedRecipes.push({
                    ...detailedRecipe,
                    usedIngredients,
                    missingIngredients,
                    usedIngredientCount: usedIngredients.length,
                    totalIngredientCount: detailedRecipe.extendedIngredients.length
                });
            }
            setRecipes(detailedRecipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setError('Failed to fetch recipes.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Ensure we are saving favorites as a Set for faster lookup
            if (Array.isArray(response.data.recipes)) {
                const favoriteRecipeIds = new Set(response.data.recipes.map(favorite => favorite.id));
                setFavorites(favoriteRecipeIds);
            } else {
                console.error('Unexpected data format:', response.data);
                setError('Failed to fetch favorite recipes.');
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setError('Failed to fetch favorite recipes.');
        }
    };

    const toggleFavorite = async (recipeId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log("You must be logged in to save favorites.");
                return;
            }

            if (favorites.has(recipeId)) {
                // Use URL parameter for DELETE request
                await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites/${recipeId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFavorites(prev => {
                    const newFavorites = new Set(prev);
                    newFavorites.delete(recipeId);
                    return newFavorites;
                });
                console.log('Recipe removed from favorites!');
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, { recipeId }, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setFavorites(prev => new Set(prev).add(recipeId));
                console.log('Recipe added to favorites!');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    useEffect(() => {
        fetchUserIngredients();
        fetchFavorites(); // Fetch favorites on component mount
    }, []);

    useEffect(() => {
        if (userIngredients.length > 0) {
            fetchRecipes();
        }
    }, [userIngredients]);

    return (
        <div>
            <Navbar />
            <div className={styles.recipePageWrapper}>
                <div className={styles.title}>
                    <div className={styles.recipePageTitle}>Recommended Recipes</div>
                    <div className={styles.recipePageDescription}>Based on your pantry</div>
                </div>
                {loading ? (
                    <p>Loading recipes...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div className={styles.recipesContainer}>
                        {recipes.length > 0 ? (
                            recipes.map((recipe) => (
                                <Link href={`/recipe/${recipe.id}`} key={recipe.id} className={styles.recipeCard}>
                                    <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                                    <div className={styles.recipeTitleWrapper}>
                                        <div className={styles.recipeTitle}>{recipe.title}</div>
                                        <FavoriteBorderIcon
                                            className={`${styles.recipeHeart} ${favorites.has(recipe.id) ? styles.favorite : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                toggleFavorite(recipe.id);
                                            }}
                                            style={{ color: favorites.has(recipe.id) ? 'red' : 'inherit' }}
                                        />
                                    </div>
                                    <div className={styles.recipeInfoWrapper}>
                                        <div className={styles.recipeTime}><AccessTimeIcon className={styles.recipeClock} />{recipe.readyInMinutes} min</div>
                                        <div className={styles.recipeIngredients}><LocalDiningIcon className={styles.recipeClock} />{recipe.usedIngredientCount}/{recipe.totalIngredientCount} Ingredients</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p>No recipes found for your ingredients.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecipePage;
