const express = require("express");
const cors = require('cors');
const db = require('./db');
const { checkAndSendEmail } = require('./email');

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/home", (req, res) => {
    res.json({ message: "Hello World!" });
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

app.get('/ingredients', async (req, res) => {
    try {
        const result = await db.query('SELECT name FROM ingredients');
        res.json(result.rows.map(item => item.name));
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).send('Error fetching ingredients');
    }
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
