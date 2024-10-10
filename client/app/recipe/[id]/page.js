"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Use useParams instead of useRouter
import axios from 'axios';
import Navbar from '../../components/navbar';

const RecipeDetails = () => {
    const { id } = useParams(); // Get the recipe ID from the URL

    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userIngredients, setUserIngredients] = useState([]); // State for user ingredients

    // Fetch user ingredients from your API
    const fetchUserIngredients = async () => {
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_SERVER_URL + '/api/user-ingredients');
            const ingredientNames = response.data.map(ingredient => ingredient.name.toLowerCase());
            setUserIngredients(ingredientNames);
        } catch (error) {
            console.error('Error fetching user ingredients:', error);
            setError('Failed to fetch user ingredients.');
        }
    };

    // Fetch recipe details and match ingredients
    const fetchRecipeDetails = async () => {
        try {
            const recipeDetails = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
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

            setRecipe({
                ...detailedRecipe,
                usedIngredients,
                missingIngredients
            });
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserIngredients(); // Fetch user ingredients when component mounts
    }, []);

    useEffect(() => {
        if (userIngredients.length > 0) {
            fetchRecipeDetails(); // Fetch recipe details once user ingredients are available
        }
    }, [userIngredients]);

    const renderIngredients = (ingredients) => (
        <ul>
            {ingredients.map((ingredient, i) => (
                <li key={i}>{ingredient}</li>
            ))}
        </ul>
    );

    const renderInstructions = (instructions) => {
        if (instructions) {
            const steps = instructions
                .replace(/<\/?ol>/g, '')
                .replace(/<\/?li>/g, '')
                .replace(/&amp;/g, '&') // Decode &amp; to &
                .split('.');

            return (
                <ol>
                    {steps.map((step, index) => (
                        step.trim() && <li key={index}>{step.trim()}</li>
                    ))}
                </ol>
            );
        } else {
            return <p>No instructions available.</p>;
        }
    };

    return (
        <div>
            <Navbar />
            {loading ? (
                <p>Loading recipe details...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : recipe ? (
                <div>
                    <h1>{recipe.title}</h1>
                    <img src={recipe.image} alt={recipe.title} />

                    <h3>Used Ingredients:</h3>
                    {renderIngredients(recipe.usedIngredients)}

                    <h3>Missing Ingredients:</h3>
                    {renderIngredients(recipe.missingIngredients)}

                    <h3>Instructions:</h3>
                    {renderInstructions(recipe.instructions)}

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
                </div>
            ) : (
                <p>No recipe details found.</p>
            )}
        </div>
    );
};

export default RecipeDetails;
