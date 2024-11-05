const nodemailer = require('nodemailer');
const { send2FACodeEmail } = require('../email_noti/2fa');

// Mock nodemailer
jest.mock('nodemailer');

describe('2FA Email Service', () => {
    // Test data
    const testEmail = 'test@example.com';
    const testCode = '123456';
    const mockSendMail = jest.fn();

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Mock the nodemailer createTransport function
        nodemailer.createTransport.mockReturnValue({
            sendMail: mockSendMail
        });
    });

    test('should create transporter with correct config', async () => {
        await send2FACodeEmail(testEmail, testCode);

        expect(nodemailer.createTransport).toHaveBeenCalledWith({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    });

    test('should send email with correct options', async () => {
        await send2FACodeEmail(testEmail, testCode);

        expect(mockSendMail).toHaveBeenCalledTimes(1);
        
        const emailOptions = mockSendMail.mock.calls[0][0];
        expect(emailOptions).toMatchObject({
            from: expect.stringContaining(process.env.EMAIL_USER),
            to: testEmail,
            subject: 'Your Two-Factor Authentication Code',
            html: expect.stringContaining(testCode)
        });
    });

    test('should include necessary email content', async () => {
        await send2FACodeEmail(testEmail, testCode);

        const emailOptions = mockSendMail.mock.calls[0][0];
        expect(emailOptions.html).toEqual(expect.stringContaining('Two-Factor Authentication Code'));
        expect(emailOptions.html).toEqual(expect.stringContaining(testCode));
        expect(emailOptions.html).toEqual(expect.stringContaining('expire in 5 minutes'));
        expect(emailOptions.html).toEqual(expect.stringContaining('PantryPal'));
    });

    test('should handle email sending errors gracefully', async () => {
        // Mock console.error to prevent error output during test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        
        // Make sendMail throw an error
        mockSendMail.mockRejectedValueOnce(new Error('Failed to send email'));

        await send2FACodeEmail(testEmail, testCode);

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error sending 2FA code email')
        );

        consoleSpy.mockRestore();
    });

    test('should use current year in copyright notice', async () => {
        await send2FACodeEmail(testEmail, testCode);

        const currentYear = new Date().getFullYear().toString();
        const emailOptions = mockSendMail.mock.calls[0][0];
        
        expect(emailOptions.html).toEqual(
            expect.stringContaining(`© ${currentYear} PantryPal`)
        );
    });
});