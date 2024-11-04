const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const db = require('../db');
require('dotenv').config();
const axios = require('axios');

console.log("Account SID:", process.env.TWILIO_ACCOUNT_SID);
console.log("Auth Token:", process.env.TWILIO_AUTH_TOKEN);
console.log("Phone Number:", process.env.TWILIO_PHONE_NUMBER);

// Fetch user ingredients
async function getUserIngredients(userId) {
    try {
        const result = await db.query(`
            SELECT i.name, ui.amount 
            FROM user_ingredient ui 
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id 
            WHERE ui.user_id = $1`, 
            [userId]
        );
        return result.rows.length > 0 ? result.rows.map(row => row.name) : [];
    } catch (error) {
        console.error('Error fetching user ingredients:', error);
        throw error;
    }
}

// Fetch user allergens
async function getUserAllergens(userId) {
    try {
        const result = await db.query('SELECT allergen FROM user_allergens WHERE user_id = $1', [userId]);
        return result.rows.length > 0 ? result.rows.map(row => row.allergen) : [];
    } catch (error) {
        console.error('Error fetching user allergens:', error);
        throw error;
    }
}

// Fetch most used ingredients for a user
async function getMostUsedIngredients(userId) {
    try {
        const result = await db.query(`
            SELECT i.name, COUNT(*) as usage_count
            FROM user_ingredient ui
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
            WHERE ui.user_id = $1
            GROUP BY i.name
            ORDER BY usage_count DESC
            LIMIT 3;
        `, [userId]);
        
        return result.rows.length > 0 ? result.rows.map(row => row.name) : [];
    } catch (error) {
        console.error('Error fetching most used ingredients:', error);
        throw error;
    }
}

// Fetch least used ingredients for a user
async function getLeastUsedIngredients(userId) {
    try {
        const result = await db.query(`
            SELECT i.name, COUNT(*) as usage_count
            FROM user_ingredient ui
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
            WHERE ui.user_id = $1
            GROUP BY i.name
            ORDER BY usage_count ASC
            LIMIT 3;
        `, [userId]);
        
        return result.rows.length > 0 ? result.rows.map(row => row.name) : [];
    } catch (error) {
        console.error('Error fetching least used ingredients:', error);
        throw error;
    }
}

