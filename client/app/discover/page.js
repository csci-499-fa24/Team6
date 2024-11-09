"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import Navbar from "../components/navbar";
import axios from 'axios';
import styles from './DiscoverPage.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocalDiningIcon from '@mui/icons-material/LocalDining';

const Discover = () => {
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [authenticated, setAuthenticated] = useState(false);
    const [userAllergens, setUserAllergens] = useState([]);
    const [filters, setFilters] = useState({
        type: '',
        cuisine: '',
        diet: '',
        allergens: [],
        searchQuery: ''
    });
    const recipesPerPage = 12;
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);

    // Authentication logic
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        } else {
            const verifyToken = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/protected`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    if (response.status === 200) {
                        setAuthenticated(true);
                        fetchUserAllergens();
                        fetchFavorites();
                    } else {
                        router.push('/login');
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                    router.push('/login');
                }
            };

            verifyToken();
        }
    }, [router]);

    const fetchUserAllergens = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/allergies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUserAllergens(data.allergies);
            }
        } catch (error) {
            console.error('Error fetching allergens:', error);
        }
    };

    const handleAllergenChange = (allergen) => {
        setFilters(prevFilters => {
            const updatedAllergens = prevFilters.allergens.includes(allergen)
                ? prevFilters.allergens.filter(a => a !== allergen)
                : [...prevFilters.allergens, allergen];
            return {
                ...prevFilters,
                allergens: updatedAllergens
            };
        });
    };

    // Fetch random or filtered recipes when the page loads or user clicks search
    const fetchRecipes = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/discover/random-recipes`, {
                params: {
                    number: recipesPerPage,
                    offset: (page - 1) * recipesPerPage,
                    type: filters.type || '',
                    cuisine: filters.cuisine || '',
                    diet: filters.diet || '',
                    search: filters.searchQuery || '',
                    intolerances: filters.allergens.join(',')
                }
            });

            setRecipes(response.data.recipes);
        } catch (error) {
            console.error('Error fetching recipes:', error);
            setError('Failed to fetch recipes.');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            setFavorites(response.data.recipes);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleSearchChange = (e) => {
        setFilters({
            ...filters,
            searchQuery: e.target.value
        });
    };

    const handleSearchClick = () => {
        setPage(1);
        fetchRecipes();
    };

    const handleNextPage = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePreviousPage = () => {
        setPage(prevPage => (prevPage > 1 ? prevPage - 1 : prevPage));
    };

    const addAndRemoveFavorites = async (recipeId, e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');

            const checkResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const isFavorite = checkResponse.data.recipes.some(recipe => recipe.id === recipeId);

            if (isFavorite) {
                const response = await axios.delete(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`,
                    {
                        data: { recipeId },
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 200) {
                    fetchFavorites();
                }
            } else {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`,
                    { recipeId },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (response.status === 201) {
                    fetchFavorites();
                }
            }
        } catch (error) {
            console.error('Error adding/removing recipe to favorites:', error);
        }
    };

    // Fetch random recipes on initial load
    useEffect(() => {
        fetchRecipes();
    }, [page]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!authenticated) {
        return null;
    }

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.title}>
                <div className={styles.pageTitle}>Discover Random Recipes</div>
                <div className={styles.pageDescription}>Explore new dishes</div>
            </div>

            {/* Filter Section */}
            <div className={styles.filtersContainer}>
                <input
                    type="text"
                    placeholder="Search for recipes..."
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                    className={styles.searchBar}
                />
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

                <select
                    name="allergens"
                    value={filters.allergens}
                    onChange={(e) => {
                        const value = e.target.value;
                        setFilters(prev => ({
                            ...prev,
                            allergens: value ? [value] : []
                        }));
                    }}
                    className={styles.filterSelect}
                >
                    <option value="">Select Allergen</option>
                    {userAllergens.map((allergen) => (
                        <option key={allergen} value={allergen}>
                            {allergen}
                        </option>
                    ))}
                </select>
                <div className={styles.searchButton} onClick={handleSearchClick}>
                    Search
                </div>
            </div>

            {/* Recipe Grid */}
            <div className={styles.recipesContainer}>
                {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <Link href={`/discover/${recipe.id}`} key={recipe.id} className={styles.recipeCard}>
                            <img
                                src={recipe.image}
                                alt={recipe.title}
                                className={styles.recipeImage}
                                onClick={() => {
                                    localStorage.setItem('selectedRecipe', JSON.stringify(recipe));
                                }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/assets/noImage.png';
                                }} />
                            <div className={styles.recipeTitleWrapper}>
                                <div className={styles.recipeTitle}>{recipe.title}</div>
                                <FavoriteBorderIcon
                                    className={`${styles.favoriteIcon} ${favorites.some(fav => fav.id === recipe.id) ? styles.favoriteIconRed : ''}`}
                                    onClick={(e) => addAndRemoveFavorites(recipe.id, e)}
                                />
                            </div>
                            <div className={styles.recipeInfoWrapper}>
                                <div className={styles.recipeTime}>
                                    <AccessTimeIcon className={styles.recipeClock} />
                                    {recipe.readyInMinutes} min
                                </div>
                                <div className={styles.recipeIngredients}>
                                    <LocalDiningIcon className={styles.recipeClock} />
                                    {recipe.totalIngredients} Ingredients
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p className={styles.noRecipes}>No recipes found.</p>
                )}
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <div onClick={handlePreviousPage} disabled={page === 1} className={`${styles.pageButton} ${page === 1 ? styles.disabled : ''}`}>
                    Previous
                </div>
                <span className={styles.pageNumber}>Page {page}</span>
                <div onClick={handleNextPage} className={styles.pageButton}>
                    Next
                </div>
            </div>
        </div>
    );
};

export default Discover;
