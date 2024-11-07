"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/navbar';
import styles from '@/app/components/recipeDetail.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { CustomCircularProgress } from '@/app/components/customComponents'
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import jsPDF from 'jspdf';
import axios from 'axios';

const RecipeDetails = ({ params }) => {
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setEarror] = useState(null);

    const fetchRecipeDetails = async (recipeIds) => {
        const storedRecipe = JSON.parse(localStorage.getItem('selectedRecipe'));

        console.log("call api")
        try {
            setLoading(true);  // Set loading to true when fetching data
            // Make a request to fetch the recipe details in bulk (using the recipeIds)
            const recipeDetails = await axios.get(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk`, {
                params: {
                    ids: recipeIds,  // Assuming recipeIds is an array of IDs
                    includeNutrition: true,
                },
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
                }
            });

            // Merge storedRecipe and detailedRecipe based on `id` (or `title` if you prefer)
            const combinedRecipe = {
                ...storedRecipe, // Spread basic recipe data
                id: recipeDetails.data[0].id,
                image: recipeDetails.data[0].image,
                title: recipeDetails.data[0].title,
                readyInMinutes: recipeDetails.data[0].readyInMinutes,
                instructions: recipeDetails.data[0].analyzedInstructions, // Add detailed instructions
                nutrition: recipeDetails.data[0].nutrition, // Add nutrition info
                servings: recipeDetails.data[0].servings, // Add nutrition info
                usedIngredients: recipeDetails.data[0].extendedIngredients


            };
            // Save combinedRecipes to state or localStorage
            setRecipe(combinedRecipe);

            // Save combinedRecipes to localStorage if needed
            localStorage.setItem('selectedRecipe', JSON.stringify(combinedRecipe));

        } catch (error) {
            console.error('Error fetching recipe details:', error);
        } finally {
            setLoading(false);  // Set loading to false after the fetch is complete
        }
    };

    useEffect(() => {
        const storedRecipe = JSON.parse(localStorage.getItem('selectedRecipe'));

        if (storedRecipe) {
            setRecipe(storedRecipe);
            // Check if instructions or nutrients are missing
            if (!storedRecipe.instructions || !storedRecipe.nutrition?.nutrients) {
                console.log("no instruction or nutrients")
                fetchRecipeDetails(storedRecipe.id);
            } else {
                setLoading(false);
            }
        } else {
            fetchRecipeDetails(params);
            setLoading(false);
        }
    }, []);

    const renderIngredients = (usedIngredients = [], missedIngredients = []) => {
        const mergedIngredients = [
            ...usedIngredients.map(ingredient => ({ ...ingredient, status: 'used' })),
            ...missedIngredients.map(ingredient => ({ ...ingredient, status: 'missed' }))
        ];

    return (
            <div className={styles.ingredientWrapper}>
                {mergedIngredients.length > 0 ? (
                    mergedIngredients.map((ingredient, i) => (
                        <div
                            key={i}
                            style={{ color: ingredient.status === 'missed' ? "red" : "#506264" }}
                            className={styles.ingredient}
                        >
                            {ingredient.original}
                        </div>
                    ))
                ) : (
                    <div className={styles.noIngredientsMessage}>No ingredients available.</div>
                )}
            </div>
        );
    };

    const renderInstructions = (instructions) => {
        if (!instructions || instructions.length === 0 || !instructions[0].steps) {
            return <p>No instructions available.</p>;
        }
        return (
            <ol className={styles.instructionList}>
                {instructions[0].steps.map((stepObj, index) => (
                    <li key={index}>{stepObj.step}</li>
                ))}
            </ol>
        );
    };

    const handleAdd = async () => {
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
                body: JSON.stringify({ recipeId: recipe.id })
            });

            await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/discover/auto-remove', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ingredients: recipe.usedIngredients })
            });

        } catch (error) {
            console.error('Error adding recipe:', error);
        }
    };

    const getRoundedNutrientAmount = (nutrientName) => {
        if (!recipe || !recipe.nutrition || !recipe.nutrition.nutrients) {
            return 0;
        }
        const nutrient = recipe.nutrition.nutrients.find(n => n.name === nutrientName);
        return nutrient ? `${Math.round(nutrient.amount)} ${nutrient.unit}` : 0;
    };

    const generatePDF = () => {
        const doc = new jsPDF();
        const margin = 10; // Define side margin
        const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
        const columnWidth = pageWidth / 2; // Divide page into two columns
        let verticalOffset = 15;
        doc.setFont("Courier", "normal");

        // Title
        doc.setFontSize(16);
        const titleLines = doc.splitTextToSize(recipe.title, pageWidth); // Split title if it exceeds the page width
        titleLines.forEach((line, index) => {
            doc.text(line, margin, verticalOffset + (index * 10)); // Move vertical position down for each line
            doc.setLineWidth(0.5);
            doc.line(margin, verticalOffset + (index * 10) + 2, margin + doc.getTextWidth(line), verticalOffset + (index * 10) + 2); // Underline each title line
        });
        verticalOffset += titleLines.length * 10;

        // Recipe details
        doc.setFontSize(12);
        doc.text(`Ready in: ${recipe.readyInMinutes} minutes`, margin, verticalOffset);
        verticalOffset += 10;
        doc.text(`Serves: ${recipe.servings} people`, margin, verticalOffset);
        verticalOffset += 10;

        // Ingredients & Missing Ingredients side by side
        // Ingredients Title
        const startY = verticalOffset;
        doc.text('Ingredients:', margin, verticalOffset);
        doc.setLineWidth(0.5);
        doc.line(margin, verticalOffset + 2, margin + doc.getTextWidth('Ingredients:'), verticalOffset + 2); // Underline Ingredients title
        verticalOffset += 10;

        // Missing Ingredients Title
        const missingIngredientsOffset = margin + columnWidth; // Start missing ingredients on the right side
        const missingIngredientsY = startY; // Save the y position for missing ingredients title
        doc.text('Missing Ingredients:', missingIngredientsOffset, missingIngredientsY);
        doc.setLineWidth(0.5);
        doc.line(missingIngredientsOffset, missingIngredientsY + 2, missingIngredientsOffset + doc.getTextWidth('Missing Ingredients:'), missingIngredientsY + 2); // Underline Missing Ingredients title

        // Track vertical offsets for both sections
        let ingredientsVerticalOffset = verticalOffset;
        let missingIngredientsVerticalOffset = verticalOffset;

        // List of Ingredients
        recipe.usedIngredients.forEach((ingredient) => {
            const lines = doc.splitTextToSize(`[ ] ${ingredient.name}`, columnWidth - margin);  // Split the ingredient line if it exceeds the page width
            lines.forEach((line) => {
                if (ingredientsVerticalOffset > doc.internal.pageSize.getHeight() - margin) { // if the line goes off the page, make a new page and reset y position
                    doc.addPage();
                    ingredientsVerticalOffset = 15;
                }
                doc.text(line, margin, ingredientsVerticalOffset);
                ingredientsVerticalOffset += 10;
            });
        });

        // List of Missing Ingredients
        verticalOffset = startY + 10; // Reset vertical offset for missing ingredients
        recipe.missedIngredients.forEach((ingredient) => {
            const lines = doc.splitTextToSize(`[ ] ${ingredient.name}`, columnWidth - margin);  // Split the ingredient line if it exceeds the page width
            lines.forEach((line) => {
                if (missingIngredientsVerticalOffset > doc.internal.pageSize.getHeight() - margin) { // if the line goes off the page, make a new page and reset y position
                    doc.addPage();
                    missingIngredientsVerticalOffset = 15;
                }
                doc.text(line, missingIngredientsOffset, missingIngredientsVerticalOffset);
                missingIngredientsVerticalOffset += 10;
            });
        });

        // Set the offset to the taller section for instructions
        verticalOffset = Math.max(ingredientsVerticalOffset, missingIngredientsVerticalOffset) - 10; // Add space before instructions

        // Instructions
        verticalOffset += 10;
        doc.text('Instructions:', margin, verticalOffset);
        doc.setLineWidth(0.5);
        doc.line(margin, verticalOffset + 2, margin + doc.getTextWidth('Instructions:'), verticalOffset + 2); // Underline Instructions title
        verticalOffset += 10;

        recipe.instructions[0].steps.forEach((step, index) => {
            const lines = doc.splitTextToSize(`${index + 1}. ${step.step}`, pageWidth);  // Split the instruction line if it exceeds the page width
            lines.forEach((line) => {
                if (verticalOffset > doc.internal.pageSize.getHeight() - margin) { // if the line goes off the page, make a new page and reset y position
                    doc.addPage();
                    verticalOffset = 15;
                }
                doc.text(line, margin, verticalOffset);
                verticalOffset += 10;
            });
        });

        // Save PDF
        doc.save(`${recipe.title}.pdf`);
    };

    return (
        <div className={styles.recipeDetailsWrapper}>
            <Navbar />
            {loading ? (
                <p>Loading recipe details...</p>
            ) : error ? (
                <p>Error: {error}</p>
            ) : recipe ? (
                <div className={styles.recipeWrapper}>
                    <div className={styles.recipeTitle}>{recipe.title}</div>
                    <div className={styles.recipeContent}>
                        <div className={styles.recipeLeft}>
                            <div className={styles.recipeImageWrapper}>
                                <img className={styles.recipeImage} src={recipe.image} alt={recipe.title} />
                                <div className={styles.recipeStatsWrapper} >
                                    <div className={styles.recipeDetailTime}><AccessTimeIcon className={styles.recipeClock} />{recipe.readyInMinutes} min</div>
                                    <div className={styles.recipeDetailIngredients}><LocalDiningIcon className={styles.recipeClock} />{recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount} Ingredients</div>
                                    <div className={styles.servingDetailSize}><PersonOutlineOutlinedIcon className={styles.recipeClock} />Serves {recipe.servings}</div>
                                </div>
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
                                    <FileDownloadOutlinedIcon className={styles.button} onClick={generatePDF} />
                                    <LocalPrintshopOutlinedIcon className={styles.button} />
                                </div>
                            </div>
                            {renderIngredients(recipe.usedIngredients, recipe.missedIngredients)}
                            <div className={styles.title}>Instructions</div>
                            <div className={styles.instructionWrapper}>
                                {renderInstructions(recipe.instructions)}
                            </div>
                            <div className={styles.madeButton} onClick={handleAdd}>
                                <div className={styles.madeButtonText}>Cooked</div>
                            </div>
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