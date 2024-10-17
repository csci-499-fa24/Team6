const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require('./db');
const { checkAndSendEmail } = require('./email');
const ingredientRoutes = require('./ingredient/ingredient');
const userIngredientRoutes = require('./ingredient/user_ingredient');
const ingredientRemoveRoute = require('./ingredient/ingredientRemove');
const ingredientUpdateRoute = require('./ingredient/ingredientUpdate');
const addAllergenRoute = require('./allergen/allergenAdd');
const removeAllergenRoute = require('./allergen/allergenRemove');
const allergyRoute = require('./allergen/allergen');
const { body, validationResult } = require('express-validator');
const app = express();
const registerRoute = require('./register');

const corsOptions = {
    origin: process.env.NEXT_PUBLIC_SERVER_URL || 'https://team6-client.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));


// Existing routes
app.use(express.json());

app.get("/api/home", (req, res) => {
    res.json({ message: "Hello World!" });
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (!token) return res.sendStatus(401); 

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); 
        }
        req.user = user; 
        next();
    });
};

app.use('/api/register', registerRoute);
app.use('/api/ingredient', ingredientRoutes);
app.use('/api/user-ingredients', userIngredientRoutes);
app.use('/api/user-ingredients/remove', ingredientRemoveRoute);
app.use('/api/user-ingredients/update', ingredientUpdateRoute);
app.use('/api/allergies/add', addAllergenRoute);
app.use('/api/allergies/remove', removeAllergenRoute);
app.use('/api/allergies', allergyRoute);

// User login route
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const user = result.rows[0];

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: user.user_id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: "1h"
        });

        res.json({ token });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Login failed" });
    }
});

// Protected route (can only be accessed if logged in)
app.get("/api/protected", authenticateToken, (req, res) => {
    res.json({ message: `Hello, ${req.user.email}. This is a protected route.` });
});

app.get('/user-profiles', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM user_profiles ORDER BY user_id ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Query error:', err);
        res.status(500).json({ error: 'Failed to query user_profiles table' });
    }
});

// New endpoint to get low ingredients
app.get('/get-low-ingredients', async (req, res) => {
    try {
        // Query to get user profile and ingredients below amount of 30 for user_id = 5
        const result = await db.query(`
            SELECT up.name, i.name AS ingredient_name, ui.amount
            FROM user_profiles up
            JOIN user_ingredient ui ON up.user_id = ui.user_id
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
            WHERE up.user_id = 5 AND ui.amount < 30;
        `);

        const users = result.rows;

        if (users.length > 0) {
            const lowIngredients = users.map(user => ({
                name: user.ingredient_name,
                amount: user.amount
            }));

            // Send response with user name and low ingredients
            res.json({
                name: users[0].name,
                lowIngredients
            });
        } else {
            res.json({
                name: "User",
                lowIngredients: []
            });
        }
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = app;

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
