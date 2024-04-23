import { createTransport } from 'nodemailer';

/**
 * Important:
 * Mailtrap does no longer work with port=25
 * We can use port 2525, secure: false, requireTLS: true
 * according to: https://mailtrap.io/blog/send-emails-with-nodejs/
 */
const sendEmail = async (options: any) => {
  // 1) Create a transporter
  const transporter = createTransport({
    //service: 'Gmail',
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    // Activate in gmail "less secure app" option, limited at 500 emails per day
  });

  // 2) Define the email options
  const mailOptions = {
    from: 'Thang Tran <hello@thangtrandev.net>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export { sendEmail };
