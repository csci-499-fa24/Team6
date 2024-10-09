require('dotenv').config();
const { checkAndSendEmail } = require('./email');
const db = require('./db');
const nodemailer = require('nodemailer');


describe('Email environment variables', () => {
    it('should have EMAIL_USER and EMAIL_PASS set correctly', () => {
        expect(process.env.EMAIL_USER).toBe('pantrypal.notifications@gmail.com');

        expect(process.env.EMAIL_PASS).toBe('oljpzstklsqknfjz');
    });
});
