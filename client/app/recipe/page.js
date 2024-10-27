"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import axios from 'axios';
import styles from './RecipePage.module.css'; // Import the CSS module
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userIngredients, setUserIngredients] = useState([]); // State for user ingredients

    // Fetch user ingredients from your API
    const fetchUserIngredients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Corrected template literal
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

    // Fetch recipes based on the user's ingredients
    const fetchRecipes = async () => {
        if (userIngredients.length === 0) return; // Wait until ingredients are fetched

        try {
            const ingredients = userIngredients.join(',');

            const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
                params: {
                    apiKey: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    ingredients: ingredients,
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

                const usedIngredientCount = usedIngredients.length;
                const totalIngredientCount = detailedRecipe.extendedIngredients.length;

                detailedRecipes.push({
                    ...detailedRecipe,
                    usedIngredients,
                    missingIngredients,
                    usedIngredientCount,
                    totalIngredientCount
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

    // Add to Favorites function
    const addToFavorites = async (recipeId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("You must be logged in to save favorites.");
                return;
            }

            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, {
                recipeId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}` // Corrected template literal
                }
            });

            alert(response.data.message || 'Recipe added to your favorites!');
        } catch (error) {
            console.error('Error adding recipe to favorites:', error);
            alert('Failed to add recipe to favorites.');
        }
    };

    useEffect(() => {
        fetchUserIngredients(); // Fetch user ingredients on component mount
    }, []);

    useEffect(() => {
        if (userIngredients.length > 0) {
            fetchRecipes(); // Fetch recipes after user ingredients are fetched
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
                                            className={styles.recipeHeart}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                addToFavorites(recipe.id);
                                            }}
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
