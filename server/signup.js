const db = require('./db');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { name, email, password, bio, phoneNumber, ingredients } = req.body;

    try {
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if the email is already in use
        const emailCheckQuery = 'SELECT email FROM users WHERE email = $1';
        const emailCheckResult = await db.query(emailCheckQuery, [email]);

        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into the 'users' table (assuming user_id is auto-incremented)
        const insertUserQuery = `
            INSERT INTO users (email, password, created_at)
            VALUES ($1, $2, NOW())
            RETURNING user_id
        `;
        const userResult = await db.query(insertUserQuery, [email, hashedPassword]);
        const userId = userResult.rows[0].user_id; // Get the new user ID

        // Insert user profile into the 'user_profiles' table
        const insertProfileQuery = `
            INSERT INTO user_profiles (user_id, name, email, bio, phone)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await db.query(insertProfileQuery, [userId, name, email, bio, phoneNumber]);

        // Handle ingredients if provided
        if (ingredients && ingredients.length > 0) {
            for (let ingredient of ingredients) {
                const { ingredient: ingredientName, quantity } = ingredient;

                // Find ingredient_id from the 'ingredients' table
                const ingredientQuery = 'SELECT ingredient_id FROM ingredients WHERE name = $1';
                const ingredientResult = await db.query(ingredientQuery, [ingredientName]);

                if (ingredientResult.rows.length > 0) {
                    const ingredientId = ingredientResult.rows[0].ingredient_id;

                    // Insert into 'user_ingredients' table
                    const insertUserIngredientQuery = `
                        INSERT INTO user_ingredients (user_id, ingredient_id, amount)
                        VALUES ($1, $2, $3)
                    `;
                    await db.query(insertUserIngredientQuery, [userId, ingredientId, quantity]);
                }
            }
        }

        res.status(201).json({ message: 'User signed up successfully' });

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'An error occurred during signup', error: error.message });
    }
});

module.exports = router;
