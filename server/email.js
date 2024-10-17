const nodemailer = require('nodemailer');
const db = require('./db');
require('dotenv').config();

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

async function checkAndSendEmail() {
    try {
        if (!transporter) {
            await createTransporter();
        }
        
        await transporter.verify();
        console.log('Sign-in successful, ready to send emails');

        const result = await db.query(`
            SELECT up.name, up.email, i.name AS ingredient_name, ui.amount
            FROM user_profiles up
            JOIN user_ingredient ui ON up.user_id = ui.user_id
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
            WHERE up.user_id = 5 AND ui.amount < 30;
        `);

        const users = result.rows;

        if (users.length > 0) {
            const lowIngredients = users.map(user => 
                `"${user.ingredient_name}", you currently have ${user.amount} units remaining`
            );

            if (lowIngredients.length > 0) {
                const message = `
                    Hi ${users[0].name},

                    You are low on:
                    ${lowIngredients.join('\n')}
                `;

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: users[0].email,
                    subject: 'Low Ingredient Alert',
                    text: message
                };

                const info = await transporter.sendMail(mailOptions);
                console.log('Email sent:', info.response);
            }
        } else {
            console.log('No low ingredients found for user_id = 5');
        }
    } catch (err) {
        console.error('Error:', err);
    }
}

module.exports = { checkAndSendEmail, createTransporter };