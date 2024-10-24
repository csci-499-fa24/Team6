'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './account.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Importing the icon
import LocalDiningIcon from '@mui/icons-material/LocalDining';

const RecipeHistory = () => {
    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState(null);
    const router = useRouter();

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

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <div className={styles.header}>Your Recipe History</div>
            <div className={styles.recipesContainer}>
                {recipes?.length > 0 ? (
                    recipes.map((recipe) => (
                        <Link href={`/account/${recipe.id}`} key={recipe.id} className={styles.recipeCard}>
                            <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                            <div className={styles.recipeTitleWrapper}>
                                <div className={styles.recipeTitle}>{recipe.title}</div>
                                <AccessTimeIcon className={styles.recipeClock} />{recipe.readyInMinutes} min
                                <LocalDiningIcon className={styles.recipeClock} />
                                {recipe.extendedIngredients?.length || 0} Ingredients
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No recipes in your plan.</p>
                )}
            </div>
        </div>

    );
};

export default RecipeHistory;
