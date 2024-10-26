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
            const headers = {
                'x-rapidapi-key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            };

            const ingredients = userIngredients.join(',');

            const response = await axios.get(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients`, {
                params: {
                    ingredients: ingredients,
                    ignorePantry: false,
                    number: 3
                },
                headers
            });

            const basicRecipes = response.data;
            setRecipes(basicRecipes)
            const recipeIds = basicRecipes.map(recipe => recipe.id).join(',');

            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            await delay(1000);
            const recipeDetails = await axios.get(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk`, {
                params: {
                    ids: recipeIds,
                    includeNutrition: true,
                },
                headers
            });

            const combinedRecipes = basicRecipes.map(basicRecipe => {
                const detailedRecipe = recipeDetails.data.find(detailed => detailed.id === basicRecipe.id);
                return {
                    ...basicRecipe,
                    readyInMinutes: detailedRecipe ? detailedRecipe.readyInMinutes : null, 
                    instructions: detailedRecipe ? detailedRecipe.analyzedInstructions : null, 
                    nutrition: detailedRecipe ? detailedRecipe.nutrition : null, 
                    servings: detailedRecipe ? detailedRecipe.servings : null, 
                };
            });

            setRecipes(combinedRecipes);

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
console.log(recipes)
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
                                <Link
                                    href={{ pathname: `/recipe/${recipe.id}` }}
                                    key={recipe.id}
                                    className={styles.recipeCard}
                                    onClick={() => {
                                        localStorage.setItem('selectedRecipe', JSON.stringify(recipe)); 
                                    }}
                                >
                                    <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                                    <div className={styles.recipeTitleWrapper}>
                                        <div className={styles.recipeTitle} >{recipe.title}</div>
                                        <FavoriteBorderIcon className={styles.recipeHeart} />
                                    </div>
                                    <div className={styles.recipeInfoWrapper}>
                                        <div className={styles.recipeTime}><AccessTimeIcon className={styles.recipeClock} />{recipe.readyInMinutes} min</div>
                                        <div className={styles.recipeIngredients}><LocalDiningIcon className={styles.recipeClock} />{recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount} Ingredients</div>
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
