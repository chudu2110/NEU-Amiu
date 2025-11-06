const nodemailer = require('nodemailer');

const useSendGrid = !!process.env.SENDGRID_API_KEY;

let transporter;

if (useSendGrid) {
  // If using SendGrid SMTP or API, you can also use nodemailer with SendGrid SMTP:
  transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
  });
} else {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

async function sendMail({ to, subject, html, text }) {
  if (!transporter) throw new Error('No mail transporter configured');
  const info = await transporter.sendMail({
    from: `"Neu Amiu" <no-reply@neu-amiu.local>`,
    to,
    subject,
    text,
    html,
  });
  return info;
}

module.exports = { sendMail };
