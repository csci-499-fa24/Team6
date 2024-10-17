// const nodemailer = require('nodemailer');
// const db = require('../db');
// require('dotenv').config();
// const axios = require('axios');

// const serverUrl = process.env.SERVER_URL || 'http://localhost:8080';

// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

// function verifyTransporter() {
//     transporter.verify(function (error, success) {
//         if (error) {
//             console.log('Error during email sign-in:', error);
//         } else {
//             console.log('Sign-in successful, ready to send emails');
//         }
//     });
// }


// async function checkAndSendEmail() {
//     try {
//         verifyTransporter();

//         const response = await axios.get(`${serverUrl}/get-low-ingredients`);

//         const users = response.data;

//         if (users.length > 0) {
//             for (let user of users) {
//                 if (user.lowIngredients.length > 0) {
//                     let lowIngredients = [];

//                     for (let ingredient of user.lowIngredients) {
//                         lowIngredients.push(`"${ingredient.name}", you currently have ${ingredient.amount} units remaining`);
//                     }

//                     const message = `
//                         Hi ${user.name},

//                         You are low on:
//                         ${lowIngredients.join('\n')}
//                     `;

//                     const mailOptions = {
//                         from: process.env.EMAIL_USER,
//                         to: user.email,
//                         subject: 'Low Ingredient Alert',
//                         text: message
//                     };

//                     transporter.sendMail(mailOptions, function (error, info) {
//                         if (error) {
//                             console.log('Error sending email:', error);
//                         } else {
//                             console.log('Email sent: ' + info.response);
//                         }
//                     });
//                 }
//             }
//         } else {
//             console.log('No low ingredients found for any user');
//         }
//     } catch (err) {
//         console.error('Error in checkAndSendEmail function:', err);
//     }
// }

// module.exports = { checkAndSendEmail, verifyTransporter };


const nodemailer = require('nodemailer');
const db = require('../db');
require('dotenv').config();
const axios = require('axios');

const serverUrl = process.env.SERVER_URL || 'http://localhost:8080';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function verifyTransporter() {
    transporter.verify(function (error, success) {
        if (error) {
            console.log('Error during email sign-in:', error.message);
        } else {
            console.log('Email service verified and ready to send emails');
        }
    });
}

async function checkAndSendEmail() {
    try {
        verifyTransporter();

        const response = await axios.get(`${serverUrl}/get-low-ingredients`);

        const users = response.data;

        if (users.length > 0) {
            for (let user of users) {
                if (user.lowIngredients.length > 0) {
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

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log('Error sending email:', error.message);
                        } else {
                            console.log('Email sent successfully: ' + info.response);
                        }
                    });
                }
            }
        } else {
            console.log('No low ingredients found for any user.');
        }
    } catch (err) {
        console.error('Error in checkAndSendEmail function:', err.message);
    }
}

module.exports = { checkAndSendEmail, verifyTransporter };