// Fetch users with low stock ingredients specifically for SMS notifications
async function getLowIngredients() {
    try {
        const result = await db.query(`
            SELECT up.first_name, up.last_name, up.phone, i.name AS ingredient_name, ui.amount
            FROM users u
            JOIN user_profiles up ON u.user_id = up.user_id
            JOIN user_ingredient ui ON up.user_id = ui.user_id
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
            WHERE ui.amount < 5 AND up.phone IS NOT NULL;
        `);

        const users = result.rows;

        if (users.length > 0) {
            const userIngredients = {};
            users.forEach(user => {
                const userKey = `${user.first_name} ${user.last_name}`;
                if (!userIngredients[userKey]) {
                    userIngredients[userKey] = {
                        phone: user.phone,
                        lowIngredients: []
                    };
                }
                userIngredients[userKey].lowIngredients.push({
                    name: user.ingredient_name,
                    amount: user.amount
                });
            });

            return Object.keys(userIngredients).map(user => ({
                name: user,
                phone: userIngredients[user].phone,
                lowIngredients: userIngredients[user].lowIngredients
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error querying database:', error);
        throw error;
    }
}

// Fetch the top saved recipe for a user
async function getTopSavedRecipe(userId) {
    try {
        const result = await db.query(`
            SELECT r.name
            FROM user_favorites uf
            JOIN recipes r ON uf.recipe_id = r.recipe_id
            WHERE uf.user_id = $1
            GROUP BY r.name
            ORDER BY COUNT(*) DESC
            LIMIT 1;
        `, [userId]);
        
        return result.rows.length > 0 ? result.rows[0].title : null;
    } catch (error) {
        console.error('Error fetching top saved recipe:', error);
        throw error;
    }
}

// Fetch the count of saved recipes for personalization
async function getSavedRecipeCount(userId) {
    try {
        const result = await db.query(`
            SELECT COUNT(*) AS count
            FROM user_favorites
            WHERE user_id = $1;
        `, [userId]);
        
        return result.rows.length > 0 ? result.rows[0].count : 0;
    } catch (error) {
        console.error('Error fetching saved recipe count:', error);
        throw error;
    }
}

// Helper function to format phone number to E.164 (adds +1 for 10-digit numbers)
function formatPhoneNumber(phoneNumber) {
    // If it's already in E.164 format, return as is
    if (phoneNumber.startsWith('+')) {
        return phoneNumber;
    }
    // Add +1 prefix for 10-digit numbers
    if (phoneNumber.length === 10) {
        return `+1${phoneNumber}`;
    }
    return phoneNumber; // Return as-is if it's already formatted correctly
}

// Low Stock Alert SMS
async function sendLowStockAlert() {
    try {
        const users = await getLowIngredients();
        for (const user of users) {
            if (user.lowIngredients.length > 0 && user.phone) {
                // Build message with specific low-stock items
                const lowStockItems = user.lowIngredients.map(item => `${item.name} (${item.amount} left)`).join(', ');
                const message = `Hi ${user.name}, you're running low on: ${lowStockItems}. Check PantryPal to manage your pantry!`;

                // Format phone number
                const formattedPhoneNumber = formatPhoneNumber(user.phone);

                // Send SMS
                await client.messages.create({
                    body: message,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: formattedPhoneNumber,
                });
                console.log(`Low stock SMS sent to ${formattedPhoneNumber} for ${user.name}`);
            }
        }
    } catch (error) {
        console.error('Error sending low stock alert SMS:', error);
    }
}

// Recipe Recommendation SMS
async function sendRecipeRecommendation(userId, userPhone) {
    try {
        // Fetch user ingredients and allergens
        const ingredients = await getUserIngredients(userId);
        const allergens = await getUserAllergens(userId);

        // Prepare API call to Spoonacular
        const params = {
            number: 3, // Limit to 3 recipes to keep SMS concise
            query: '', // Empty query to focus on ingredients match
            includeIngredients: ingredients.join(','), // Match user's pantry ingredients
            excludeIngredients: allergens.join(','), // Exclude allergens
            addRecipeInformation: true,
            fillIngredients: true,
            sort: 'popularity',
        };

        const response = await axios.get(
            'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch',
            {
                params,
                headers: {
                    'x-rapidapi-key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                    'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
                },
            }
        );

        const recipes = response.data.results;

        if (recipes.length > 0) {
            // Construct SMS message with recipe recommendations
            const recipeList = recipes.map(recipe => `${recipe.title} - ${recipe.readyInMinutes} mins`).join('\n');
            const message = `Here are some recipes you can make with what you have in your pantry:\n\n${recipeList}\n\nVisit PantryPal for full recipes!`;

            // Format phone number
            const formattedPhoneNumber = formatPhoneNumber(userPhone);

            // Send SMS
            await client.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhoneNumber,
            });
            console.log(`Recipe recommendation SMS sent to ${formattedPhoneNumber} for user ${userId}`);
        } else {
            console.log(`No suitable recipes found for user ${userId}`);
        }
    } catch (error) {
        console.error('Error sending recipe recommendation SMS:', error);
    }
}

// Monthly Summary SMS
async function sendMonthlySummary(userId, userPhone) {
    try {
        // Format phone number
        const formattedPhoneNumber = formatPhoneNumber(userPhone);

        // Fetch the user’s most and least used ingredients
        const mostUsedIngredients = await getMostUsedIngredients(userId);
        const leastUsedIngredients = await getLeastUsedIngredients(userId);
        
        // Fetch the top favorited recipe
        const topRecipe = await getTopSavedRecipe(userId);

        // Check if the user has any low stock ingredients
        const lowStockItems = await getLowIngredients(userId);

        // Fetch the number of saved recipes for the personalization
        const savedRecipeCount = await getSavedRecipeCount(userId);

        // Create the monthly summary message
        let message = `Hi there! Here's your PantryPal monthly summary:\n\n`;

        // Add most used ingredients
        if (mostUsedIngredients.length > 0) {
            const mostUsedList = mostUsedIngredients.join(', ');
            message += `🌟 Most used: ${mostUsedList}\n`;
        }

        // Add least used ingredients
        if (leastUsedIngredients.length > 0) {
            const leastUsedList = leastUsedIngredients.join(', ');
            message += `🧊 Least used: ${leastUsedList}\n`;
        }

        // Add top saved recipe
        if (topRecipe) {
            message += `🍲 Your top recipe saved: "${topRecipe.title}"\n`;
        }

        // Add low stock alert
        if (lowStockItems.length > 0) {
            message += `📉 You’re low on a few items. Check PantryPal to restock!\n`;
        }

        // Add a personalized reminder based on saved recipes
        if (savedRecipeCount >= 5) {
            message += `\nLooks like you've been cooking up a storm! 😋 Keep exploring new recipes!`;
        } else {
            message += `\nTry something new this month! 🍲🌟`;
        }

        // Send the SMS
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhoneNumber,
        });
        console.log(`Monthly summary SMS sent to ${formattedPhoneNumber} for user ${userId}`);
    } catch (error) {
        console.error('Error sending monthly summary SMS:', error);
    }
}

// Unsubscribe Confirmation SMS
async function sendUnsubscribeConfirmationSMS(phoneNumber) {
    const message = "You've successfully unsubscribed from PantryPal SMS notifications. We'll miss you! :(";

    // Format phone number
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);

    await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: formattedPhoneNumber,
    });
}

// Temporary Test Code - Remove after testing
const testUserId = '91';
const testPhoneNumber = '8777804236'; 

// Test Low Stock Alert
sendLowStockAlert(testUserId, formatPhoneNumber(testPhoneNumber));

// Test Recipe Recommendation
sendRecipeRecommendation(testUserId, formatPhoneNumber(testPhoneNumber));

// Test Monthly Summary
sendMonthlySummary(testUserId, formatPhoneNumber(testPhoneNumber));

module.exports = {
    sendLowStockAlert,
    sendRecipeRecommendation,
    sendMonthlySummary,
    sendUnsubscribeConfirmationSMS,
};
