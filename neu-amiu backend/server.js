const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (process.env.CORS_ORIGIN || '*').split(','),
  credentials: true
}));

// MONGO CONNECT
mongoose.connect(process.env.MONGODB_URI, {})
  .then(() => console.log("✅ MongoDB connected:", process.env.MONGODB_URI))
  .catch(err => console.error("❌ MongoDB connect error:", err));

// ROUTES IMPORT
const authRouter = require('./src/routes/auth');
const usersRouter = require('./src/routes/users');
const adminRouter = require('./src/routes/admin');

const requireAuth = require('./src/middleware/auth');

// DEBUG LOG AUTH ROUTES
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) {
    console.log(`[DEBUG] ${req.method} ${req.path}`);
  }
  next();
});

// ROUTES REGISTER
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);

// HEALTH CHECK
app.get('/health', (req, res) => res.json({ ok: true }));

// PROTECTED TEST
app.get('/api/protected', requireAuth, (req,res)=> {
  res.json({ ok:true, msg:'protected', user:req.user });
});

// TEST MAIL
const { sendTestMail } = require("./src/services/mailService");
app.get("/testmail", async (req, res) => {
  try {
    await sendTestMail();
    res.json({ ok: true, message: "Mail sent!" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// SOCKET SERVER
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: (process.env.CORS_ORIGIN || '*').split(',') }
});

// ---- socket logic giữ nguyên bạn đang xài ----


// 404 CATCH
app.use('*', (req, res) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
});

// START SERVER
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Neu Amiu backend listening on http://localhost:${PORT}`);
});
