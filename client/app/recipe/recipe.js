"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import axios from 'axios';
import styles from './RecipePage.module.css'; // Import the CSS module

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userIngredients = ['noodles', 'beef', 'salt', 'pepper', 'hoisin sauce', 'garlic', 'scallions', 'soy sauce', 'oyster sauce', 'ginger']; 

    const fetchRecipes = async () => {
        try {
            const ingredients = userIngredients.join(',');

            const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients`, {
                params: {
                    apiKey: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    ingredients: ingredients,
                    number: 4
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
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes();
    }, []);

    return (
        <div>
            <Navbar />
            <h1>Recipes Based on Your Ingredients</h1>

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
