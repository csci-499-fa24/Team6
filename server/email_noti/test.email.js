require('dotenv').config({ path: '../.env' });
const cron = require('node-cron');
const path = require('path');
const { checkAndSendEmail } = require('./email');

cron.schedule('1 0 * * *', () => {
    console.log('Running checkAndSendEmail at 12:01 AM EST');
    checkAndSendEmail();
}, {
    timezone: 'America/New_York'
});

console.log(`Current time: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`);
