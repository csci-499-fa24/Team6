'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './account.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Importing the icon
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import LoadingScreen from '../components/loading';
import ErrorScreen from '../components/error';

const RecipeHistory = () => {
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [recipesPerPage, setRecipesPerPage] = useState(6);
    const router = useRouter();

    const totalPages = Math.ceil(recipes.length / recipesPerPage);

    // Fetch user's recipes
    const fetchUserRecipes = async (token) => {
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + '/api/plan/user-recipes', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            setRecipes(data.recipes);
        } catch (error) {
            console.error('Error fetching user recipes:', error);
            setError('Failed to load your recipes.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const updateRecipesPerPage = () => {
            if (window.innerWidth <= 1300) {
                setRecipesPerPage(4);
            } else {
                setRecipesPerPage(6);
            }
        };

        window.addEventListener('resize', updateRecipesPerPage);
        updateRecipesPerPage();

        return () => {
            window.removeEventListener('resize', updateRecipesPerPage);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                router.push('/login');  // Redirect if token is missing
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/protected`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    await fetchUserRecipes(token);  // Fetch user recipes if token is valid
                } else {
                    router.push('/login'); // Redirect if token is invalid
                }
            } catch (error) {
                console.error('Error verifying token:', error);
                router.push('/login');  // Redirect on error
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, [router]);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const displayedRecipes = recipes.slice((currentPage - 1) * recipesPerPage, currentPage * recipesPerPage);

    if (loading) {
        return <div className={styles.loadingWrapper}><LoadingScreen title='your recipe history' /></div>;
    }

    if (error) {
        return <div className={styles.historyError}><ErrorScreen error={error} /></div>;
    }

    return (
        <div className={styles.recipeHistoryWrapper}>
            <div className={styles.header}>Your Recipe History</div>
            <div className={styles.recipesContainer}>
                {displayedRecipes.length > 0 ? (
                    displayedRecipes.map((recipe) => (
                        <Link href={`/account/${recipe.id}`} key={recipe.id} className={styles.recipeCard}>
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
                                }} 
                                />
                            <div className={styles.recipeTitleWrapper}>
                                <div className={styles.recipeTitle}>{recipe.title}</div>
                            </div>
                            <div className={styles.recipeInfoWrapper}>
                                <div className={styles.recipeTime}><AccessTimeIcon className={styles.recipeClock} />{recipe.readyInMinutes} min</div>
                                <div className={styles.recipeIngredients}><LocalDiningIcon className={styles.recipeClock} />{recipe.extendedIngredients?.length || 0} Ingredients</div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No recipes in your plan.</p>
                )}
            </div>
            {totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                    <div
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={styles.paginationButton}
                    >
                        Previous
                    </div>
                    <span className={styles.pageIndicator}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <div
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={styles.paginationButton}
                    >
                        Next
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecipeHistory;
