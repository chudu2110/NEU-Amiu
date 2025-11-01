# Neu Amiu – Monorepo Frontend & Backend

Tài liệu chính thức cho dự án Neu Amiu. Bao gồm cấu trúc repo, yêu cầu hệ thống, hướng dẫn thiết lập, chạy, build, kết nối API/Socket, cùng các lệnh mẫu có thể copy/paste.

## 1. Tổng quan & Cấu trúc
- `neu-amiu frontend/` — Frontend (Vite + React + TypeScript)
  - `components/`, `assets/`, `data/`, `hooks/`, `i18n/`
  - `index.html`, `index.tsx`, `App.tsx`, `index.css`
  - `package.json`, `vite.config.ts`, `tsconfig.json`, `.env.local`
- `neu-amiu backend/` — Backend (Express + Socket.io)
  - `server.js`, `src/routes/`, `src/store.js`
  - `.env.example`, `README.md`, `package.json`, `nodemon.json`, `.gitignore`

## 2. Yêu cầu hệ thống
- `Node.js >= 18.x`, `npm >= 9.x`
- Trình duyệt hiện đại (Chrome/Edge/Firefox/Safari)

## 3. Thiết lập Frontend
- Di chuyển vào thư mục:
```
cd "neu-amiu frontend"
```
- Cài đặt phụ thuộc:
```
npm ci
# hoặc
npm install
```
- Tạo/cấu hình `./.env.local` (tuỳ chọn):
```
echo VITE_APP_NAME="Neu Amiu" >> .env.local
echo VITE_API_BASE_URL="http://localhost:8080" >> .env.local
echo VITE_SOCKET_URL="http://localhost:8080" >> .env.local
```
- Chạy dev:
```
npm run dev
```
- Build production:
```
npm run build
```
- Preview bản build:
```
npm run preview
```

## 4. Thiết lập Backend
- Di chuyển vào thư mục:
```
cd "neu-amiu backend"
```
- Cài đặt phụ thuộc:
```
npm install
```
- Tạo file `.env` từ `.env.example`:
```
Copy-Item .env.example .env
```
- Chạy dev:
```
npm run dev
```
- Chạy production:
```
npm run start
```

## 5. Cấu hình môi trường
- Frontend (`neu-amiu frontend/.env.local`):
```
VITE_APP_NAME="Neu Amiu"
VITE_API_BASE_URL="http://localhost:8080"
VITE_SOCKET_URL="http://localhost:8080"
```
- Backend (`neu-amiu backend/.env`):
```
PORT=8080
CORS_ORIGIN=http://localhost:3000
```

## 6. Kết nối Frontend ↔ Backend
- HTTP API sử dụng `VITE_API_BASE_URL`.
- Socket.io sử dụng `VITE_SOCKET_URL`.
- Ví dụ kết nối Socket ở frontend:
```
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL);
socket.emit('join', { roomId: 'chat-123', userId: 1 });
socket.on('user:joined', (p) => console.log('joined', p));
socket.emit('message', { roomId: 'chat-123', from: 1, to: 2, text: 'hi' });
socket.on('message', (msg) => console.log('msg', msg));
```

## 7. API Backend (tổng quan)
- Health:
```
GET /health
```
- Người dùng:
```
GET  /api/users
POST /api/users    # body: { name, age, bio, image }
```
- Quản trị:
```
GET  /api/admin/stats
POST /api/admin/ban    # body: { userId }
```

## 8. Lệnh kiểm thử nhanh (PowerShell)
- Người dùng:
```
curl http://localhost:8080/api/users
curl -Method Post -Uri http://localhost:8080/api/users -Body (@{name='Alice';age=22} | ConvertTo-Json) -ContentType 'application/json'
```
- Quản trị:
```
curl http://localhost:8080/api/admin/stats
curl -Method Post -Uri http://localhost:8080/api/admin/ban -Body (@{userId=1} | ConvertTo-Json) -ContentType 'application/json'
```

## 9. Quy trình push lên GitHub
- Từ root repo:
```
git add .
git commit -m "docs: professional Vietnamese README with copy-paste commands"
git push origin main
```

## 10. Ghi chú
- Thư mục có khoảng trắng (`neu-amiu frontend`), trên Windows nên dùng dấu nháy khi `cd`.
- Nếu cổng `3000` bận, Vite tự chọn cổng khác (`3001`, `3002`).
- Ảnh demo dùng `images.unsplash.com`; VPN/Proxy/AdBlock có thể ảnh hưởng.
- Khi chuyển sang DB thật, thay `src/store.js` bằng kết nối MongoDB/MySQL/Postgres và triển khai xác thực (JWT/OAuth).