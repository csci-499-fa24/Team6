const { sendLowStockAlert, sendRecipeRecommendation, sendMonthlySummary } = require('./sms');
const { getLowIngredients } = require('./email'); // Reusing low ingredient function

const initializeCronJobs = () => {
    // Weekly Low Stock Alerts (Monday, 9 AM)
    cron.schedule('0 9 * * 1', async () => {
        const users = await getLowIngredients();
        for (let user of users) {
            if (user.phone && user.is_sms_subscribed) {
                const ingredients = user.lowIngredients.map(item => item.name);
                await sendLowStockAlert(user.phone, ingredients);
            }
        }
    });

    // Weekly Recipe Recommendation (Friday, 9 AM)
    cron.schedule('0 9 * * 5', async () => {
        const users = await getSubscribedUsers(); // Function to get users who want recipe SMS
        for (let user of users) {
            if (user.phone && user.is_sms_subscribed) {
                await sendRecipeRecommendation(user.phone);
            }
        }
    });

    // Monthly Summary (Last day of the month, 9 AM)
    cron.schedule('0 9 28-31 * *', async () => {
        const today = new Date();
        if (new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() === today.getDate()) {
            const users = await getSubscribedUsers(); // Get users with SMS enabled
            for (let user of users) {
                if (user.phone && user.is_sms_subscribed) {
                    await sendMonthlySummary(user.phone);
                }
            }
        }
    });
};

module.exports = { initializeCronJobs };