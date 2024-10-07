"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import axios from 'axios';

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]); // State to store the fetched recipes
    const [loading, setLoading] = useState(true); // State for loading indicator
    const [error, setError] = useState(null); // State to store any error during fetch

    // Dummy user data (mock database of ingredients)
    const userIngredients = ['noodles', 'beef', 'salt', 'pepper', 'hoisin sauce', 'garlic', 'scallions', 'soy sauce', 'oyster sauce', 'ginger']; // Replace with real database call

    // Fetch recipes from Spoonacular API based on user ingredients
    const fetchRecipes = async () => {
        try {
            const ingredients = userIngredients.join(','); // Join ingredients for the API call

            // Fetch recipes from Spoonacular API (basic info)
            const response = await axios.get(`https://api.spoonacular.com/recipes/findByIngredients`, {
                params: {
                    apiKey: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    ingredients: ingredients,
                    number: 5 // Limit to 5 recipes (adjust as needed)
                }
            });

            const basicRecipes = response.data;
            const detailedRecipes = [];

            // Fetch detailed information for each recipe
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

                // Check which ingredients are used and which are missing
                detailedRecipe.extendedIngredients.forEach(ingredient => {
                    if (userIngredients.includes(ingredient.name.toLowerCase())) {
                        usedIngredients.push(ingredient.original);
                    } else {
                        missingIngredients.push(ingredient.original);
                    }
                });

                // Push the detailed recipe along with used and missing ingredients
                detailedRecipes.push({
                    ...detailedRecipe,
                    usedIngredients,
                    missingIngredients
                });
            }

            setRecipes(detailedRecipes); // Update state with detailed recipes
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setError(error.message); // Update error state
        } finally {
            setLoading(false); // Set loading to false once fetch is complete
        }
    };

    // useEffect hook to fetch recipes when the component is mounted
    useEffect(() => {
        fetchRecipes();
    }, []); // Empty dependency array ensures the effect runs once on mount

    const renderIngredients = (ingredients) => (
        <ul>
            {ingredients.map((ingredient, i) => (
                <li key={i}>{ingredient}</li> // Display used ingredients
            ))}
        </ul>
    );

    return (
        <div>
            <Navbar />
            <h1>Recipes Based on Your Ingredients</h1>

            {loading ? (
                <p>Loading recipes...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : (
                <div>
                    {recipes.length > 0 ? (
                        <ul>
                            {recipes.map((recipe, index) => (
                                <li key={index}>
                                    <h2>{recipe.title}</h2>
                                    <img src={recipe.image} alt={recipe.title} width="200" />

                                    <h3>Used Ingredients:</h3>
                                    {renderIngredients(recipe.usedIngredients)}

                                    <h3>Missing Ingredients:</h3>
                                    {renderIngredients(recipe.missingIngredients)}

                                    <h3>Instructions:</h3>
                                    {recipe.instructions ? (
                                        <p>{recipe.instructions}</p>
                                    ) : (
                                        <p>No instructions available.</p>
                                    )}

                                    <h3>Nutritional Information:</h3>
                                    {recipe.nutrition ? (
                                        <div>
                                            <p>Calories: {recipe.nutrition.nutrients.find(n => n.name === 'Calories').amount} kcal</p>
                                            <p>Fat: {recipe.nutrition.nutrients.find(n => n.name === 'Fat').amount} g</p>
                                            <p>Carbohydrates: {recipe.nutrition.nutrients.find(n => n.name === 'Carbohydrates').amount} g</p>
                                            <p>Protein: {recipe.nutrition.nutrients.find(n => n.name === 'Protein').amount} g</p>
                                        </div>
                                    ) : (
                                        <p>No nutrition data available.</p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>No recipes found for your ingredients.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default RecipePage;
