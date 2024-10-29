"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import axios from 'axios';
import styles from './RecipePage.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import { Button } from '@mui/material';

const RecipePage = () => {
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userIngredients, setUserIngredients] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        cuisine: '',
        diet: '',
    });
    const [page, setPage] = useState(1);
    const recipesPerPage = 12; // Display 12 recipes per page

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

    // Fetch recipes based on the user's ingredients
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
                    type: filters.type || '',
                    cuisine: filters.cuisine || '',
                    diet: filters.diet || '',
                },
                headers
            });

            const basicRecipes = response.data;
            setRecipes(basicRecipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setError('Failed to fetch recipes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserIngredients();
    }, []);

    useEffect(() => {
        if (userIngredients.length > 0) {
            fetchRecipes();
        }
    }, [userIngredients, filters, page]);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleNextPage = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePreviousPage = () => {
        setPage(prevPage => (prevPage > 1 ? prevPage - 1 : prevPage));
    };

    return (
        <div>
            <Navbar />
            <div className={styles.recipePageWrapper}>
                <div className={styles.title}>
                    <div className={styles.recipePageTitle}>Recommended Recipes</div>
                    <div className={styles.recipePageDescription}>Based on your pantry</div>
                </div>

                {/* Filter Section */}
                <div className={styles.filtersContainer}>
                    <select 
                        name="type" 
                        value={filters.type} 
                        onChange={handleFilterChange}
                        className={styles.filterSelect}
                    >
                        <option value="">Select Meal Type</option>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                    </select>

                    <select 
                        name="cuisine" 
                        value={filters.cuisine} 
                        onChange={handleFilterChange}
                        className={styles.filterSelect}
                    >
                        <option value="">Select Cuisine</option>
                        <option value="american">American</option>
                        <option value="british">British</option>
                        <option value="caribbean">Caribbean</option>
                        <option value="chinese">Chinese</option>
                        <option value="french">French</option>
                        <option value="greek">Greek</option>
                        <option value="indian">Indian</option>
                        <option value="italian">Italian</option>
                        <option value="japanese">Japanese</option>
                        <option value="korean">Korean</option>
                        <option value="mediterranean">Mediterranean</option>
                        <option value="mexican">Mexican</option>
                        <option value="spanish">Spanish</option>
                        <option value="thai">Thai</option>
                        <option value="vietnamese">Vietnamese</option>
                    </select>

                    <select 
                        name="diet" 
                        value={filters.diet} 
                        onChange={handleFilterChange}
                        className={styles.filterSelect}
                    >
                        <option value="">Select Diet</option>
                        <option value="gluten free">Gluten Free</option>
                        <option value="ketogenic">Ketogenic</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="vegan">Vegan</option>
                        <option value="pescetarian">Pescetarian</option>
                        <option value="paleo">Paleo</option>
                        <option value="primal">Primal</option>
                        <option value="whole30">Whole30</option>
                    </select>
                </div>

                {loading ? (
                    <p>Loading recipes...</p>
                ) : error ? (
                    <p>Error: {error}</p>
                ) : (
                    <div className={styles.recipesContainer}>
                        {recipes.length > 0 ? (
                            recipes.map((recipe) => (
                                <Link
                                    href={{ pathname: `/recipe/${recipe.id}` }}
                                    key={recipe.id}
                                    className={styles.recipeCard}
                                    onClick={() => {
                                        localStorage.setItem('selectedRecipe', JSON.stringify(recipe)); 
                                    }}
                                >
                                    <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                                    <div className={styles.recipeTitleWrapper}>
                                        <div className={styles.recipeTitle}>{recipe.title}</div>
                                        <FavoriteBorderIcon className={styles.recipeHeart} />
                                    </div>
                                    <div className={styles.recipeInfoWrapper}>
                                        <div className={styles.recipeTime}><AccessTimeIcon className={styles.recipeClock} />{recipe.readyInMinutes} min</div>
                                        <div className={styles.recipeIngredients}><LocalDiningIcon className={styles.recipeClock} />{recipe.usedIngredientCount}/{recipe.usedIngredientCount + recipe.missedIngredientCount} Ingredients</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p>No recipes found for your ingredients.</p>
                        )}
                    </div>
                )}

                {/* Pagination */}
                <div className={styles.pagination}>
                    <button 
                        onClick={handlePreviousPage} 
                        disabled={page === 1}
                        className={styles.paginationButton}
                    >
                        Previous
                    </button>
                    <span className={styles.pageNumber}>Page {page}</span>
                    <button 
                        onClick={handleNextPage}
                        className={styles.paginationButton}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecipePage;
