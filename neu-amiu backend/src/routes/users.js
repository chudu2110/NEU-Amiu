const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMail } = require('../lib/mailer');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '1d';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email) return res.status(400).json({ error: 'email required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'email already used' });

    const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;

    const user = new User({ email, passwordHash, name });
    await user.save();

    // generate verify token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

    const verifyLink = `${BACKEND_URL}/api/users/verify?token=${token}`; // or FRONTEND_URL route

    const html = `
      <p>Hi ${name || ''},</p>
      <p>Thanks for registering. Click to verify your email:</p>
      <p><a href="${verifyLink}">Verify email</a></p>
      <p>If click doesn't work, use this link: ${verifyLink}</p>
    `;

    // send email async (we await to ensure deliver in demo; in prod you may queue)
    await sendMail({
      to: email,
      subject: 'Verify your Neu Amiu account',
      html,
      text: `Verify: ${verifyLink}`
    });

    return res.json({ ok: true, userId: user._id, note: 'verification email sent' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'server error' });
  }
});

// Verify route (called when user clicks link)
router.get('/verify', async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(400).send('token required');

    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.userId;
    if (!userId) return res.status(400).send('invalid token');

    const user = await User.findById(userId);
    if (!user) return res.status(404).send('user not found');

    user.verified = true;
    await user.save();

    // redirect to frontend success page
    const redirectUrl = `${FRONTEND_URL}/verify-success`;
    return res.redirect(redirectUrl);
  } catch (err) {
    console.error(err);
    return res.status(400).send('invalid or expired token');
  }
});

module.exports = router;
