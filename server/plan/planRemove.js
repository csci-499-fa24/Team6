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

router.delete('/', authenticateToken, async (req, res) => {
    const { recipeId } = req.body;
    const user_id = req.user.id;

    try {

        const result = await pool.query(
            'DELETE FROM user_recipes WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        if (result.rowCount > 0) {
            // If a row was deleted, send a success response
            res.status(200).json({ message: 'Recipe removed from plan successfully.' });
        } else {
            // If no rows were deleted, send an appropriate message
            res.status(404).json({ message: 'Recipe not found in your plan.' });
        }

    } catch (error) {
        console.error('Error removing recipe to plan:', error);
        res.status(500).json({ message: 'Failed to remove recipe from plan.' });
    }
});
module.exports = router;