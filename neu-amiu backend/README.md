# Neu Amiu Backend (Express + Socket.io)

Tài liệu này hướng dẫn cách cài đặt, chạy backend và kết nối với frontend.

## Yêu cầu
- Node.js >= 18, npm >= 9

## Cài đặt & Chạy
1) Đi vào thư mục backend:
- `cd "neu-amiu backend"`

2) Cài đặt phụ thuộc:
- `npm install`

3) Tạo file `.env` từ `.env.example` và chỉnh nếu cần:
- `PORT=8080`
- `CORS_ORIGIN=http://localhost:3000`

4) Chạy dev:
- `npm run dev`
- Server lắng nghe tại `http://localhost:8080`

5) Chạy production:
- `npm run start`

## API Chính
- `GET /health` — kiểm tra trạng thái.
- `GET /api/users` — lấy danh sách người dùng (demo in-memory).
- `POST /api/users` — tạo user (name, age, bio, image).
- `GET /api/admin/stats` — thống kê.
- `POST /api/admin/ban` — chặn user `{ userId }`.

## Chat Realtime (Socket.io)
Sự kiện phía client cần biết:
- `join` — payload `{ roomId, userId }`: tham gia phòng.
- `user:joined` — thông báo khi người dùng khác vào phòng.
- `message` — payload `{ roomId, from, to, text }`: gửi/nhận tin nhắn.

Ví dụ (pseudo code) ở frontend:
```
const socket = io(import.meta.env.VITE_SOCKET_URL);
socket.emit('join', { roomId: 'chat-123', userId: 1 });
socket.on('user:joined', (p) => console.log('joined', p));
socket.emit('message', { roomId: 'chat-123', from: 1, to: 2, text: 'hi' });
socket.on('message', (msg) => console.log('msg', msg));
```

## Kết Nối Với Frontend
Trong `neu-amiu frontend/.env.local`:
- `VITE_API_BASE_URL=http://localhost:8080`
- `VITE_SOCKET_URL=http://localhost:8080`

## Nâng Cấp Sau Này
- Thay `src/store.js` bằng kết nối DB thật (MongoDB/MySQL/Postgres).
- Thêm xác thực JWT/OAuth cho user/admin.
- Ghi log, rate limit, bảo mật CORS theo môi trường.

## Lệnh thử nhanh (PowerShell)
```
# Users
curl http://localhost:8080/api/users
curl -Method Post -Uri http://localhost:8080/api/users -Body (@{name='Alice';age=22} | ConvertTo-Json) -ContentType 'application/json'

# Admin
curl http://localhost:8080/api/admin/stats
curl -Method Post -Uri http://localhost:8080/api/admin/ban -Body (@{userId=1} | ConvertTo-Json) -ContentType 'application/json'
```