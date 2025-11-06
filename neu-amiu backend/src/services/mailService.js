const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

async function sendOTPMail(to, otp) {
  const html = `<p>Your Neu Amiu OTP: <b>${otp}</b></p><p>This code expires in 5 minutes.</p>`;
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Neu Amiu - Your OTP Code',
    text: `Your OTP: ${otp}`,
    html
  });
}

module.exports = { sendOTPMail, transporter };
