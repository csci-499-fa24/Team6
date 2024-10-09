const db = require('./db');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { firstName, lastName, email, password, phoneNumber, ingredients, allergy, nutritionalGoals } = req.body;

    try {
        // Validate required fields
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ message: 'First name, last name, email, and password are required' });
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

        // Insert user into the 'users' table
        const insertUserQuery = `
            INSERT INTO users (email, password, created_at)
            VALUES ($1, $2, NOW())
            RETURNING user_id
        `;
        const userResult = await db.query(insertUserQuery, [email, hashedPassword]);
        const userId = userResult.rows[0].user_id; // Get the new user ID

        // Insert user profile into the 'user_profiles' table
        const insertProfileQuery = `
            INSERT INTO user_profiles (user_id, first_name, last_name, phone)
            VALUES ($1, $2, $3, $4)
        `;
        await db.query(insertProfileQuery, [userId, firstName, lastName, phoneNumber]);

        // Handle ingredients if provided
        if (ingredients && ingredients.length > 0) {
            for (let ingredient of ingredients) {
                const { ingredient: ingredientName, quantity, unit } = ingredient;

                // Find ingredient_id from the 'ingredients' table
                const ingredientQuery = 'SELECT ingredient_id FROM ingredients WHERE name = $1';
                const ingredientResult = await db.query(ingredientQuery, [ingredientName]);

                if (ingredientResult.rows.length > 0) {
                    const ingredientId = ingredientResult.rows[0].ingredient_id;

                    // Insert into 'user_ingredients' table
                    const insertUserIngredientQuery = `
                        INSERT INTO user_ingredients (user_id, ingredient_id, amount, unit)
                        VALUES ($1, $2, $3, $4)
                    `;
                    await db.query(insertUserIngredientQuery, [userId, ingredientId, quantity, unit]);
                } else {
                    console.error(`Ingredient not found for name: ${ingredientName}`);
                }
            }
        }

        // Handle allergies if provided
        if (allergy && allergy.length > 0) {
            for (let allergen of allergy) {
                const { allergen: allergenName } = allergen;

                // Insert into 'user_allergens' table
                const insertAllergenQuery = `
                    INSERT INTO user_allergens (user_id, allergens)
                    VALUES ($1, $2)
                `;
                await db.query(insertAllergenQuery, [userId, allergenName]);
            }
        }

        // Handle nutritional goals if provided
        if (nutritionalGoals) {
            const { protein, carbohydrates, total_fat, saturated_fat, fiber, sodium, sugar } = nutritionalGoals;

            const insertNutritionQuery = `
                INSERT INTO user_nutritional_goals (user_id, protein, carbohydrates, total_fat, saturated_fat, fiber, sodium, sugar)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            await db.query(insertNutritionQuery, [userId, protein, carbohydrates, total_fat, saturated_fat, fiber, sodium, sugar]);
        }

        res.status(201).json({ message: 'User signed up successfully' });

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'An error occurred during signup', error: error.message });
    }
});

module.exports = router;
