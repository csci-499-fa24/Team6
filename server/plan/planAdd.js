const express = require('express');
const pool = require('../db');
const router = express.Router(); // Use express Router
const jwt = require("jsonwebtoken");

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer scheme

    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Ensure the user_id is available in the decoded token
        if (!decoded || !decoded.id) {
            return res.status(403).json({ message: 'Invalid token payload' });
        }

        req.user = decoded; // Assign decoded token to req.user
        next();
    });
};

router.post('/', authenticateToken, async (req, res) => {
    const { recipeId } = req.body;
    const user_id = req.user.id;

    try {
        // Check if the recipe is already in the user's plan
        const checkQuery = await pool.query(
            'SELECT * FROM user_recipes WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        if (checkQuery.rows.length > 0) {
            return res.status(400).json({ message: 'Recipe is already in your plan.' });
        }

        // Insert the recipe into the user_recipes table
        const insertQuery = await pool.query(
            'INSERT INTO user_recipes (user_id, recipe_id) VALUES ($1, $2)',
            [user_id, recipeId]
        );

        res.status(201).json({ message: 'Recipe added to your plan.' });
    } catch (error) {
        console.error('Error adding recipe to plan:', error);
        res.status(500).json({ message: 'Failed to add recipe to plan.' });
    }
});
module.exports = router;