const nodemailer = require('nodemailer');
const db = require('../db');
const { checkAndSendEmail, createTransporter } = require('./email');

jest.mock('nodemailer');
jest.mock('../db');

describe('Email service', () => {
  let mockSendMail;
  let mockVerify;

  beforeAll(() => {
    process.env.EMAIL_USER = 'test_email_user';
    process.env.EMAIL_PASS = 'test_email_pass';
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockSendMail = jest.fn().mockResolvedValue({ response: 'Email sent: OK' });
    mockVerify = jest.fn().mockResolvedValue(true);

    const mockTransporter = {
      sendMail: mockSendMail,
      verify: mockVerify,
    };

    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  it('should verify the email transporter and send an email with correct ingredients', async () => {
    db.query.mockResolvedValue({
        rows: [
            {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                ingredient_name: 'Tomatoes',
                amount: 3,
            },
            {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                ingredient_name: 'Onions',
                amount: 2,
            },
        ],
    });

    await createTransporter();
    await checkAndSendEmail();

    expect(mockVerify).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledTimes(1);

    const emailHtml = mockSendMail.mock.calls[0][0].html;

    expect(emailHtml).toContain('<li>"Tomatoes", you currently have 3 units remaining</li>');
    expect(emailHtml).toContain('<li>"Onions", you currently have 2 units remaining</li>');
  });

  it('should pass a dummy test', () => {
    expect(true).toBe(true);
  });
});
