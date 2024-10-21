"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import axios from 'axios';
import styles from './RecipePage.module.css';
import FavoritesPage from './favorites';


const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userIngredients, setUserIngredients] = useState([]); // State for user ingredients
    const [showFavorites, setShowFavorites] = useState(false);

    // Fetch user ingredients from your API
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

    // Fetch recipes based on the user's ingredients
    const fetchRecipes = async () => {
        if (userIngredients.length === 0) return; // Wait until ingredients are fetched

        try {
            const ingredients = userIngredients.join(',');

            const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients`, {
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

                detailedRecipes.push({
                    ...detailedRecipe,
                    usedIngredients,
                    missingIngredients
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

    useEffect(() => {
        fetchUserIngredients(); // Fetch user ingredients on component mount
    }, []);

    useEffect(() => {
        if (userIngredients.length > 0) {
            fetchRecipes(); // Fetch recipes after user ingredients are fetched
        }
    }, [userIngredients]);


    const handleFavoritesClick = () => {
        setShowFavorites(true);
    };

    const handleCloseFavorites = () => {
    setShowFavorites(false);
    };


    return (
        <div>
            <Navbar />
            <h1>Recipes Based on Your Ingredients</h1>
            <button onClick={handleFavoritesClick}>Favorites</button>
            {showFavorites && <FavoritesPage onClose={handleCloseFavorites} />}

            {loading ? (
                <p>Loading recipes...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <div className={styles.gridContainer}>
                    {recipes.length > 0 ? (
                        recipes.map((recipe) => (
                            <Link href={`/recipe/${recipe.id}`} key={recipe.id} className={styles.recipeCard}>
                                <div>
                                    <h2>{recipe.title}</h2>
                                    <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p>No recipes found for your ingredients.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecipePage;
