/*
HƯỚNG DẪN NHANH BACKEND
1) cd "neu-amiu backend"
2) npm install
3) Sao chép .env từ .env.example và chỉnh PORT/CORS_ORIGIN
4) npm run dev

KẾT NỐI FRONTEND
- Trong `neu-amiu frontend/.env.local` đặt:
  VITE_API_BASE_URL=http://localhost:8080
  VITE_SOCKET_URL=http://localhost:8080

CHAT REALTIME (Socket.io)
- Sự kiện: 'join', 'message', 'user:joined'
- Gợi ý dùng roomId: chuỗi bất kỳ (ví dụ chatId)
*/

const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: (process.env.CORS_ORIGIN || '*').split(',') }));

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: { origin: (process.env.CORS_ORIGIN || '*').split(',') },
});

const usersRouter = require('./src/routes/users');
const adminRouter = require('./src/routes/admin');

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// API routes
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);

// Socket.io events
io.on('connection', (socket) => {
  // Client gửi { roomId, userId }
  socket.on('join', ({ roomId, userId }) => {
    if (!roomId) return;
    socket.join(roomId);
    socket.to(roomId).emit('user:joined', { userId, ts: Date.now() });
  });

  // Client gửi { roomId, from, to, text }
  socket.on('message', ({ roomId, from, to, text }) => {
    if (!roomId || !text) return;
    io.to(roomId).emit('message', {
      roomId,
      from,
      to,
      text,
      ts: Date.now(),
    });
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Neu Amiu backend listening on http://localhost:${PORT}`);
});