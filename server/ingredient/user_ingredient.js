// Middleware to extract user ID from JWT token
const jwt = require('jsonwebtoken');
const pool = require('../db');
const express = require("express");
const router = express.Router();

// This middleware assumes the token is passed as a Bearer token
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

// Route to get user ingredients based on the user ID in the token
router.post('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id; // Extract user_id from the token payload
    try {
        // First query: Get the ingredient_id, amount, and unit from user_ingredient
        const userIngredientsQuery = await pool.query(
            'SELECT ingredient_id, amount, unit FROM user_ingredient WHERE user_id = $1',
            [user_id]
        );

        const userIngredients = userIngredientsQuery.rows;  // List of { ingredient_id, amount, unit }

        if (userIngredients.length === 0) {
            return res.status(200).json([]); // If no ingredients found, return an empty array
        }

        // Get all ingredient_ids from the first query to fetch names in the next query
        const ingredientIds = userIngredients.map(ing => ing.ingredient_id);

        // Second query: Get ingredient names from the ingredients table based on ingredient_ids
        const ingredientNamesQuery = await pool.query(
            'SELECT ingredient_id, name FROM ingredients WHERE ingredient_id = ANY($1::int[])',
            [ingredientIds]
        );

        const ingredientNames = ingredientNamesQuery.rows;  // List of { ingredient_id, name }

        // Combine the ingredient data (name, amount, unit)
        const result = userIngredients.map(ing => {
            const ingredientName = ingredientNames.find(nameRow => nameRow.ingredient_id === ing.ingredient_id);
            return {
                name: ingredientName ? ingredientName.name : 'Unknown ingredient',  // Ensure we handle missing names gracefully
                amount: ing.amount,
                unit: ing.unit
            };
        });

        res.status(200).json(result);

    } catch (error) {
        console.error('Error fetching user ingredients:', error);
        res.status(500).json({ message: 'Error fetching ingredients' });
    }
});

module.exports = router;