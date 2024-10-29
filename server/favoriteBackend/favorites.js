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

        if (!decoded || !decoded.id) {
            return res.status(403).json({ message: 'Invalid token payload' });
        }

        req.user = decoded;
        next();
    });
};

//insert to favorites table
router.post('/', authenticateToken, async (req, res) => {
    const { recipeId } = req.body;
    const user_id = req.user.id;

    try {
        const dbFavorites = await pool.query(
            'SELECT * FROM user_favorites WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        const insertFavorite = await pool.query(
            'INSERT INTO user_favorites (user_id, recipe_id) VALUES ($1, $2)',
            [user_id, recipeId]
        );

        res.status(201).json({ message: 'Recipe added to your favorites.' });
    } catch (error) {
        console.error('Error adding recipe to favorites:', error);
        res.status(500).json({ message: 'Failed to add recipe to favorites.' });
    }
});

//remove
router.delete('/', authenticateToken, async (req, res) => {
    const { recipeId } = req.body;
    const user_id = req.user.id;

    try {
        const dbFavorites = await pool.query(
            'SELECT * FROM user_favorites WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        const deleteFavorite = await pool.query(
            'DELETE FROM user_favorites WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        res.status(200).json({ message: 'Recipe removed from your favorites.' });
    } catch (error) {
        console.error('Error removing recipe from favorites:', error);
        res.status(500).json({ message: 'Failed to remove recipe from favorites.' });
    }
});

//map and get all recipes
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

        const recipeDetailsPromises = recipeIds.map(recipeId => {
            const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
            return axios.get(url);
        });

        const recipeDetailsResponses = await Promise.all(recipeDetailsPromises);
        const recipes = recipeDetailsResponses.map(response => response.data);

        res.status(200).json({ recipes });
    } catch (error) {
        console.error('Error retrieving favorite recipes:', error);
        res.status(500).json({ message: 'Failed to retrieve favorite recipes.' });
    }
});

router.delete('/:recipeId', authenticateToken, async (req, res) => {
    const recipeId = req.params.recipeId;
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


module.exports = router;
