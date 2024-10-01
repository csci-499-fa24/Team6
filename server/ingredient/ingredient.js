const express = require('express');
const pool = require('../db');
const router = express.Router();  // Use express Router

// GET route to fetch all ingredients
router.get('/api/ingredients', async (req, res) => {
    try {
        const ingredientQuery = await pool.query(
            'SELECT ingredient_id, name FROM ingredients' // Adjust the query based on your database structure
        );

        // Check if any ingredients were found
        if (ingredientQuery.rows.length > 0) {
            res.status(200).json(ingredientQuery.rows); // Send the list of ingredients as JSON
        } else {
            res.status(404).json({ message: 'No ingredients found!' });
        }
    } catch (err) {
        console.error('Error fetching ingredients:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST route to add ingredients to the user_ingredients table
router.post('/api/add-ingredient', async (req, res) => {
    const { ingredient_name } = req.body; // Remove user_id from request body
    const user_id = 1; // Hardcoded user_id for testing

    try {
        // Check if the ingredient exists in the ingredients table
        const ingredientQuery = await pool.query(
            'SELECT ingredient_id FROM ingredients WHERE name = $1',
            [ingredient_name]
        );

        let ingredient_id;

        if (ingredientQuery.rows.length > 0) {
            // Ingredient exists, get its ID
            ingredient_id = ingredientQuery.rows[0].ingredient_id;
        } else {
            // Ingredient does not exist, insert it into the ingredients table
            const insertQuery = await pool.query(
                'INSERT INTO ingredients (name) VALUES ($1) RETURNING ingredient_id',
                [ingredient_name]
            );

            ingredient_id = insertQuery.rows[0].ingredient_id; // Get the new ingredient ID
        }

        // Insert into user_ingredient table
        await pool.query(
            'INSERT INTO user_ingredient (user_id, ingredient_id) VALUES ($1, $2)',
            [user_id, ingredient_id]
        );

        res.status(200).json({ message: 'Ingredient added successfully!' });
    } catch (err) {
        console.error('Error adding ingredient:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
