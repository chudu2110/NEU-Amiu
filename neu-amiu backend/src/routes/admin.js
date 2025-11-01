/*
API Quản trị (demo)
Ví dụ lệnh:
  curl http://localhost:8080/api/admin/stats
  curl -Method Post -Uri http://localhost:8080/api/admin/ban -Body (@{userId=1} | ConvertTo-Json) -ContentType 'application/json'
*/

const express = require('express');
const router = express.Router();
const store = require('../store');

router.get('/stats', (req, res) => {
  res.json({ users: store.users.length, rooms: store.rooms.size, banned: store.banned.size });
});

router.post('/ban', (req, res) => {
  const { userId } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId required' });
  store.banned.add(Number(userId));
  res.json({ ok: true, userId: Number(userId) });
});

module.exports = router;