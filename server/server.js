const express = require("express");
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const db = require('./db');

//app.use(cors());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3000'
}));

// app.get("/api/home", (req, res) => {
//     res.json({message: "Hello World!"});
// });


// app.get('/api/user-profiles', async (req, res) => {
//     try {
//         const result = await db.query('SELECT * FROM user_profiles ORDER BY user_id ASC');
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error('Query error:', err);
//         res.status(500).json({ error: 'Failed to query user_profiles table' });
//     }
// });


app.post('/api/signup', async (req, res) => {
    const { name, email, password, bio, phoneNumber, ingredients } = req.body;
    console.log("TEST 1");

    try {
        // Check if the email is already in use
        const emailCheckQuery = 'SELECT email FROM users WHERE email = $1';
        const emailCheckResult = await db.query(emailCheckQuery, [email]);

        if (emailCheckResult.rows.length > 0) {
            return res.status(400).json({ message: 'Email is already in use' });
        }
        console.log("TEST 2");

        // Get the number of rows in the 'users' table to generate userId
        const userCountQuery = 'SELECT COUNT(*) FROM users';
        const userCountResult = await db.query(userCountQuery);
        const userId = parseInt(userCountResult.rows[0].count) + 1; // Increment by 1
        console.log("TEST 3");
        console.log(userId);

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert user into the 'users' table with the custom userId
        const insertUserQuery = `
            INSERT INTO users (user_id, email, password, created_at)
            VALUES ($1, $2, $3, NOW())
        `;
        await db.query(insertUserQuery, [userId, email, hashedPassword]);
        console.log("TEST 4");

        // Insert user profile into the 'user_profiles' table
        const insertProfileQuery = `
            INSERT INTO user_profiles (user_id, name, email, bio, phone)
            VALUES ($1, $2, $3, $4, $5)
        `;
        await db.query(insertProfileQuery, [userId, name, email, bio, phoneNumber]);
        console.log("TEST 5");

        // Handle ingredients: find ingredient_id for each ingredient and insert into 'user_ingredients' table
        for (let ingredient of ingredients) {
            const { ingredient: ingredientName, quantity } = ingredient;

            // Find ingredient_id from the 'ingredients' table
            const ingredientQuery = 'SELECT ingredient_id FROM ingredients WHERE name = $1';
            const ingredientResult = await db.query(ingredientQuery, [ingredientName]);

            if (ingredientResult.rows.length > 0) {
                const ingredientId = ingredientResult.rows[0].ingredient_id;

                // Insert into 'user_ingredients' table
                const insertUserIngredientQuery = `
                    INSERT INTO user_ingredient (user_id, ingredient_id, amount)
                    VALUES ($1, $2, $3)
                `;
                await db.query(insertUserIngredientQuery, [userId, ingredientId, quantity]);
            }
        }
        console.log("TEST 6");

        res.status(201).json({ message: 'User signed up successfully' });

    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ message: 'An error occurred during signup' });
    }
});



const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});