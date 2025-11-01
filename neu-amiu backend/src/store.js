// Bộ nhớ tạm (in-memory) cho demo
const rooms = new Map();
const users = [
  { id: 1, name: 'Demo User', age: 21, bio: 'demo', image: '' },
];
let nextUserId = 2;
const banned = new Set();

module.exports = { rooms, users, nextUserId, banned };