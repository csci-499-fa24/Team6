import React from 'react';
import axios from 'axios';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import styles from "@/app/recipe/RecipePage.module.css";

const FavoriteButton = ({ recipeId }) => {
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
                    alert(`Recipe ${recipeId} removed from favorites.`);
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
                    alert(`Recipe ${recipeId} added to favorites!`);
                }
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const message = error.response.data.message;
                if (message === 'Recipe already in favorites.') {
                    alert(`Recipe ${recipeId} is already in favorites.`);
                } else {
                    alert('An error occurred while adding/removing from favorites: ' + message);
                }
            } else {
                console.error('Error adding/removing recipe to favorites:', error);
                alert('An unexpected error occurred. Please try again later.');
            }
        }
    };

    return (
        <FavoriteBorderIcon
            style={{
                color: 'red',
                cursor: 'pointer'
            }}
            onClick={(e) => addAndRemoveFavorites(recipeId, e)}
        />

    );
};

export default FavoriteButton;
