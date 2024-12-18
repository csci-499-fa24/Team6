"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from "../components/navbar";
import axios from 'axios';
import styles from './DiscoverPage.module.css';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import FavoriteButton from "@/app/components/addAndRemoveFavorites";
import LoadingScreen from '../components/loading';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

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
    const [recipesPerPage, setRecipesPerPage] = useState(8);
    const router = useRouter();
    const [favorites, setFavorites] = useState([]);
    const [checkedState, setCheckedState] = useState({});
    const [shoppingList, setShoppingList] = useState([]);
    const [allIngredients, setAllIngredients] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showModal, setShowModal] = useState(false);

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

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (response.status === 200) {
                setFavorites(response.data.recipes);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
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

    const isFavorite = (recipeId) => {
        return favorites.some(recipe => recipe.id === recipeId);
    };

    const handleCheck = (recipeId, recipe) => {
        setCheckedState((prevState) => {
            const newState = { ...prevState };

            if (newState[recipeId]) {
                delete newState[recipeId];
            } else {
                newState[recipeId] = recipe;
            }

            return newState;
        });
    };

    const handleClear = () => {
        localStorage.removeItem('checkedState');
        setCheckedState({});
        setShoppingList([]);
    };

    const removeItemFromList = (item) => {
        const newCheckedState = { ...checkedState };
        delete newCheckedState[item];

        setCheckedState(newCheckedState);
        setShoppingList([]);

        localStorage.setItem('checkedState', JSON.stringify(newCheckedState));
    };

    const generateShoppingList = async () => {
        try {
            const checkState = JSON.parse(localStorage.getItem('checkedState')) || [];
            const recipeIds = Object.values(checkState).map((item) => item.id);

            if (!recipeIds.length) {
                console.error('No recipe IDs found in localStorage.');
                return;
            }

            const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/discover/shopping-list`, { recipeIds });
            setAllIngredients(response.data.combinedIngredients);

            const token = localStorage.getItem('token');
            if (!token) {
                console.error('User is not authenticated.');
                return;
            }

            const userIngredientsResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/user-ingredients`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const adjustedResponse = await axios.post(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/discover/adjust-shopping-list`,
                {
                    combinedIngredients: response.data.combinedIngredients,
                    userIngredients: userIngredientsResponse.data,
                }
            );

            console.log('Recipe Details:', response.data);
            console.log('User Ingredients:', userIngredientsResponse.data);
            console.log('Adjusted Shopping List:', adjustedResponse.data);
            setShoppingList(adjustedResponse.data.adjustedIngredients);
            setShowModal(true);
            console.log('Updated Shopping List State:', adjustedResponse.data.adjustedIngredients);

        } catch (error) {
            console.error('Error fetching shopping list:', error.message);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    useEffect(() => {
        const savedCheckedState = JSON.parse(localStorage.getItem('checkedState')) || {};
        setCheckedState(savedCheckedState);
    }, []);

    useEffect(() => {
        if (Object.keys(checkedState).length > 0) {
            localStorage.setItem('checkedState', JSON.stringify(checkedState));
        }
    }, [checkedState]);

    // Fetch random recipes on initial load
    useEffect(() => {
        fetchRecipes();
    }, [page]);

    if (!authenticated) {
        return null;
    }

    const displayedRecipes = recipes.slice(0, recipesPerPage);

    return (
        <div className={styles.pageWrapper}>
            <Navbar />
            <div className={styles.title}>
                <div className={styles.pageTitle}>
                    Discover Random Recipes
                    <ShoppingCartIcon
                        onClick={toggleDropdown}
                        className={styles.cartIcon}
                    />
                </div>

                {showDropdown && (
                    <div className={styles.cartDropdown}>
                        <div className={styles.cartHeader}>
                            <div className={styles.shoppingCartHeader}>Your Shopping Cart</div>
                        </div>

                        <div className={styles.listContainer}>
                            <div className={styles.listTitle}>Selected Recipes</div>
                            {Object.values(checkedState).length > 0 ? (
                                <div className={styles.listItemsContainer}>
                                    {Object.values(checkedState).map((recipe) => (
                                        <div key={recipe.id} className={styles.listItem}>
                                            <img
                                                src={recipe.image || '/assets/noImage.png'}
                                                alt={recipe.title}
                                                className={styles.listImage}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/assets/noImage.png';
                                                }}
                                            />
                                            <p className={styles.recipeName}>{recipe.title}</p>
                                            <button className={styles.removeButton} onClick={() => removeItemFromList(recipe.id)}>x</button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className={styles.noRecipes}>No recipes selected.</p>
                            )}

                            <div className={styles.buttonContainer}>
                                <button onClick={generateShoppingList}>Shopping List</button>
                                <button onClick={handleClear}>Clear</button>
                            </div>
                            {showModal && (
                                <div className={styles.overlay}>
                                    <div className={styles.modal}>
                                        <div className={styles.popupHeader}>
                                            <div className={styles.popupTitle}>Your Shopping List</div>
                                            <button className={styles.closeButton} onClick={handleCloseModal}>×</button>
                                        </div>

                                        <div className={styles.modalListContainer}>
                                            <div className={styles.listSection}>
                                                <div className={styles.popupSectionHeader}>Ingredient List</div>
                                                {allIngredients.length > 0 ? (
                                                    <div className={styles.shoppingList}>
                                                        {allIngredients.map((item, index) => (
                                                            <li key={index} className={styles.shoppingListItem}>
                                                                ⬜ {item.name} - {item.amount} {item.unit}
                                                            </li>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p>No original ingredients available.</p>
                                                )}
                                            </div>

                                            <div className={styles.listSection}>
                                            <div className={styles.popupSectionHeader}>Adjusted Ingredients List</div>
                                                {shoppingList.length > 0 ? (
                                                    <div className={styles.shoppingList}>
                                                        {shoppingList.map((item, index) => (
                                                            <li key={index} className={styles.shoppingListItem}>
                                                                ⬜ {item.name} - {item.amount} {item.unit}
                                                            </li>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p>No items in the shopping list.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className={styles.pageDescription}>
                    Explore new dishes
                </div>
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
            {loading ? (
                <LoadingScreen title='Recipes' />
            ) : (
                <div className={styles.recipesContainer}>
                    {displayedRecipes.length > 0 ? (
                        displayedRecipes.map((recipe) => (
                            <Link href={`/discover/${recipe.id}`} key={recipe.id} className={styles.recipeCard}>
                                <img
                                    src={recipe.image || '/assets/noImage.png'}
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

                                    <div className={styles.favoriteButton}>
                                        <FavoriteButton
                                            recipeId={recipe.id}
                                            isFavorite={isFavorite(recipe.id)}
                                            onToggleFavorite={fetchFavorites}
                                            className={styles.heartIcon}
                                            sx={{
                                                fontSize: '5rem !important', // Adjust icon size
                                                padding: '8px', // Add padding if needed
                                            }}
                                        />
                                        <AddShoppingCartIcon
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleCheck(recipe.id, recipe);
                                            }}
                                            className={styles.cartIcon}
                                            style={{ color: checkedState[recipe.id] ? 'green' : '#506264' }}
                                            sx={{ fontSize: '1.2rem !important' }}
                                        />
                                    </div>
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
            )}

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