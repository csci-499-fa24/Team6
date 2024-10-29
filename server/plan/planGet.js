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

        const recipeIdsString = recipeIds.join(',');

        const options = {
            method: 'GET',
            url: 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk',
            params: { ids: recipeIdsString },
            headers: {
                'x-rapidapi-key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        const recipes = response.data;


        res.status(200).json({ recipes });
    } catch (error) {
        console.error('Error retrieving recipes:', error);
        res.status(500).json({ message: 'Failed to retrieve recipes.' });
    }

});
module.exports = router;