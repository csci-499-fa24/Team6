import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './FavoriteButton.module.css'; // Create a CSS module for styles
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';

const FavoriteButton = ({ recipeId }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkFavoriteStatus = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites/check`, {
                params: { recipeId },
                headers: { Authorization: `Bearer ${token}` },
            });
            setIsFavorite(response.data.inFavorites);
        } catch (error) {
            console.error('Error checking favorite status:', error);
        }
    };

    const toggleFavorite = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please log in to manage favorites.');
            return;
        }

        setLoading(true);
        try {
            if (isFavorite) {
                // Remove from favorites
                await axios.delete(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`, {
                    data: { recipeId },
                    headers: { Authorization: `Bearer ${token}` },
                });
                setIsFavorite(false);
            } else {
                // Add to favorites
                await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/favorites`,
                    { recipeId },
                    { headers: { Authorization: `Bearer ${token}` } });
                setIsFavorite(true);
            }
        } catch (error) {
            console.error('Error toggling favorite status:', error);
            alert('Failed to update favorite status. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkFavoriteStatus();
    }, [recipeId]);

    return (
        <button
            className={`${styles.favoriteButton} ${isFavorite ? styles.active : ''}`}
            onClick={toggleFavorite}
            disabled={loading}
            title={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </button>
    );
};

export default FavoriteButton;
