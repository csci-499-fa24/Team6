"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/app/components/navbar';
import styles from '@/app/components/recipeDetail.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import { CustomCircularProgress, CustomTextField, CustomDropdown } from '@/app/components/customComponents'
import { MenuItem } from '@mui/material';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import jsPDF from 'jspdf';
import axios from 'axios';
import IngredientPopUp from '@/app/components/ingredientPopUp';
import LoadingScreen from './loading';
import { AddCircle, ConnectingAirportsOutlined } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import ErrorScreen from './error';

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
            <div className={styles.recipeDetailTime}><AccessTimeIcon className={styles.recipeClock} />{recipe.readyInMinutes} min</div>
            <div className={styles.recipeDetailIngredients}><LocalDiningIcon className={styles.recipeClock} />{recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount} Ingredients</div>
            <div className={styles.servingDetailSize}><PersonOutlineOutlinedIcon className={styles.recipeClock} />Serves {recipe.servings}</div>
        </div>
    </div>
);

// IngredientsList Component
const IngredientsList = ({ usedIngredients = [], missedIngredients = [], onIngredientAdded, isAuthenticated }) => {
    const [showOptions, setShowOptions] = useState(false);
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState(null);
    const [customAmount, setCustomAmount] = useState('');
    const [customUnit, setCustomUnit] = useState('');
    const [userIngredients, setUserIngredients] = useState([]);
    const [mergedIngredients, setMergedIngredients] = useState([]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserIngredients();
        }
    }, [isAuthenticated]);

    const fetchUserIngredients = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-ingredients`, {
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
        }
    };

    useEffect(() => {
        setMergedIngredients([
            ...usedIngredients.map(ingredient => ({ 
                ...ingredient, 
                status: userIngredients.includes(ingredient.name?.toLowerCase()) ? 'used' : 'missed' 
            }))
        ]);
    }, [userIngredients, usedIngredients]);

    if (!isAuthenticated) {
        return (
            <div className={styles.ingredientWrapper}>
                {mergedIngredients.map((ingredient, i) => (
                    <div key={i} className={styles.ingredientContainer}>
                        <div className={styles.ingredient}>
                            {ingredient.original}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const handleAddIngredient = async (ingredient) => {
        if (!ingredient) return;

        const payload = {
            ingredient_name: ingredient.name,
            amount: parseFloat(ingredient.amount),
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

    const handleAddAllMissedIngredients = async () => {
        const missedIngredients = mergedIngredients.filter(ingredient => ingredient.status === 'missed');
        if (missedIngredients.length === 0) return;
    
        try {
            await Promise.all(missedIngredients.map(ingredient => {
                const updatedIngredient = {
                    ...ingredient,
                    possibleUnits: [ingredient.unit],
                };
                // Call handleAddIngredient with the updated ingredient
                return handleAddIngredient(updatedIngredient);
            }));
        } catch (error) {
            console.error('Error adding one or more missed ingredients:', error);
        }
    };
    
    

    const handleAddClick = async (ingredient) => {
        if (showCustomInput) {
            handleCustomCancel();
        }
        
        setSelectedIngredient(ingredient);
        let updatedIngredient = {...ingredient};

            try {
                const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/food/ingredients/${ingredient.id}/information`;
                const options = {
                    method: 'GET',
                    headers: {
                        'x-rapidapi-key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                        'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
                    }
                };

                const response = await fetch(url, options);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                const poss = data.possibleUnits;
                updatedIngredient = {
                    ...ingredient,
                    possibleUnits: poss || [ingredient.unit] // Ensure possibleUnits exists in data
                };
            } catch (error) {
                console.error();
                updatedIngredient = {
                    ...ingredient,
                    possibleUnits: [ingredient.unit] // Fallback option
                };
            }
        setSelectedIngredient(updatedIngredient);
        setShowOptions(true); // Show the choice between exact and custom
    };
    
    // Called when exact amount is chosen
    const handleExactAmount = async () => {
        if (selectedIngredient) {
            const updatedIngredient = {
                ...selectedIngredient,
                possibleUnits: selectedIngredient.possibleUnits // Create an array with the unit as its only element
            };
            setShowOptions(false);
            setShowCustomInput(false);
            try {
            await handleAddIngredient(updatedIngredient);
            } catch (error) {
                console.error(error);
            }
        }
    };
    
    // Called when custom amount is chosen
    const handleCustomSelect = () => {
        setShowOptions(false);
        setShowCustomInput(true); // Show custom input fields
    };
    
    const handleCustomSave = async () => {
        if (selectedIngredient && customAmount && customUnit) {
            try {
                const updatedIngredient = {
                    ...selectedIngredient,
                    amount: customAmount,
                    unit: customUnit
                }
                await handleAddIngredient(updatedIngredient);
            } catch (error) {
                console.error('Error saving custom ingredient:', error);
            } finally {
                setShowCustomInput(false);
                setCustomUnit('');
                setCustomAmount('');
                setSelectedIngredient(null);
            }
        }
    };

    const handleCustomCancel = () => {
        setShowCustomInput(false);
        setShowOptions(true);
    };

    const handleOptionsCancel = () => {
        setShowOptions(false);
        setSelectedIngredient(null);
        setCustomAmount('');
        setCustomUnit('');
    };
    
    return (
        <div className={styles.ingredientWrapper}>
            {mergedIngredients.length > 0 ? (
                <>
                    {mergedIngredients.map((ingredient, i) => (
                        <div key={i} className={styles.ingredientContainer}>
                            <div
                                style={{ color: ingredient.status === 'missed' ? "red" : "#506264" }}
                                className={styles.ingredient}
                            >
                                {ingredient.original}
                                {ingredient.status === 'missed' && (
                                    <AddCircle onClick={() => handleAddClick(ingredient)} className={styles.addButton} />
                                )}
                            </div>
                        </div>
                    ))}
                    
                    {/* Show options for exact or custom when an ingredient is selected */}
                    {showOptions && selectedIngredient && (
                        <div className={styles.optionContainer}>
                            {/* Display the selected ingredient information */}
                            <h1>{selectedIngredient.name}</h1>  {/* Display the name of the ingredient */}

                            {/* Option buttons */}
                            <button onClick={handleExactAmount} className={styles.optionButton}>Exact Amount</button>
                            <button onClick={handleCustomSelect} className={styles.optionButton}>Custom Amount</button>
                            <button onClick={handleOptionsCancel} className={styles.cancelButton}>Cancel</button> {/* New cancel button */}
                        </div>
                    )}


                    {/* Show custom input fields if custom amount is chosen */}
                    {showCustomInput && (
                        <div className={styles.customInputContainer}>
                            <div>
                                <label>Custom Amount:</label>
                                <CustomTextField value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} />
                            </div>
                            <div>
                                <label>Custom Unit:</label>
                                <CustomDropdown
                                    value={customUnit} // Controlled value for the dropdown
                                    onChange={(e) => setCustomUnit(e.target.value)} // Update state when an option is selected
                                    className={styles.unitSelect}
                                    size="small"
                                    sx={{ width: '100%' }}
                                >
                                    {selectedIngredient.possibleUnits.map((unit) => (
                                        <MenuItem key={unit} value={unit} sx={{ '&.MuiMenuItem-root': { fontFamily: 'Inter' } }}>
                                            {unit}
                                        </MenuItem>
                                    ))}
                                </CustomDropdown>
                            </div>
                            <button onClick={handleCustomSave} className={styles.saveButton}>Save</button>
                            <button onClick={handleCustomCancel} className={styles.cancelButton}>Cancel</button> {/* Modified cancel button */}
                        </div>
                    )}
                    
                    <div className={styles.addAllButton} onClick={() => handleAddAllMissedIngredients()}>
                        <div className={styles.addAllButtonText}>Add All Missing Ingredients</div>
                    </div>
                </>
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
        <div className={styles.instructionWrapper}>
            <div className={styles.title}>Instructions</div>
            <ol className={styles.instructionList}>
                {instructions.flatMap((instruction) =>
                    instruction.steps.map((stepObj, stepIndex) => (
                        <li key={stepIndex}>{stepObj.step}</li>
                    ))
                )}
            </ol>
        </div>
    );
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

const RecipeDetails = ({ params }) => {
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
 
    const fetchRecipeDetails = async (recipeIds) => {
        const storedRecipe = JSON.parse(localStorage.getItem('selectedRecipe'));
 
        console.log("call api")
        try {
            setLoading(true);
            const recipeDetails = await axios.get(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk`, {
                params: {
                    ids: recipeIds,
                    includeNutrition: true,
                },
                headers: {
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
                }
            });
 
            const combinedRecipe = {
                ...storedRecipe,
                id: recipeDetails.data[0].id,
                image: recipeDetails.data[0].image,
                title: recipeDetails.data[0].title,
                readyInMinutes: recipeDetails.data[0].readyInMinutes,
                instructions: recipeDetails.data[0].analyzedInstructions,
                nutrition: recipeDetails.data[0].nutrition,
                servings: recipeDetails.data[0].servings,
                usedIngredients: recipeDetails.data[0].extendedIngredients
            };
            setRecipe(combinedRecipe);
            localStorage.setItem('selectedRecipe', JSON.stringify(combinedRecipe));
 
        } catch (error) {
            console.error('Error fetching recipe details:', error);
        } finally {
            setLoading(false);
        }
    };
 
    const verifyAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsAuthenticated(false);
            return;
        }
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/protected`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setIsAuthenticated(response.status === 200);
        } catch (error) {
            setIsAuthenticated(false);
        }
    };
 
    useEffect(() => {
        verifyAuth();
        const storedRecipe = JSON.parse(localStorage.getItem('selectedRecipe'));
 
        if (storedRecipe) {
            setRecipe(storedRecipe);
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
 
    const handleOpen = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setIsPopupVisible(true);
    };
 
    const closePopup = () => { setIsPopupVisible(false); };
 
    return (
        <div className={styles.recipeDetailsWrapper}>
            <Navbar />
            {loading ? (
                <LoadingScreen title='Recipe Details' />
            ) : error ? (
                <div className={styles.errorWrapper}><ErrorScreen error={error}/></div>
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
                            <IngredientsList 
                                usedIngredients={recipe.usedIngredients} 
                                missedIngredients={recipe.missedIngredients}
                                isAuthenticated={isAuthenticated}
                            />
                            <InstructionsList instructions={recipe.instructions} />
                            <CookedButton onClick={handleOpen} />
                        </div>
                        {isAuthenticated && (
                            <IngredientPopUp isVisible={isPopupVisible} onClose={closePopup} recipe={recipe} />
                        )}
                    </div>
                </div>
            ) : (
                <p>No recipe details found.</p>
            )}
        </div>
    );
 };
 
 export default RecipeDetails;