const nodemailer = require('nodemailer');
const axios = require('axios');
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
       const response = await axios.get(`${process.env.SERVER_URL}/get-low-ingredients`);
       const userProfiles = response.data;


       for (const user of userProfiles) {
           const lowIngredients = user.ingredients.filter(ingredient => ingredient.amount < 5);


           if (lowIngredients.length > 0 && user.email) {
               const ingredientList = lowIngredients.map(ing => `- ${ing.name}: ${ing.amount} units remaining`).join('\n');


               const message = `
                   Hi ${user.first_name} ${user.last_name},


                   You are low on the following ingredients:
                   ${ingredientList}
               `;


               const mailOptions = {
                   from: process.env.EMAIL_USER,
                   to: user.email,
                   subject: 'Low Ingredient Alert',
                   text: message
               };


               await transporter.sendMail(mailOptions, function (error, info) {
                   if (error) {
                       console.log(`Error sending email to ${user.email}:`, error);
                   } else {
                       console.log(`Email sent to ${user.email}: ` + info.response);
                   }
               });
           }
       }
   } catch (err) {
       console.error('Error querying low ingredients:', err);
   }
}




module.exports = { checkAndSendEmail };
