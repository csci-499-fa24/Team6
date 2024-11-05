const nodemailer = require('nodemailer');
require('dotenv').config();

async function send2FACodeEmail(userEmail, code) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    const logoUrl = "https://raw.githubusercontent.com/csci-499-fa24/Team6/main/client/public/assets/logo.png"; // Adjust the URL as needed

    const mailOptions = {
        from: `"PANTRY PAL" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Your Two-Factor Authentication Code',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="background-color: #f0f0f0; padding: 20px; text-align: center;">
                    <img src="${logoUrl}" alt="PantryPal Logo" style="height: 70px; margin-bottom: 10px;">
                </div>
                <div style="padding: 20px; background-color: white; border-radius: 8px;">
                    <h2 style="color: #ff6b6b;">Your Two-Factor Authentication Code</h2>
                    <p>Hi,</p>
                    <p>Here is your code:</p>
                    <h3 style="color: #ff6b6b;">${code}</h3>
                    <p>This code will expire in 5 minutes. If you didn't request this code, please ignore this email.</p>
                </div>
                <div style="background-color: #f8f8f8; padding: 10px; text-align: center; color: #999; font-size: 0.85rem;">
                    <p>© ${new Date().getFullYear()} PantryPal. All rights reserved.</p>
                    <p><a href="YOUR_PRIVACY_POLICY_URL" style="color: #999; text-decoration: none;">Privacy Policy</a> | <a href="YOUR_TERMS_URL" style="color: #999; text-decoration: none;">Terms of Service</a></p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(`Error sending 2FA code email: ${error}`);
    }
}

module.exports = { send2FACodeEmail };
