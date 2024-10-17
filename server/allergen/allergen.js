const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Assuming you have a db.js file for database connections
const router = express.Router();


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

router.get('/', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch all allergens for the user
        const result = await db.query('SELECT allergen FROM user_allergens WHERE user_id = $1', [userId]);


        // const allergies = result.rows.map(row => {
        //     const allergenData = JSON.parse(row.allergen); // Parse the JSON string
        //     return allergenData.allergen; // Extract the allergen name (e.g., "apples")
        // });
        const allergies = result.rows.map(row => {
            const allergen = row.allergen;

            // Check if the allergen is formatted as JSON (starts with a "{")
            if (allergen.trim().startsWith('{')) {
                try {
                    const allergenData = JSON.parse(allergen); // Parse the JSON string
                    return allergenData.allergen; // Extract the allergen name (e.g., "shrimp")
                } catch (error) {
                    console.error('Error parsing JSON allergen:', error);
                    return allergen; // Fallback in case JSON parsing fails, return the raw value
                }
            } else {
                return allergen; // Return the plain string (e.g., "shrimp")
            }
        });
        res.json({ success: true, allergies });  // This should be an array of allergens
    } catch (error) {
        console.error('Error fetching allergens:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});
module.exports = router;