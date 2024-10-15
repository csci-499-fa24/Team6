const express = require("express");
const cors = require('cors');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require('./db');
const { checkAndSendEmail } = require('./email_noti/email');
const ingredientRoutes = require('./ingredient/ingredient');
const { body, validationResult } = require('express-validator');
const { initializeCronJobs } = require('./email_noti/cronJobs');
const app = express();

const corsOptions = {
    origin: 'https://team6-client.onrender.com',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json()); // Add this line to parse JSON bodies

// Existing routes
app.use(express.json());
app.use(ingredientRoutes);
app.get("/api/home", (req, res) => {
    res.json({ message: "Hello World!" });
});

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(401);

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
};

// User registration
app.post(
    "/api/register",
    [
      body("email").isEmail().withMessage("Invalid email"),
      body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      try {
        const user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (user.rows.length > 0) {
          return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

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

app.get('/get-low-ingredients', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT up.first_name, up.last_name, up.email, i.name AS ingredient_name, ui.amount
            FROM users u
            JOIN user_profiles up ON u.user_id = up.user_id
            JOIN user_ingredient ui ON up.user_id = ui.user_id
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
            WHERE ui.amount < 5 AND up.email IS NOT NULL;
        `);

        const users = result.rows;

        if (users.length > 0) {
            const userIngredients = {};
            users.forEach(user => {
                const userKey = `${user.first_name} ${user.last_name}`;
                if (!userIngredients[userKey]) {
                    userIngredients[userKey] = {
                        email: user.email,
                        lowIngredients: []
                    };
                }
                userIngredients[userKey].lowIngredients.push({
                    name: user.ingredient_name,
                    amount: user.amount
                });
            });

            const response = Object.keys(userIngredients).map(user => ({
                name: user,
                email: userIngredients[user].email,
                lowIngredients: userIngredients[user].lowIngredients
            }));

            res.json(response);
        } else {
            res.json([]);
        }
    } catch (err) {
        console.error('Error querying database:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
    initializeCronJobs();
});

