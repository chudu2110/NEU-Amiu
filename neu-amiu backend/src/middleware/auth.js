const { verifyAccessToken } = require('../services/jwtService');

function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ ok:false, message:'No auth header' });

    const parts = header.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ ok:false, message:'Bad auth format' });

    const token = parts[1];
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch (err) {
    return res.status(401).json({ ok:false, message: 'Invalid token' });
  }
}

module.exports = requireAuth;
