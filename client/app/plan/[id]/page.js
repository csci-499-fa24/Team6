'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/navbar';
import styles from './RecipeDetailPage.module.css';

const RecipeDetailPlan = ({ params }) => {
    const { id } = params; 
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchRecipeDetail(id);
        }
    }, [id]);

    const fetchRecipeDetail = async (recipeId) => {
        try {
            const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
                params: {
                    apiKey: process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    includeNutrition: true,
                },
            });

            setRecipe(response.data);
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            setError('Failed to load recipe details.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveRecipe = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/plan/remove-recipe', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ recipeId: id })
            });


        } catch (error) {
            console.error('Error adding recipe:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <Navbar />
            <div className={styles.recipeContainer}>
                <h1>{recipe.title}</h1>
                <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                
                <div className={styles.detailsSection}>
                    <h2>Ingredients</h2>
                    <ul className={styles.ingredientList}>
                        {recipe.extendedIngredients.map((ingredient) => (
                            <li key={ingredient.id}>{ingredient.original}</li>
                        ))}
                    </ul>
                </div>

                <div className={styles.detailsSection}>
                    <h2>Instructions</h2>
                    <ol className={styles.instructionsList}>
                        {recipe?.analyzedInstructions[0]?.steps
                            .filter(step => step.step.length > 20)
                            .map((step) => (
                                <li key={step.number}>{step.step}</li>
                            ))
                        }
                    </ol>
                </div>

                <div className={styles.detailsSection}>
                    <h2>Nutrition Facts</h2>
                    <p>Calories: {recipe.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount} kcal</p>
                    <p>Protein: {recipe.nutrition?.nutrients.find(n => n.name === 'Protein')?.amount} g</p>
                    <p>Fat: {recipe.nutrition?.nutrients.find(n => n.name === 'Fat')?.amount} g</p>
                    <p>Carbs: {recipe.nutrition?.nutrients.find(n => n.name === 'Carbohydrates')?.amount} g</p>
                </div>
                <button onClick={handleRemoveRecipe}>Remove From Plan</button>
            </div>
        </div>
    );
};

export default RecipeDetailPlan;
