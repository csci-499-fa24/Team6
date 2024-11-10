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
            WHERE ui.amount < 5 AND up.email IS NOT NULL AND u.is_email_subscribed = true;
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

        const users = await getLowIngredients();

        if (users.length > 0) {
            for (let user of users) {
                if (user.lowIngredients.length > 0) {
                    // Create a consolidated list of low ingredients for the email
                    let lowIngredients = user.lowIngredients.map(ingredient =>
                        `"${ingredient.name}", you currently have ${ingredient.amount} units remaining`
                    );

                    const message = `
                        <p>Hi ${user.name},</p>
                        <p>You are low on:</p>
                        <ul>
                            ${lowIngredientsList}
                        </ul>
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

// Function to send unsubscription confirmation email
const sendUnsubscribeConfirmationEmail = async (userEmail) => {
    try {
        if (!transporter) {
            await createTransporter();
        }

        const logoUrl = "https://raw.githubusercontent.com/csci-499-fa24/Team6/main/client/public/assets/logo.png";
        const mailOptions = {
            from: `"PANTRY PAL" <${process.env.EMAIL_USER}>`, // Adjust sender name
            to: userEmail,
            subject: 'You’ve Successfully Unsubscribed from Our Notifications',
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
                        <img src="${logoUrl}" alt="PantryPal Logo" style="height: 70px; margin-bottom: 10px;">
                    </div>
                    <div style="padding: 20px; background-color: white; border-radius: 8px;">
                        <h2 style="color: #ff6b6b;">You’ve Unsubscribed from Email Notifications</h2>
                        <p style="color: #555;">Hey Pal,</p>
                        <p>We wanted to let you know that you have successfully unsubscribed from our email notifications. We respect your choice, and you won’t receive any more email notifications from us.</p>
                        <p>If you change your mind, you can always <a href="https://team6-client.onrender.com/account?section=settings" style="color: #ff6b6b; text-decoration: none;">re-subscribe here</a> through your account settings.</p>
                        <p style="margin-top: 20px;">Thank you for being part of our community!</p>
                        <p style="margin-top: 10px;">Warm regards,</p>
                        <p><strong>Your PantryPal :)</strong></p>
                    </div>
                    <div style="background-color: #f8f8f8; padding: 10px; text-align: center; color: #999; font-size: 0.85rem;">
                        <p>© ${new Date().getFullYear()} PantryPal. All rights reserved.</p>
                        <p><a href="YOUR_PRIVACY_POLICY_URL" style="color: #999; text-decoration: none;">Privacy Policy</a> | <a href="YOUR_TERMS_URL" style="color: #999; text-decoration: none;">Terms of Service</a></p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Unsubscription confirmation email sent to:', userEmail);
    } catch (error) {
        console.error('Error sending unsubscription confirmation email:', error);
    }
};

module.exports = { checkAndSendEmail, sendUnsubscribeConfirmationEmail, createTransporter, getLowIngredients };
