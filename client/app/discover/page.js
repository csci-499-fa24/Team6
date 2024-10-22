"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
    const [filters, setFilters] = useState({
        type: '',
        cuisine: '',
        diet: ''
    });
    const recipesPerPage = 12;
    const router = useRouter(); 

    // Authentication logic
    useEffect(() => {
        const token = localStorage.getItem('token'); 

        const verifyToken = async () => {
            if (!token) {
                router.push('/login'); 
            } else {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/protected`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`, 
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Protected data:', data);
                        setAuthenticated(true); 
                    } else {
                        router.push('/login'); 
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                    router.push('/login');
                } finally {
                    setLoading(false); 
                }
            }
        };

        verifyToken();
    }, [router]);

    const fetchRandomRecipes = async (page = 1, filters = {}) => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/discover/random-recipes`, {
                params: {
                    number: recipesPerPage,
                    offset: (page - 1) * recipesPerPage,
                    type: filters.type || '',
                    cuisine: filters.cuisine || '',
                    diet: filters.diet || ''
                }
            });

            setRecipes(response.data.recipes);
        } catch (error) {
            console.error('Error fetching random recipes:', error);
            setError('Failed to fetch recipes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRandomRecipes(page, filters);
    }, [page, filters]);

    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
        setPage(1);
    };

    const handleNextPage = () => {
        setPage(prevPage => prevPage + 1);
    };

    const handlePreviousPage = () => {
        setPage(prevPage => (prevPage > 1 ? prevPage - 1 : prevPage));
    };

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

            {/* Recipe Grid */}
            <div className={styles.recipesContainer}>
                {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <Link href={`/discover/${recipe.id}`} key={recipe.id} className={styles.recipeCard}>
                            <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                            <div className={styles.recipeTitleWrapper}>
                                <div className={styles.recipeTitle}>{recipe.title}</div>
                                <FavoriteBorderIcon className={styles.recipeHeart} />
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
    );
};

export default Discover;
