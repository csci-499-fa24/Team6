const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require('./db');
const { checkAndSendEmail } = require('./email');
const ingredientRoutes = require('./ingredient/ingredient');
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
app.use(ingredientRoutes);
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


// New endpoint to get low ingredients
app.get('/get-low-ingredients', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT up.user_id, up.first_name, up.last_name, up.phone, up.email,
                   i.name AS ingredient_name, ui.amount, ui.unit
            FROM user_profiles up
            JOIN user_ingredient ui ON up.user_id = ui.user_id
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id;
        `);


        const users = result.rows;


        if (users.length > 0) {
            const userMap = {};


            users.forEach(user => {
                if (!userMap[user.user_id]) {
                    userMap[user.user_id] = {
                        user_id: user.user_id,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        phone: user.phone,
                        email: user.email,
                        ingredients: []
                    };
                }


                userMap[user.user_id].ingredients.push({
                    name: user.ingredient_name,
                    amount: user.amount,
                    unit: user.unit
                });
            });


            const userProfiles = Object.values(userMap);
            res.json(userProfiles);
        } else {
            res.json([]);
        }
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
 });


 app.get('/send-email', async (req, res) => {
    try {
        await checkAndSendEmail();
        res.status(200).json({ message: 'Email sent successfully!' });
    } catch (err) {
        console.error('Error sending email:', err);
        res.status(500).json({ message: 'Error sending email: ' + err.message });
    }
 });

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
