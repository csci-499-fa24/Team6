'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/navbar';
import styles from './PlanPage.module.css';

const Plan = () => {
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

    // Combined useEffect to check authentication and fetch recipes
    useEffect(() => {
        const token = localStorage.getItem('token');
        const verifyToken = async () => {
            if (!token) {
                setLoading(false);
                router.push('/login');  // Redirect if token is missing
                return;
            }

            try {
                // Verify token first
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
    }, [router]);  // Depend on router to re-run when routing changes

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <Navbar />
            <h1>Your Plan</h1>
            <div className={styles.gridContainer}>
                {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <div key={recipe.id} className={styles.recipeCard}>
                            <Link href={`/plan/${recipe.id}`}>
                                <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                                <h2>{recipe.title}</h2>
                                <p>{recipe.readyInMinutes} min</p>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>No recipes in your plan.</p>
                )}
            </div>
        </div>
    );
};

export default Plan;
