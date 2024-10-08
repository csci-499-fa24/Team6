const nodemailer = require('nodemailer');
const db = require('./db');

require('dotenv').config();

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify(function (error, success) {
    if (error) {
        console.log('Error during email sign-in:', error);
    } else {
        console.log('Sign-in successful, ready to send emails');
    }
});

async function checkAndSendEmail() {
    try {
        // Query to get user profile and ingredients below amount of 30 for user_id = 5
        const result = await db.query(`
            SELECT up.name, up.email, i.name AS ingredient_name, ui.amount
            FROM user_profiles up
            JOIN user_ingredient ui ON up.user_id = ui.user_id
            JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
            WHERE up.user_id = 5 AND ui.amount < 30;
        `);

        const users = result.rows;

        if (users.length > 0) {
            let lowIngredients = [];

            for (let user of users) {
                lowIngredients.push(`"${user.ingredient_name}", you currently have ${user.amount} units remaining`);
            }

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

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log('Error sending email:', error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
            }
        } else {
            console.log('No low ingredients found for user_id = 5');
        }
    } catch (err) {
        console.error('Error querying database:', err);
    }
}



//Test case to see if its print out correct log-in info
// console.log('EMAIL_USER:', process.env.EMAIL_USER);
// console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
// checkAndSendEmail();

module.exports = { checkAndSendEmail };
