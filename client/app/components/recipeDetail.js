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

// Recipe Image component
const RecipeImage = ({ recipe }) => (
    <div className={styles.recipeImageWrapper}>
        <img
            className={styles.recipeImage}
            src={recipe.image || '/assets/noImage.png'} 
            alt={recipe.title}
            onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/assets/noImage.png';
            }} />
        <div className={styles.recipeStatsWrapper}>
            <div className={styles.recipeDetailTime}>{recipe.readyInMinutes} min</div>
            <div className={styles.recipeDetailIngredients}>{recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount} Ingredients</div>
            <div className={styles.servingDetailSize}>Serves {recipe.servings}</div>
        </div>
    </div>
);

// IngredientsList Component
const IngredientsList = ({ usedIngredients = [], missedIngredients = [], onIngredientAdded }) => {
    const storedRecipe = JSON.parse(localStorage.getItem('selectedRecipe'));
    const [mergedIngredients, setMergedIngredients] = useState([
        ...usedIngredients.map(ingredient => ({ ...ingredient, status: 'used' })),
        ...missedIngredients.map(ingredient => ({ ...ingredient, status: 'missed' }))
    ]);

    const handleAddIngredient = async (ingredient) => {
        if (!ingredient) return;

        const payload = {
            ingredient_name: ingredient.name,
            amount: parseInt(ingredient.amount),
            unit: ingredient.unit,
            possibleUnits: ingredient.possibleUnits || []
        };

        const token = localStorage.getItem("token");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/ingredient`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to add ingredient');

            // Update the mergedIngredients state to move this item to "used"
            setMergedIngredients(prevIngredients =>
                prevIngredients.map(ing =>
                    ing.name === ingredient.name ? { ...ing, status: 'used' } : ing
                )
            );

            // Update localStorage
            const storedRecipe = JSON.parse(localStorage.getItem('selectedRecipe'));
            const updatedRecipe = {
                ...storedRecipe,
                usedIngredients: [...storedRecipe.usedIngredients, ingredient],
                missedIngredients: storedRecipe.missedIngredients.filter(ing => ing.name !== ingredient.name)
            };
            localStorage.setItem('selectedRecipe', JSON.stringify(updatedRecipe));

            // Optionally notify parent component of the update
            if (onIngredientAdded) onIngredientAdded(updatedRecipe);
        } catch (error) {
            console.error('Error adding ingredient:', error);
        }
    };

    return (
        <div className={styles.ingredientWrapper}>
            {mergedIngredients.length > 0 ? (
                mergedIngredients.map((ingredient, i) => (
                    <div key={i} className={styles.ingredientContainer}>
                        <div
                            style={{ color: ingredient.status === 'missed' ? "red" : "#506264" }}
                            className={styles.ingredient}
                        >
                            {ingredient.original}
                        </div>
                        {ingredient.status === 'missed' && (
                            <button onClick={() => handleAddIngredient(ingredient)} className={styles.addButton}>
                                Add
                            </button>
                        )}
                    </div>
                ))
            ) : (
                <div className={styles.noIngredientsMessage}>No ingredients available.</div>
            )}
        </div>
    );
};

// InstructionsList Component
const InstructionsList = ({ instructions }) => {
    if (!instructions || instructions.length === 0 || !instructions[0].steps) {
        return <p>No instructions available.</p>;
    }
    return (
        <div>
            <div className={styles.title}>Instructions</div>
            <ol className={styles.instructionList}>
                {instructions[0].steps.map((stepObj, index) => (
                    <li key={index}>{stepObj.step}</li>
                ))}
            </ol>
        </div>
    )
        ;
};

// Nutrient Tracker component
const NutrientTracker = ({ recipe }) => {

    const nutrients = [
        { name: "Calories", color: "#74DE72", backgroundColor: "#C3F5C2" },
        { name: "Total Fat", color: "#EC4A27", backgroundColor: "#F5AD9D" },
        { name: "Protein", color: "#72B1F1", backgroundColor: "#B6D9FC" },
        { name: "Saturated Fat", color: "#FF6D99", backgroundColor: "#F5C5CE" },
        { name: "Carbs", color: "#EBB06C", backgroundColor: "#FFCF96" },
        { name: "Fiber", color: "#7D975C", backgroundColor: "#C1CBB9" },
        { name: "Sugar", color: "#8893F2", backgroundColor: "#C9C8FF" },
        { name: "Sodium", color: "#9474A3", backgroundColor: "#CBA6DD" }
    ];

    const getRoundedNutrientAmount = (nutrientName) => {
        if (!recipe || !recipe.nutrition || !recipe.nutrition.nutrients) {
            return 0;
        }
        const nutrient = recipe.nutrition.nutrients.find(n => n.name === nutrientName);
        return nutrient ? `${Math.round(nutrient.amount)} ${nutrient.unit}` : 0;
    };

    return (
        <div className={styles.trackerWrapper}>
            {nutrients.map((nutrient, index) => (
                <div key={index} className={styles.trackerItem}>
                    <div className={styles.trackerVisual}>
                        <div className={styles.trackerItemTitle}>{nutrient.name}</div>
                        <CustomCircularProgress
                            value={75} // Assuming a static value for progress, you can adjust this as needed
                            progressColor={nutrient.color}
                            backgroundColor={nutrient.backgroundColor}
                            size={50}
                        />
                    </div>
                    <div className={styles.data}>
                        {getRoundedNutrientAmount(nutrient.name)}{" "}
                        <span style={{ color: nutrient.color }}>(30%)</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

// Left Side heading component
const LeftSideHeading = ({ recipe }) => {
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
        <div className={styles.titleWrapper}>
            <div className={styles.title}>Ingredients</div>
            <div className={styles.titleButtons}>
                <FileDownloadOutlinedIcon className={styles.button} onClick={generatePDF} />
                <LocalPrintshopOutlinedIcon className={styles.button} />
            </div>
        </div>
    )
}

// Cooked Button component
const CookedButton = ({ onClick }) => (
    <div className={styles.madeButton} onClick={onClick}>
        <div className={styles.madeButtonText}>Cooked</div>
    </div>
);

//Main
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
                            <RecipeImage recipe={recipe} />
                            <NutrientTracker recipe={recipe} />
                        </div>

                        <div className={styles.recipeInstructionWrapper}>
                            <LeftSideHeading recipe={recipe} />
                            <IngredientsList usedIngredients={recipe.usedIngredients} missedIngredients={recipe.missedIngredients} />
                            <InstructionsList instructions={recipe.instructions} />
                            <CookedButton onClick={handleAdd} />
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
