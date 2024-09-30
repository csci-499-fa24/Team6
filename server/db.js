require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool ({
    host: process.env.PGHOST,
    user: process.env.PGUSERNAME,
    password: process.env.PGPASSWORD,
    database: process.env.PGMAINTENANCE,
    port: process.env.PGPORT,
    ssl: {
        rejectUnauthorized: false,  // Disable certificate verification (for local development)
    },
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};