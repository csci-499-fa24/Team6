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

    // Debug: Print the received date and user_id
    console.log(`Received request to fetch daily nutrition data. User ID: ${user_id}, Date: ${date}`);

    if (!date) {
        console.error('Date parameter is missing.');
        return res.status(400).json({ error: "Date is required" });
    }

    // Validate the date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        console.error('Invalid date format. Expected format: YYYY-MM-DD');
        return res.status(400).json({ error: "Invalid date format. Expected format: YYYY-MM-DD" });
    }

    try {
        // Debug: Confirm that the query is about to be executed
        console.log('Executing query to fetch nutrition data for the given date.');

        const query = `
            SELECT *
            FROM nutrition_data
            WHERE user_id = $1 AND date = $2
        `;

        // Debug: Print query parameters before execution
        console.log(`Query parameters: user_id = ${user_id}, date = ${date}`);

        const result = await pool.query(query, [user_id, date]);

        // Debug: Print the result of the query
        console.log(`Query executed successfully. Number of rows fetched: ${result.rowCount}`);

        // Check if any data was returned and print the result
        if (result.rows.length === 0) {
            console.log('No nutrition data found for the given date.');
        } else {
            console.log('Nutrition data found:', result.rows[0]);
        }

        res.json(result.rows[0] || {}); // Return data or empty object if no data found
    } catch (error) {
        // Debug: Print error details if any error occurs
        console.error('Error occurred while fetching daily nutrition data:', error);
        res.status(500).json({ error: "An error occurred while fetching daily data" });
    }
});

router.get('/history', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const { historyPeriod, date, year, month} = req.query;

    // Debugging: Log the incoming request
    console.log(`[DEBUG] User ID: ${user_id}, History Period: ${historyPeriod}, Date: ${date}`);

    if (!historyPeriod) {
        console.error("[ERROR] Missing historyPeriod in request query");
        return res.status(400).json({ error: "History period is required" });
    }

    let centerDate = new Date();
    if (date) {
        if (isNaN(Date.parse(date))) {
            console.error("[ERROR] Invalid date format in query");
            return res.status(400).json({ error: "Invalid date format" });
        }
        centerDate = new Date(date);
    }

    let query = '';
    const params = [user_id];
    let dynamicCondition = '';

    try {
        switch (historyPeriod.toLowerCase()) {
            case 'weekly': {
                console.log("[DEBUG] Preparing weekly query");

                // Calculate the 7-day range: center date ± 3 days
                const startDate = new Date(centerDate);
                startDate.setDate(centerDate.getDate() - 3);
                const endDate = new Date(centerDate);
                endDate.setDate(centerDate.getDate() + 3);

                // Add parameters for the range
                params.push(startDate.toISOString(), endDate.toISOString());

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
                    WHERE user_id = $1
                      AND date >= $2
                      AND date <= $3
                    GROUP BY label, date
                    ORDER BY date;
                `;
                break;
            }

            case 'monthly':
                console.log("[DEBUG] Preparing monthly query");

                let startDate, endDate;

                // If both year and month are provided, use them to set the start and end dates
                if (year && month) {
                    const yearMonth = `${year}-${String(month).padStart(2, '0')}`; // Format as YYYY-MM
                    startDate = new Date(`${yearMonth}-01T00:00:00Z`); // Start of the month
                    endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + 1); // Move to the next month, which will be the end of current month

                } else {
                    // Otherwise, use the current month's data
                    startDate = new Date();
                    startDate.setDate(1); // First day of the current month
                    endDate = new Date(startDate);
                    endDate.setMonth(endDate.getMonth() + 1); // Move to the next month for the end
                }

                // Add parameters for the range
                params.push(startDate.toISOString(), endDate.toISOString());

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
                    WHERE user_id = $1
                      AND date >= $2
                      AND date < $3
                    GROUP BY label, date
                    ORDER BY date;
                `;
                break;


            case 'yearly':
                console.log("[DEBUG] Preparing yearly query");
                query = `
                    SELECT
                        to_char(date, 'Mon') AS label,  -- Display the month as a label (e.g., Jan, Feb, etc.)
                        SUM(protein) AS protein,  -- Sum of protein for the month
                        SUM(carbohydrates) AS carbohydrates,  -- Sum of carbohydrates for the month
                        SUM(total_fat) AS total_fat,  -- Sum of total fat for the month
                        SUM(saturated_fat) AS saturated_fat,  -- Sum of saturated fat for the month
                        SUM(fiber) AS fiber,  -- Sum of fiber for the month
                        SUM(sodium) AS sodium,  -- Sum of sodium for the month
                        SUM(sugar) AS sugar,  -- Sum of sugar for the month
                        SUM(calories) AS calories  -- Sum of calories for the month
                    FROM nutrition_data
                    WHERE user_id = $1
                      AND date >= '2025-01-01'
                      AND date < '2025-12-31'
                    GROUP BY date_part('month', date), to_char(date, 'Mon')  -- Group by both the numeric month part (1 to 12) and the month label
                    ORDER BY date_part('month', date);  -- Order by the numeric month part (1 to 12)
                `;
                break;
                
            default:
                console.error("[ERROR] Invalid historyPeriod value");
                return res.status(400).json({ error: "Invalid history period" });
        }

        // Debugging: Log the constructed query and parameters
        console.log("[DEBUG] Executing query:", query);
        console.log("[DEBUG] Query parameters:", params);

        const result = await pool.query(query, params);

        // Debugging: Log the query result
        console.log("[DEBUG] Query result:", result.rows);

        res.json(result.rows);

    } catch (error) {
        console.error("[ERROR] An error occurred while fetching historical data:", error.message);
        res.status(500).json({ error: "An error occurred while fetching historical data" });
    }
});





module.exports = router;