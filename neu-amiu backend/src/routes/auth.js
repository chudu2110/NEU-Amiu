const express = require('express');
const router = express.Router();
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../services/jwtService');
const { sendOTPMail } = require('../services/mailService');
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

router.use(cookieParser());

// In-memory OTP store (DEV). Later move to Redis
const otpStore = {}; // { email: { otp, expireAt } }

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- send OTP ---
router.post('/send-otp', async (req, res) => {
  try {
    let { email } = req.body;
    email = String(email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ ok: false, message: 'Email required' });

    const otp = generateOTP();
    otpStore[email] = { otp, expireAt: Date.now() + 5 * 60 * 1000 }; // 5 minutes

    try { await sendOTPMail(email, otp); }
    catch (err) { console.warn('Mail send failed:', err.message); console.log('OTP:', otp); }

    return res.json({ ok: true, message: 'OTP sent' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// --- verify OTP ---
router.post('/verify-otp', async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = String(email || '').trim().toLowerCase();
    if (!email || !otp) return res.status(400).json({ ok: false, message: 'email+otp required' });

    const record = otpStore[email];
    if (!record) return res.status(400).json({ ok: false, message: 'No OTP requested' });
    if (Date.now() > record.expireAt) { delete otpStore[email]; return res.status(400).json({ ok: false, message: 'OTP expired' }); }
    if (record.otp !== String(otp)) return res.status(400).json({ ok: false, message: 'Invalid OTP' });

    delete otpStore[email];

    // find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, verified: true });
    } else {
      // Nếu user đã tồn tại, update verified status
      if (!user.verified) {
        user.verified = true;
        await user.save();
      }
      // Nếu user đã có password (từ lần test trước), reset password để cho phép tạo lại
      // Điều này cho phép user test lại flow đăng ký mới
      if (user.password) {
        user.password = null;
        await user.save();
      }
    }

    // return success, frontend can call /create-password next
    return res.json({ ok: true, message: 'OTP verified', email: user.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// --- create password ---
router.post('/create-password', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = String(email || '').trim().toLowerCase();
    if (!email || !password) return res.status(400).json({ ok: false, msg: 'email + password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ ok: false, msg: 'user not found' });
    if (!user.verified) return res.status(400).json({ ok: false, msg: 'email not verified yet' });
    if (user.password) return res.status(400).json({ ok: false, msg: 'password already created' });

    user.password = await argon2.hash(password);
    await user.save();

    return res.json({ ok: true, msg: 'password created successfully. now login normally' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// --- login ---
router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;
    email = String(email || '').trim().toLowerCase();
    if (!email || !password) return res.status(400).json({ ok: false, message: 'email + password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ ok: false, message: 'User not found' });
    if (!user.verified) return res.status(400).json({ ok: false, message: 'Email not verified' });
    if (!user.password) return res.status(400).json({ ok: false, message: 'Password not set yet' });

    const valid = await argon2.verify(user.password, password);
    if (!valid) return res.status(401).json({ ok: false, message: 'Invalid credentials' });

    const accessToken = signAccessToken({ sub: user._id.toString(), email: user.email });
    const refreshToken = signRefreshToken({ sub: user._id.toString(), email: user.email });

    const decoded = jwt.decode(refreshToken);
    const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 30 * 24 * 3600 * 1000);

    await RefreshToken.create({ token: refreshToken, userId: user._id, expiresAt });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expiresAt.getTime() - Date.now()
    });

    return res.json({
      ok: true,
      accessToken,
      user: { id: user._id, email: user.email, name: user.name }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// --- refresh token ---
router.post('/refresh', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];
    if (!token) return res.status(401).json({ ok: false, message: 'No refresh token' });

    let payload;
    try { payload = verifyRefreshToken(token); }
    catch (err) { return res.status(401).json({ ok: false, message: 'Invalid refresh token' }); }

    const stored = await RefreshToken.findOne({ token });
    if (!stored) return res.status(401).json({ ok: false, message: 'Refresh token revoked' });

    const accessToken = signAccessToken({ sub: payload.sub, email: payload.email });
    return res.json({ ok: true, accessToken });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// --- logout ---
router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken || req.headers['x-refresh-token'];
    if (token) await RefreshToken.deleteOne({ token });

    res.clearCookie('refreshToken');
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;
