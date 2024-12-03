import React from 'react';
import axios from 'axios';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import styles from '../discover/DiscoverPage.module.css'

const FavoriteButton = ({ recipeId, isFavorite, onToggleFavorite }) => {
    const addAndRemoveFavorites = async (recipeId, e) => {
        e.stopPropagation();
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (isFavorite) {
                await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, {
                    data: { recipeId },
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                onToggleFavorite(false);
            } else {
                await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, { recipeId }, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                onToggleFavorite(true);
            }
        } catch (error) {
            console.error('Error adding/removing recipe to favorites:', error);
        }
    };

    return (
        <div onClick={(e) => addAndRemoveFavorites(recipeId, e)} className={styles.favoriteButtonContainer}>
            {isFavorite ? (
                <FavoriteIcon 
                    style={{ color: '#ff78ae'}} 
                    sx={{ fontSize: '1.3rem !important' }}
                />
            ) : (
                <FavoriteBorderIcon 
                    sx={{ fontSize: '1.3rem !important', color: '#506264'}}
                />
            )}
        </div>
    );
};

export default FavoriteButton;
