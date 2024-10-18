const nodemailer = require('nodemailer');
const db = require('../db');
require('dotenv').config();
const axios = require('axios');


let transporter;

async function createTransporter() {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

async function getLowIngredients() {
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

            return Object.keys(userIngredients).map(user => ({
                name: user,
                email: userIngredients[user].email,
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

async function checkAndSendEmail() {
    try {
        if (!transporter) {
            await createTransporter();
        }

        await transporter.verify();
        console.log('Sign-in successful, ready to send emails');

        const users = await getLowIngredients();

        if (users.length > 0) {
            for (let user of users) {
                if (user.lowIngredients.length > 0) {
                    // Create a consolidated list of low ingredients for the email
                    let lowIngredients = user.lowIngredients.map(ingredient =>
                        `"${ingredient.name}", you currently have ${ingredient.amount} units remaining`
                    );

                    const message = `
                        Hi ${user.name},
                        You are low on:
                        ${lowIngredients.join('\n')}
                    `;

                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: user.email,
                        subject: 'Low Ingredient Alert',
                        text: message
                    };

                    // Use await to handle the promise
                    await transporter.sendMail(mailOptions);
                    console.log('Email sent successfully to: ' + user.email);
                }
            }
        } else {
            console.log('No low ingredients found for any user.');
        }
    } catch (err) {
        console.error('Error in checkAndSendEmail function:', err.message);
    }
}

module.exports = { checkAndSendEmail, createTransporter, getLowIngredients };
