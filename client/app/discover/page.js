'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link'; 
import { useRouter } from 'next/navigation'; 
import Navbar from "../components/navbar";
import styles from './DiscoverPage.module.css'; 

const Discover = () => {
    const router = useRouter(); 
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false); 
    const [recipes, setRecipes] = useState([]);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1); 
    const [filters, setFilters] = useState({
        type: '',
        cuisine: '',
        diet: ''
    });
    const recipesPerPage = 10; 

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
                        fetchRandomRecipes(page, filters);
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
    }, [router, page, filters]);

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
        <div>
            <Navbar />
            <h1>Discover Random Recipes</h1>

            {/* Filter Section */}
            <div className={styles.filters}>
                <select name="type" value={filters.type} onChange={handleFilterChange}>
                    <option value="">Select Meal Type</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select>

                <select name="cuisine" value={filters.cuisine} onChange={handleFilterChange}>
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

                <select name="diet" value={filters.diet} onChange={handleFilterChange}>
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
            <div className={styles.gridContainer}>
                {recipes.length > 0 ? (
                    recipes.map((recipe) => (
                        <Link href={`/discover/${recipe.id}`} key={recipe.id}>
                            <div className={styles.recipeCard}>
                                <img src={recipe.image} alt={recipe.title} className={styles.recipeImage} />
                                <h2>{recipe.title}</h2>
                                <p>{recipe.readyInMinutes} min</p>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>No recipes found.</p>
                )}
            </div>

            {/* Pagination */}
            <div className={styles.pagination}>
                <button onClick={handlePreviousPage} disabled={page === 1}>Previous</button>
                <span>Page {page}</span>
                <button onClick={handleNextPage}>Next</button>
            </div>
        </div>
    );
};

export default Discover;
