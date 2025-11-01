/*
API Người dùng (demo/in-memory)
Lệnh thử nhanh (PowerShell):
  curl http://localhost:8080/api/users
  curl -Method Post -Uri http://localhost:8080/api/users -Body (@{name='Alice';age=22} | ConvertTo-Json) -ContentType 'application/json'
*/

const express = require('express');
const router = express.Router();
const store = require('../store');

// Danh sách user
router.get('/', (req, res) => {
  res.json(store.users);
});

// Tạo user đơn giản
router.post('/', (req, res) => {
  const u = req.body || {};
  const id = store.nextUserId++;
  const user = {
    id,
    name: u.name || `User ${id}`,
    age: u.age || null,
    bio: u.bio || '',
    image: u.image || '',
  };
  store.users.push(user);
  res.status(201).json(user);
});

module.exports = router;