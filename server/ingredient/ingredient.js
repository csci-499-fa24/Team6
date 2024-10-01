const express = require('express');
const pool = require('../db');
const router = express.Router();  // Use express Router

// POST route to add ingredients to the user_ingredients table
router.post('/api/add-ingredient', async (req, res) => {
    const { user_id, ingredient_name } = req.body;

    try {
        // Check if the ingredient exists in the ingredients table
        const ingredientQuery = await pool.query(
            'SELECT ingredient_id FROM ingredients WHERE name = $1',
            [ingredient_name]
        );

        if (ingredientQuery.rows.length > 0) {
            const ingredient_id = ingredientQuery.rows[0].ingredient_id; // Corrected here

            // Insert into user_ingredient table
            await pool.query(
                'INSERT INTO user_ingredient (user_id, ingredient_id) VALUES ($1, $2)',
                [user_id, ingredient_id]
            );

            res.status(200).json({ message: 'Ingredient added successfully!' });
        } else {
            res.status(404).json({ message: 'Ingredient not found!' });
        }
    } catch (err) {
        console.error('Error adding ingredient:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
