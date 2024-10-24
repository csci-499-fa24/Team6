"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation'; // Use useParams instead of useRouter
import axios from 'axios';
import Navbar from '../../components/navbar';
import styles from './RecipeDetail.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { CustomCircularProgress } from '../../components/customComponents'
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';


const RecipeDetails = () => {
    const { id } = useParams(); // Get the recipe ID from the URL

    const [recipe, setRecipe] = useState(null);
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

            const usedIngredientCount = usedIngredients.length;
            const totalIngredientCount = detailedRecipe.extendedIngredients.length
            const servings = detailedRecipe.servings

            setRecipe({
                ...detailedRecipe,
                usedIngredients,
                missingIngredients,
                usedIngredientCount,
                totalIngredientCount,
                servings
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

    const renderIngredients = (ingredients, color = "#506264") => (
        <div>
            {ingredients.map((ingredient, i) => (
                <div style={{ color: color }} className={styles.ingredient}>{ingredient}</div>
            ))}
        </div>
    );

    const renderInstructions = (instructions) => {
        if (instructions) {
            const steps = instructions
                .replace(/<\/?ol>/g, '')
                .replace(/<\/?li>/g, '')
                .replace(/&amp;/g, '&') // Decode &amp; to &
                .split('.');

            return (
                <ol className={styles.instructionList}>
                    {steps.map((step, index) => (
                        step.trim() && <li key={index}>{step.trim()}</li>
                    ))}
                </ol>
            );
        } else {
            return <p>No instructions available.</p>;
        }
    };

    const getRoundedNutrientAmount = (nutrientName) => {
        const nutrient = recipe.nutrition.nutrients.find(n => n.name === nutrientName);
        return nutrient ? `${Math.round(nutrient.amount)} ${nutrient.unit}` : 0;
    };

    return (
        <div>
            <Navbar />
            {loading ? (
                <p>Loading recipe details...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : recipe ? (
                <div className={styles.recipeWrapper}>
                    <div className={styles.recipeDetailsWrapper}>
                        <div className={styles.recipeTitle}>{recipe.title}</div>
                        <img className={styles.recipeImage} src={recipe.image} alt={recipe.title} />
                        <div className={styles.recipeStatsWrapper} >
                            <div className={styles.recipeTime}><AccessTimeIcon className={styles.recipeClock} />{recipe.readyInMinutes} min</div>
                            <div className={styles.recipeIngredients}><LocalDiningIcon className={styles.recipeClock} />{recipe.usedIngredientCount}/{recipe.totalIngredientCount} Ingredients</div>
                            <div className={styles.servingSize}><PersonOutlineOutlinedIcon className={styles.recipeClock} />Serves {recipe.servings}</div>
                        </div>
                        <div className={styles.trackerWrapper}>
                            <div className={styles.trackerItem}>
                                <div className={styles.trackerVisual}>
                                    <div className={styles.trackerItemTitle}>Calories</div>
                                    <CustomCircularProgress
                                        value={75}
                                        progressColor="#74DE72"
                                        backgroundColor="#C3F5C2"
                                        size={50}
                                    />
                                </div>
                                <div className={styles.data}> {getRoundedNutrientAmount("Calories")} <span style={{ color: '#74DE72' }}>(30%)</span></div>
                            </div>
                            <div className={styles.trackerItem}>
                                <div className={styles.trackerVisual}>
                                    <div className={styles.trackerItemTitle}>Total Fat</div>
                                    <CustomCircularProgress
                                        value={75}
                                        progressColor="#EC4A27"
                                        backgroundColor="#F5AD9D"
                                        size={50}
                                    />
                                </div>
                                <div className={styles.data}> {getRoundedNutrientAmount("Fat")}  <span style={{ color: '#EC4A27' }}>(30%)</span></div>
                            </div>
                            <div className={styles.trackerItem}>
                                <div className={styles.trackerVisual}>
                                    <div className={styles.trackerItemTitle}>Protein</div>
                                    <CustomCircularProgress
                                        value={75}
                                        progressColor="#72B1F1"
                                        backgroundColor="#B6D9FC"
                                        size={50}
                                    />
                                </div>
                                <div className={styles.data}> {getRoundedNutrientAmount("Protein")}  <span style={{ color: '#72B1F1' }}>(30%)</span></div>
                            </div>
                            <div className={styles.trackerItem}>
                                <div className={styles.trackerVisual}>
                                    <div className={styles.trackerItemTitle}>Saturated Fat</div>
                                    <CustomCircularProgress
                                        value={75}
                                        progressColor="#FF6D99"
                                        backgroundColor="#F5C5CE"
                                        size={50}
                                    />
                                </div>
                                <div className={styles.data}> {getRoundedNutrientAmount("Saturated Fat")}  <span style={{ color: '#FF6D99' }}>(30%)</span></div>
                            </div>
                            <div className={styles.trackerItem}>
                                <div className={styles.trackerVisual}>
                                    <div className={styles.trackerItemTitle}>Carbs</div>
                                    <CustomCircularProgress
                                        value={75}
                                        progressColor="#EBB06C"
                                        backgroundColor="#FFCF96"
                                        size={50}
                                    />
                                </div>
                                <div className={styles.data}> {getRoundedNutrientAmount("Carbohydrates")}  <span style={{ color: '#EBB06C' }}>(30%)</span></div>
                            </div>
                            <div className={styles.trackerItem}>
                                <div className={styles.trackerVisual}>
                                    <div className={styles.trackerItemTitle}>Fiber</div>
                                    <CustomCircularProgress
                                        value={75}
                                        progressColor="#7D975C"
                                        backgroundColor="#C1CBB9"
                                        size={50}
                                    />
                                </div>
                                <div className={styles.data}> {getRoundedNutrientAmount("Fiber")}  <span style={{ color: '#7D975C' }}>(30%)</span></div>
                            </div>
                            <div className={styles.trackerItem}>
                                <div className={styles.trackerVisual}>
                                    <div className={styles.trackerItemTitle}>Sugar</div>
                                    <CustomCircularProgress
                                        value={75}
                                        progressColor="#8893F2"
                                        backgroundColor="#C9C8FF"
                                        size={50}
                                    />
                                </div>
                                <div className={styles.data}> {getRoundedNutrientAmount("Sugar")}  <span style={{ color: '#8893F2' }}>(30%)</span></div>
                            </div>
                            <div className={styles.trackerItem}>
                                <div className={styles.trackerVisual}>
                                    <div className={styles.trackerItemTitle}>Sodium</div>
                                    <CustomCircularProgress
                                        value={75}
                                        progressColor="#9474A3"
                                        backgroundColor="#CBA6DD"
                                        size={50}
                                    />
                                </div>
                                <div className={styles.data}> {getRoundedNutrientAmount("Sodium")}  <span style={{ color: '#9474A3' }}>(30%)</span></div>
                            </div>
                        </div>
                    </div>
                    <div className={styles.recipeInstructionWrapper}>
                        <div className={styles.titleWrapper}>
                            <div className={styles.title}>Ingredients</div>
                            <div className={styles.titleButtons}>
                                <FileDownloadOutlinedIcon className={styles.button}/>
                                <LocalPrintshopOutlinedIcon className={styles.button}/>
                            </div>
                        </div>
                        <div className={styles.ingredientWrapper}>
                            {renderIngredients(recipe.usedIngredients)}
                            {renderIngredients(recipe.missingIngredients, "red")}
                        </div>

                        <div className={styles.title}>Instructions</div>
                        <div className={styles.instructionWrapper}>
                            {renderInstructions(recipe.instructions)}
                        </div>
                        <div className={styles.madeButton}>
                            <div className={styles.madeButtonText}>Cooked</div>
                        </div>
                    </div>
                </div>
            ) : (
                <p>No recipe details found.</p>
            )
            }
        </div >
    );
};

export default RecipeDetails;
