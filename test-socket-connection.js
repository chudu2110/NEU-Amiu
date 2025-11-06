/**
 * Script test kết nối Socket.io với backend
 * Chạy: node test-socket-connection.js
 */

const { io } = require('socket.io-client');

const SOCKET_URL = process.env.SOCKET_URL || 'http://localhost:8080';

console.log('🔌 Đang kết nối tới:', SOCKET_URL);

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Kết nối thành công
socket.on('connect', () => {
  console.log('✅ Kết nối thành công! Socket ID:', socket.id);
  
  // Join room global
  socket.emit('join', { roomId: 'global-room', userId: 'test-client-1' });
  console.log('📨 Đã join room: global-room');
  
  // Gửi tin nhắn test sau 2 giây
  setTimeout(() => {
    const testMessage = {
      roomId: 'global-room',
      from: 'test-client-1',
      to: 'test-client-2',
      text: `Test message từ script lúc ${new Date().toLocaleTimeString('vi-VN')}`,
    };
    
    console.log('📤 Đang gửi tin nhắn test...');
    socket.emit('message', testMessage);
  }, 2000);
});

// Nhận tin nhắn
socket.on('message', (data) => {
  console.log('📥 Nhận được tin nhắn:', {
    from: data.from,
    text: data.text,
    timestamp: new Date(data.ts).toLocaleTimeString('vi-VN'),
  });
});

// User joined
socket.on('user:joined', (data) => {
  console.log('👤 User joined:', data);
});

// Lỗi kết nối
socket.on('connect_error', (error) => {
  console.error('❌ Lỗi kết nối:', error.message);
  console.log('💡 Đảm bảo backend đang chạy tại', SOCKET_URL);
  process.exit(1);
});

// Ngắt kết nối
socket.on('disconnect', (reason) => {
  console.log('🔌 Đã ngắt kết nối:', reason);
  if (reason === 'io server disconnect') {
    // Server đã ngắt kết nối, cần kết nối lại thủ công
    socket.connect();
  }
});

// Kết thúc sau 10 giây
setTimeout(() => {
  console.log('\n⏱️  Test hoàn tất. Đóng kết nối...');
  socket.disconnect();
  process.exit(0);
}, 10000);

// Xử lý Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 Đang đóng kết nối...');
  socket.disconnect();
  process.exit(0);
});

