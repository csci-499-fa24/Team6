const express = require('express');
const pool = require('../db');
const router = express.Router();  // Use express Router

router.get('/api/user-ingredients', async (req, res) => {
    const user_id = 1; // Hardcoded user_id for testing, replace this with actual user ID from auth session if available

    try {
        // Query to fetch all ingredients for the user
        const userIngredientsQuery = await pool.query(`
            SELECT ui.ingredient_id, i.name, ui.amount
            FROM user_ingredient ui
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
            WHERE ui.user_id = $1
        `, [user_id]);

        if (userIngredientsQuery.rows.length > 0) {
            res.status(200).json(userIngredientsQuery.rows); // Send the list of ingredients with amounts as JSON
        } else {
            res.status(404).json({ message: 'No ingredients found for this user!' });
        }
    } catch (err) {
        console.error('Error fetching user ingredients:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

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

router.post('/api/add-ingredient', async (req, res) => {
    const { ingredient_name, amount } = req.body; // Expecting amount in the request body
    const user_id = 1; // Hardcoded user_id for testing

    try {
        // Convert the ingredient name to lowercase for case-insensitive comparison
        const lowerCaseIngredientName = ingredient_name.toLowerCase();

        // Check if the ingredient exists in the ingredients table (case-insensitive)
        const ingredientQuery = await pool.query(
            'SELECT ingredient_id FROM ingredients WHERE LOWER(name) = $1',
            [lowerCaseIngredientName]
        );

        let ingredient_id;

        if (ingredientQuery.rows.length > 0) {
            // Ingredient exists, get its ID
            ingredient_id = ingredientQuery.rows[0].ingredient_id;
        } else {
            // Ingredient does not exist, insert it into the ingredients table
            const insertQuery = await pool.query(
                'INSERT INTO ingredients (name) VALUES ($1) RETURNING ingredient_id',
                [lowerCaseIngredientName] // Store the ingredient name in lowercase
            );

            ingredient_id = insertQuery.rows[0].ingredient_id; // Get the new ingredient ID
        }

        // Check if the ingredient already exists for the user
        const userIngredientQuery = await pool.query(
            'SELECT * FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
            [user_id, ingredient_id]
        );

        if (userIngredientQuery.rows.length > 0) {
            // Ingredient already exists for the user, update the amount
            const currentAmount = userIngredientQuery.rows[0].amount || 0; // Ensure current amount is initialized
            const newAmount = currentAmount + amount; // Add the new amount to the current amount

            await pool.query(
                'UPDATE user_ingredient SET amount = $1 WHERE user_id = $2 AND ingredient_id = $3',
                [newAmount, user_id, ingredient_id]
            );

            res.status(200).json({ message: 'Ingredient amount updated successfully!' });
        } else {
            // Insert into user_ingredient table with the initial amount
            await pool.query(
                'INSERT INTO user_ingredient (user_id, ingredient_id, amount) VALUES ($1, $2, $3)',
                [user_id, ingredient_id, amount]
            );

            res.status(200).json({ message: 'Ingredient added successfully!' });
        }
    } catch (err) {
        console.error('Error adding ingredient:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// PUT route to modify ingredient amount in user_ingredient table
router.put('/api/modify-ingredient', async (req, res) => {
    const { ingredient_name, amount } = req.body; // Expecting ingredient_name and new amount from request body
    const user_id = 1; // Hardcoded user_id for testing

    try {
        // Fetch ingredient_id from ingredients table based on ingredient_name
        const ingredientQuery = await pool.query(
            'SELECT ingredient_id FROM ingredients WHERE name = $1',
            [ingredient_name]
        );

        if (ingredientQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Ingredient not found!' });
        }

        const ingredient_id = ingredientQuery.rows[0].ingredient_id;

        // Check if the ingredient is already in the user_ingredient table for this user
        const userIngredientQuery = await pool.query(
            'SELECT * FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
            [user_id, ingredient_id]
        );

        if (userIngredientQuery.rows.length === 0) {
            return res.status(404).json({ message: 'Ingredient not found in user profile!' });
        }

        if (amount > 0) {
            // Update the amount if it's greater than 0
            await pool.query(
                'UPDATE user_ingredient SET amount = $1 WHERE user_id = $2 AND ingredient_id = $3',
                [amount, user_id, ingredient_id]
            );
            res.status(200).json({ message: 'Ingredient amount updated successfully!' });
        } else {
            // If amount is 0, remove the entry from user_ingredient table
            await pool.query(
                'DELETE FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
                [user_id, ingredient_id]
            );
            res.status(200).json({ message: 'Ingredient removed successfully!' });
        }
    } catch (err) {
        console.error('Error modifying ingredient amount:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
