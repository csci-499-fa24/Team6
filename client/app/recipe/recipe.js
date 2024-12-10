"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import axios from 'axios';
import styles from './RecipePage.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import FavoriteButton from "@/app/components/addAndRemoveFavorites";
import LoadingScreen from '../components/loading';
import ErrorScreen from '../components/error';

const RecipeCard = ({ recipe, favoriteRecipes, onToggleFavorite }) => {
    const isFavorite = favoriteRecipes.includes(recipe.id);
    return (
        <Link
            href={{ pathname: `/recipe/${recipe.id}` }}
            key={recipe.id}
            className={styles.recipeCard}
            onClick={() => {
                localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
            }}
        >
            <img
                src={recipe.image}
                alt={recipe.title}
                className={styles.recipeImage}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/assets/noImage.png';
                }}
            />
            <div className={styles.recipeTitleWrapper}>
                <div className={styles.recipeTitle}>{recipe.title}</div>
                <FavoriteButton
                    recipeId={recipe.id}
                    isFavorite={isFavorite}
                    onToggleFavorite={onToggleFavorite}
                />
            </div>
            <div className={styles.recipeInfoWrapper}>
                <div className={styles.recipeTime}>
                    <AccessTimeIcon className={styles.recipeClock} />
                    {recipe.readyInMinutes} min
                </div>
                <div className={styles.recipeIngredients}>
                    <LocalDiningIcon className={styles.recipeClock} />
                    {recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount} Ingredients
                </div>
            </div>
        </Link>
    );
};

const Pagination = ({ page, handleNextPage, handlePreviousPage }) => {
    return (
        <div className={styles.pagination}>
            <div
                onClick={handlePreviousPage}
                disabled={page === 1}
                className={`${styles.pageButton} ${page === 1 ? styles.disabled : ''}`}
            >
                Previous
            </div>
            <span className={styles.pageNumber}>Page {page}</span>
            <div onClick={handleNextPage} className={styles.pageButton}>
                Next
            </div>
        </div>
    );
};

const HeadLine = () => {
    return (
        <div className={styles.title}>
            <div className={styles.recipePageTitle}>Recommended Recipes</div>
            <div className={styles.recipePageDescription}>Based on your pantry</div>
        </div>
    )
}

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userIngredients, setUserIngredients] = useState([]);
    const [page, setPage] = useState(1);
    const [recipesPerPage, setRecipesPerPage] = useState(8);
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);

    useEffect(() => {
        const updateRecipesPerPage = () => {
            if (window.innerWidth <= 1600) {
                setRecipesPerPage(6);
            } else {
                setRecipesPerPage(8);
            }
        };

        window.addEventListener('resize', updateRecipesPerPage);
        updateRecipesPerPage();

        return () => {
            window.removeEventListener('resize', updateRecipesPerPage);
        };
    }, []);

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

    const fetchRecipes = async () => {
        if (userIngredients.length === 0) return;

        try {
            const headers = {
                'x-rapidapi-key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            };

            const ingredients = userIngredients.join(',');

            const response = await axios.get(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients`, {
                params: {
                    ingredients: ingredients,
                    ignorePantry: false,
                    number: recipesPerPage,
                    offset: (page - 1) * recipesPerPage,
                },
                headers
            });

            const basicRecipes = response.data;
            const recipeIds = basicRecipes.map(recipe => recipe.id).join(',');

            const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
            await delay(1000);

            const recipeDetails = await axios.get(`https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk`, {
                params: {
                    ids: recipeIds,
                    includeNutrition: true,
                },
                headers
            });

            const combinedRecipes = basicRecipes.map(basicRecipe => {
                const detailedRecipe = recipeDetails.data.find(detailed => detailed.id === basicRecipe.id);
                return {
                    ...basicRecipe,
                    readyInMinutes: detailedRecipe ? detailedRecipe.readyInMinutes : null,
                    instructions: detailedRecipe ? detailedRecipe.analyzedInstructions : null,
                    nutrition: detailedRecipe ? detailedRecipe.nutrition : null,
                    servings: detailedRecipe ? detailedRecipe.servings : null,
                };
            });

            setRecipes(combinedRecipes);

        } catch (error) {
            console.error('Error fetching recipes:', error);
            setError('Failed to fetch recipes.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavoriteRecipes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites/favorite-id`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setFavoriteRecipes(response.data.recipeIds);
        } catch (error) {
            console.error('Error fetching favorite recipes:', error);
        }
    };

    useEffect(() => {
        fetchUserIngredients();
    }, []);

    useEffect(() => {
        if (userIngredients.length > 0) {
            fetchRecipes();
        }
    }, [userIngredients, page, recipesPerPage]);

    useEffect(() => {
        fetchFavoriteRecipes();
    }, []);

    return (
        <div className={styles.recipesWrapper}>
            <Navbar />
            <div className={styles.recipePageWrapper}>
                <HeadLine />
                {loading ? (
                    <LoadingScreen title='Recipes'/>
                ) : error ? (
                    <ErrorScreen error={error}/>
                ) : (
                    <div className={styles.recipesContainer}>
                        {recipes.length > 0 ? (
                            recipes.map((recipe) => (
                                <RecipeCard key={recipe.id} recipe={recipe} favoriteRecipes={favoriteRecipes} onToggleFavorite={fetchFavoriteRecipes} />
                            ))
                        ) : (
                            <p>No recipes found for your ingredients.</p>
                        )}
                    </div>
                )}
                <Pagination
                    page={page}
                    handleNextPage={() => setPage(prevPage => prevPage + 1)}
                    handlePreviousPage={() => setPage(prevPage => prevPage > 1 ? prevPage - 1 : 1)}
                />
            </div>
        </div>
    );
};

export default RecipePage;