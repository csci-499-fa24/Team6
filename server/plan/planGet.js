const express = require('express');
const pool = require('../db');
const router = express.Router(); // Use express Router
const jwt = require("jsonwebtoken");
const axios = require('axios');

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

router.get('/', authenticateToken, async (req, res) => {
    const user_id =  req.user.id;
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

    try {
        // Step 1: Retrieve all recipe_ids for the user
        const recipeQuery = await pool.query(
            'SELECT recipe_id FROM user_recipes WHERE user_id = $1',
            [user_id]
        );

        const recipeIds = recipeQuery.rows.map(row => row.recipe_id);

        if (recipeIds.length === 0) {
            return res.status(200).json({ recipes: [], message: 'No recipes found for this user.' });
        }

        // Step 2: Make API calls to Spoonacular for each recipe_id
        const recipeDetailsPromises = recipeIds.map(recipeId => {
            const url = `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`;
            return axios.get(url);
        });

        // Step 3: Wait for all API calls to complete
        const recipeDetailsResponses = await Promise.all(recipeDetailsPromises);

        // Step 4: Extract data from the API responses
        const recipes = recipeDetailsResponses.map(response => response.data);

        // Step 5: Send the recipes back to the user
        res.status(200).json({ recipes });
    } catch (error) {
        console.error('Error retrieving recipes:', error);
        res.status(500).json({ message: 'Failed to retrieve recipes.' });
    }

});
module.exports = router;