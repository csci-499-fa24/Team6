const express = require('express');
const pool = require('../db');
const router = express.Router(); // Use express Router
const jwt = require("jsonwebtoken");

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer scheme

    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Ensure the user_id is available in the decoded token
        if (!decoded || !decoded.id) {
            return res.status(403).json({ message: 'Invalid token payload' });
        }

        req.user = decoded; // Assign decoded token to req.user
        next();
    });
};

// POST route to add or update ingredient
router.get('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        // Fetch user nutritional goals
        const goalsQuery = `SELECT * FROM user_nutritional_goals WHERE user_id = $1`;
        const goalsResult = await pool.query(goalsQuery, [user_id]);
        const nutritionalGoals = goalsResult.rows[0];

        const consumeQuery = 'SELECT * FROM user_intake WHERE user_id = $1';
        const consumeResult = await pool.query(consumeQuery, [user_id]);
        const totalNutrients = consumeResult.rows[0];

        res.json({
            goals: nutritionalGoals,
            consumed: totalNutrients,
        });

    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching data" });
    }
});

router.get('/daily', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ error: "Date is required" });
    }

    try {
        const query = `
            SELECT * 
            FROM nutrition_data 
            WHERE user_id = $1 AND date = $2
        `;
        const result = await pool.query(query, [user_id, date]);

        res.json(result.rows[0] || {}); // Return data or empty object if no data found
    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching daily data" });
    }
});


router.get('/history', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const { historyPeriod } = req.query;

    if (!historyPeriod) {
        return res.status(400).json({ error: "History period is required" });
    }

    let query = '';
    const params = [user_id];

    try {
        switch (historyPeriod) {
            case 'weekly':
                query = `
                    SELECT 
                        to_char(date, 'Dy') AS label,
                        SUM(protein) AS protein,
                        SUM(carbohydrates) AS carbohydrates,
                        SUM(total_fat) AS total_fat,
                        SUM(saturated_fat) AS saturated_fat,
                        SUM(fiber) AS fiber,
                        SUM(sodium) AS sodium,
                        SUM(sugar) AS sugar,
                        SUM(calories) AS calories
                    FROM nutrition_data
                    WHERE user_id = $1 AND date >= NOW() - INTERVAL '7 days'
                    GROUP BY label, date
                    ORDER BY date;
                `;
                break;

            case 'monthly':
                query = `
                    SELECT 
                        to_char(date, 'YYYY-MM-DD') AS label,
                        SUM(protein) AS protein,
                        SUM(carbohydrates) AS carbohydrates,
                        SUM(total_fat) AS total_fat,
                        SUM(saturated_fat) AS saturated_fat,
                        SUM(fiber) AS fiber,
                        SUM(sodium) AS sodium,
                        SUM(sugar) AS sugar,
                        SUM(calories) AS calories
                    FROM nutrition_data
                    WHERE user_id = $1 AND date >= NOW() - INTERVAL '1 month'
                    GROUP BY label, date
                    ORDER BY date;
                `;
                break;

            case 'yearly':
                query = `
                    SELECT 
                        to_char(date, 'Mon') AS label,
                        SUM(protein) AS protein,
                        SUM(carbohydrates) AS carbohydrates,
                        SUM(total_fat) AS total_fat,
                        SUM(saturated_fat) AS saturated_fat,
                        SUM(fiber) AS fiber,
                        SUM(sodium) AS sodium,
                        SUM(sugar) AS sugar,
                        SUM(calories) AS calories
                    FROM nutrition_data
                    WHERE user_id = $1 AND date >= NOW() - INTERVAL '1 year'
                    GROUP BY label, date_part('month', date)
                    ORDER BY date_part('month', date);
                `;
                break;

            default:
                return res.status(400).json({ error: "Invalid history period" });
        }

        const result = await pool.query(query, params);
        res.json(result.rows);

    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching historical data" });
    }
});


module.exports = router;