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

// POST route to add or update ingredient
router.post('/', authenticateToken, async (req, res) => {
    const { ingredient_name, amount, unit } = req.body; // Expecting unit in the request body
    const user_id = req.user.id; // Get user_id from token

    try {
        const lowerCaseIngredientName = ingredient_name.toLowerCase();

        // Check if the ingredient exists in the ingredients table (case-insensitive)
        const ingredientQuery = await pool.query(
            'SELECT ingredient_id FROM ingredients WHERE LOWER(name) = $1',
            [lowerCaseIngredientName]
        );

        let ingredient_id;

        if (ingredientQuery.rows.length > 0) {
            ingredient_id = ingredientQuery.rows[0].ingredient_id;
        } else {
            // Insert the ingredient if it doesn't exist
            const insertQuery = await pool.query(
                'INSERT INTO ingredients (name) VALUES ($1) RETURNING ingredient_id',
                [lowerCaseIngredientName]
            );

            ingredient_id = insertQuery.rows[0].ingredient_id;
        }

        // Check if the ingredient already exists for the user
        const userIngredientQuery = await pool.query(
            'SELECT * FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
            [user_id, ingredient_id]
        );

        if (userIngredientQuery.rows.length > 0) {
            if (amount > 0) {
                await pool.query(
                    'UPDATE user_ingredient SET amount = $1, unit = $2 WHERE user_id = $3 AND ingredient_id = $4',
                    [amount, unit, user_id, ingredient_id]
                );
                return res.status(200).json({ message: 'Ingredient updated successfully!' });
            } else {
                // If the amount is 0, delete the entry from the user_ingredient table
                await pool.query(
                    'DELETE FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
                    [user_id, ingredient_id]
                );
                return res.status(200).json({ message: 'Ingredient deleted successfully!' });
            }
        } else {
            // If the ingredient doesn't exist and amount > 0, add it to the user_ingredient table
            if (amount > 0) {
                await pool.query(
                    'INSERT INTO user_ingredient (user_id, ingredient_id, amount, unit) VALUES ($1, $2, $3, $4)',
                    [user_id, ingredient_id, amount, unit]
                );
                return res.status(200).json({ message: 'Ingredient added successfully!' });
            } else {
                // If the amount is 0 and the ingredient doesn't exist, return a 400 error
                return res.status(400).json({ message: 'Cannot add ingredient with amount 0!' });
            }
        }

    } catch (err) {
        console.error('Error adding or updating ingredient:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
