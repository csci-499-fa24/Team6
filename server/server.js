const express = require("express");
const cors = require('cors');
const db = require('./db');
const { checkAndSendEmail } = require('./email'); // Import the function from email.js

const app = express();
app.use(cors());
app.use(express.json()); // Add this line to parse JSON bodies

// Existing routes
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

// Define the new endpoint for sending email
app.get('/send-email', async (req, res) => {
    try {
        await checkAndSendEmail(); // Call the email function
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send email', error: error.message });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
