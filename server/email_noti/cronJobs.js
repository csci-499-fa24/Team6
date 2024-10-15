require('dotenv').config({ path: '../.env' });
const cron = require('node-cron');
const path = require('path');
const { checkAndSendEmail } = require('./email');

const initializeCronJobs = () => {
    // Schedule to run once every day at 12:01 AM
    cron.schedule('1 0 * * *', () => {
        checkAndSendEmail();
    }, {
        timezone: 'America/New_York'
    });
};

module.exports = { initializeCronJobs };
