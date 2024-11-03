"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import Navbar from '../../components/navbar';
import styles from './RecipeDetail.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { CustomCircularProgress } from '../../components/customComponents';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

const RecipeDetail = ({ params }) => {
    const router = useRouter();
    const { id } = params;
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRecipeDetails = async () => {
        try {
            const recipeDetails = await axios.get(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${id}/information`, {
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
                },
                params: {
                    includeNutrition: true
                }
            });
            setRecipe(recipeDetails.data);
        } catch (error) {
            console.error('Error fetching recipe details:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipeDetails();
    }, [id]);

    const handleAddRecipe = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/plan/add-recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ recipeId: id })
            });

            await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/discover/auto-remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ingredients: recipe.extendedIngredients })
            });

        } catch (error) {
            console.error('Error adding recipe:', error);
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

    const getRoundedNutrientAmount = (nutrientName) => {
        const nutrient = recipe?.nutrition?.nutrients?.find(n => n.name === nutrientName);
        return nutrient ? `${Math.round(nutrient.amount)} ${nutrient.unit}` : '0';
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!recipe) return <div>No recipe found</div>;

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
                        {[
                            { title: "Calories", nutrient: "Calories", color: "#74DE72", bgColor: "#C3F5C2" },
                            { title: "Total Fat", nutrient: "Fat", color: "#EC4A27", bgColor: "#F5AD9D" },
                            { title: "Protein", nutrient: "Protein", color: "#72B1F1", bgColor: "#B6D9FC" },
                            { title: "Saturated Fat", nutrient: "Saturated Fat", color: "#FF6D99", bgColor: "#F5C5CE" },
                            { title: "Carbs", nutrient: "Carbohydrates", color: "#EBB06C", bgColor: "#FFCF96" },
                            { title: "Fiber", nutrient: "Fiber", color: "#7D975C", bgColor: "#C1CBB9" },
                            { title: "Sugar", nutrient: "Sugar", color: "#8893F2", bgColor: "#C9C8FF" },
                            { title: "Sodium", nutrient: "Sodium", color: "#9474A3", bgColor: "#CBA6DD" }
                        ].map((item, index) => (
                            <div key={index} className={styles.trackerItem}>
                                <div className={styles.trackerVisual}>
                                    <div className={styles.trackerItemTitle}>{item.title}</div>
                                    <CustomCircularProgress
                                        value={75}
                                        progressColor={item.color}
                                        backgroundColor={item.bgColor}
                                        size={50}
                                    />
                                </div>
                                <div className={styles.data}>
                                    {getRoundedNutrientAmount(item.nutrient)} <span style={{ color: item.color }}>(30%)</span>
                                </div>
                            </div>
                        ))}
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
                    <div className={styles.madeButton} onClick={handleAddRecipe}>
                        <div className={styles.madeButtonText}>I Made This</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeDetail;
