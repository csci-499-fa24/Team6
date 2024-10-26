'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../../components/navbar';
import styles from './RecipeDetailPage.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import { CustomCircularProgress } from '../../components/customComponents';

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
            const response = await axios.get(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeId}/information`, {
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY, 
                    'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
                },
                params: {
                    includeNutrition: true,
                }
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

            await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/plan/remove-recipe', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ recipeId: id }),
            });
        } catch (error) {
            console.error('Error removing recipe:', error);
        }
    };

    const renderIngredients = (ingredients, color = "#506264") => (
        <div>
            {ingredients?.map((ingredient, i) => (
                <div key={i} style={{ color: color }} className={styles.ingredient}>
                    {ingredient.original}
                </div>
            ))}
        </div>
    );

    const renderInstructions = (instructions) => {
        if (instructions) {
            const steps = instructions
                .replace(/<\/?ol>/g, '')
                .replace(/<\/?li>/g, '')
                .replace(/&amp;/g, '&')
                .split('.');

            return (
                <ol className={styles.instructionList}>
                    {steps.map((step, index) => (
                        step.trim() && <li key={index}>{step.trim()}</li>
                    ))}
                </ol>
            );
        }
        return <p>No instructions available.</p>;
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
            <div className={styles.recipeWrapper}>
                <div className={styles.recipeDetailsWrapper}>
                    <div className={styles.recipeTitle}>{recipe.title}</div>
                    <img className={styles.recipeImage} src={recipe.image} alt={recipe.title} />
                    <div className={styles.recipeStatsWrapper}>
                        <div className={styles.recipeTime}>
                            <AccessTimeIcon className={styles.recipeClock} />
                            {recipe.readyInMinutes} min
                        </div>
                        <div className={styles.recipeIngredients}>
                            <LocalDiningIcon className={styles.recipeClock} />
                            {recipe.extendedIngredients.length} Ingredients
                        </div>
                        <div className={styles.servingSize}>
                            <PersonOutlineOutlinedIcon className={styles.recipeClock} />
                            Serves {recipe.servings}
                        </div>
                    </div>
                    <div className={styles.trackerWrapper}>
                        {/* Tracker details similar to previous */}
                    </div>
                </div>
                <div className={styles.recipeInstructionWrapper}>
                    <div className={styles.titleWrapper}>
                        <div className={styles.title}>Ingredients</div>
                        <div className={styles.titleButtons}>
                            <FileDownloadOutlinedIcon className={styles.button} />
                            <LocalPrintshopOutlinedIcon className={styles.button} />
                        </div>
                    </div>
                    <div className={styles.ingredientWrapper}>
                        {renderIngredients(recipe.extendedIngredients)}
                    </div>

                    <div className={styles.title}>Instructions</div>
                    <div className={styles.instructionWrapper}>
                        {renderInstructions(recipe.instructions)}
                    </div>
                    <div className={styles.madeButton} onClick={handleRemoveRecipe}>
                        <div className={styles.madeButtonText}>Remove from Plan</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetailPlan;
