const express = require('express');
const pool = require('../db');
const router = express.Router();
const jwt = require("jsonwebtoken");
const axios = require('axios');

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};

// Insert to favorites table
router.post('/', authenticateToken, async (req, res) => {
    const { recipeId } = req.body;
    const user_id = req.user.id;

    console.log('Recipe ID:', recipeId); // Debugging line
    console.log('User ID:', user_id); // Debugging line

    try {
        const existingFavorite = await pool.query(
            'SELECT * FROM user_favorites WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        if (existingFavorite.rows.length > 0) {
            return res.status(400).json({ message: 'Recipe already in favorites.' });
        }

        await pool.query(
            'INSERT INTO user_favorites (user_id, recipe_id) VALUES ($1, $2)',
            [user_id, recipeId]
        );

        res.status(201).json({ message: 'Recipe added to your favorites.' });
    } catch (error) {
        console.error('Error adding recipe to favorites:', error);
        res.status(500).json({ message: 'Failed to add recipe to favorites.' });
    }
});

// Remove favorite
router.delete('/', authenticateToken, async (req, res) => {
    const { recipeId } = req.body;
    const user_id = req.user.id;

    try {
        const dbFavorites = await pool.query(
            'SELECT * FROM user_favorites WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        if (dbFavorites.rows.length === 0) {
            return res.status(404).json({ message: 'Recipe not found in favorites.' });
        }

        await pool.query(
            'DELETE FROM user_favorites WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        res.status(200).json({ message: 'Recipe removed from your favorites.' });
    } catch (error) {
        console.error('Error removing recipe from favorites:', error);
        res.status(500).json({ message: 'Failed to remove recipe from favorites.' });
    }
});


// Map and get all recipes
router.get('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

    try {
        const favoriteQuery = await pool.query(
            'SELECT recipe_id FROM user_favorites WHERE user_id = $1',
            [user_id]
        );

        const recipeIds = favoriteQuery.rows.map(row => row.recipe_id);

        if (recipeIds.length === 0) {
            return res.status(200).json({ recipes: [], message: 'No favorite recipes found for this user.' });
        }

        const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk?ids=${recipeIds.join('%2C')}`;

        const response = await axios.get(url, {
            headers: {
                'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
                'x-rapidapi-key': apiKey
            }
        });

        const recipes = response.data;

        res.status(200).json({ recipes });
    } catch (error) {
        console.error('Error retrieving favorite recipes:', error);
        res.status(500).json({ message: 'Failed to retrieve favorite recipes.' });
    }
 });

router.get('/favorite-id', authenticateToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        const favoriteQuery = await pool.query(
            'SELECT recipe_id FROM user_favorites WHERE user_id = $1',
            [user_id]
        );

        const recipeIds = favoriteQuery.rows.map(row => row.recipe_id);

        if (recipeIds.length === 0) {
            return res.status(200).json({ recipeIds: [], message: 'No favorite recipes found for this user.' });
        }

        res.status(200).json({ recipeIds });
    } catch (error) {
        console.error('Error retrieving favorite recipe IDs:', error);
        res.status(500).json({ message: 'Failed to retrieve favorite recipe IDs.' });
    }
})

// Check if a recipe is in favorites
router.get('/check', authenticateToken, async (req, res) => {
    const { recipeId } = req.query; // Expecting the recipe ID as a query parameter
    const user_id = req.user.id;

    try {
        const favoriteQuery = await pool.query(
            'SELECT * FROM user_favorites WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        if (favoriteQuery.rows.length > 0) {
            return res.status(200).json({ inFavorites: true, message: 'Recipe is in favorites.' });
        }

        res.status(200).json({ inFavorites: false, message: 'Recipe is not in favorites.' });
    } catch (error) {
        console.error('Error checking recipe in favorites:', error);
        res.status(500).json({ message: 'Failed to check if recipe is in favorites.' });
    }
});


module.exports = router;
