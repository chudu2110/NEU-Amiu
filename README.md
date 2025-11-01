# Neu Amiu – Monorepo Frontend & Backend (Tiếng Việt)

Dự án tổ chức thành hai thư mục chính: frontend và backend. Tài liệu này cập nhật đầy đủ cấu trúc mới, cách chạy từng phần, cách kết nối API và chat realtime.

## Cấu Trúc Thư Mục
- `neu-amiu frontend/` — ứng dụng Frontend (Vite + React + TypeScript)
  - `components/`, `assets/`, `data/`, `hooks/`, `i18n/`
  - `index.html`, `index.tsx`, `App.tsx`, `index.css`
  - `package.json`, `vite.config.ts`, `tsconfig.json`
  - `.env.local` (tuỳ chọn, cấu hình môi trường cục bộ)
- `neu-amiu backend/` — server Backend (Express + Socket.io)
  - `server.js` — khởi tạo API, CORS và Socket.io
  - `src/routes/users.js` — API người dùng (demo in-memory)
  - `src/routes/admin.js` — API quản trị (stats, ban)
  - `src/store.js` — bộ nhớ tạm demo dữ liệu
  - `.env.example`, `README.md`, `package.json`, `nodemon.json`, `.gitignore`

## Yêu Cầu Môi Trường
- `Node.js >= 18.x` và `npm >= 9.x`
- Trình duyệt hiện đại (Chrome/Edge/Firefox/Safari)

## Chạy Nhanh (A–Z)
- Frontend:
  - `cd "neu-amiu frontend"`
  - `npm ci` hoặc `npm install`
  - Tạo `.env.local` nếu cần (xem mục Cấu hình môi trường)
  - `npm run dev` → mở URL hiển thị (mặc định `http://localhost:3000/`)
  - Build: `npm run build` → artifact ở `dist/`
  - Preview: `npm run preview`
- Backend:
  - `cd "neu-amiu backend"`
  - `npm install`
  - Tạo `.env` từ `.env.example`
  - `npm run dev` → `http://localhost:8080`
  - Prod: `npm run start`

## Cấu Hình Môi Trường
- Frontend (`neu-amiu frontend/.env.local`):
  - `VITE_APP_NAME="Neu Amiu"`
  - `VITE_API_BASE_URL="http://localhost:8080"`
  - `VITE_SOCKET_URL="http://localhost:8080"`
- Backend (`neu-amiu backend/.env`):
  - `PORT=8080`
  - `CORS_ORIGIN=http://localhost:3000` (có thể là danh sách, ngăn cách bằng dấu phẩy)

## Kết Nối Frontend ↔ Backend
- HTTP API: sử dụng `VITE_API_BASE_URL` làm base URL.
- Socket.io: kết nối tới `VITE_SOCKET_URL`.
- Ví dụ kết nối socket ở frontend:
```
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_SOCKET_URL);
socket.emit('join', { roomId: 'chat-123', userId: 1 });
socket.on('user:joined', (p) => console.log('joined', p));
socket.emit('message', { roomId: 'chat-123', from: 1, to: 2, text: 'hi' });
socket.on('message', (msg) => console.log('msg', msg));
```

## API Chính (Backend)
- `GET /health` — kiểm tra trạng thái.
- `GET /api/users` — danh sách người dùng (demo).
- `POST /api/users` — tạo user `{ name, age, bio, image }`.
- `GET /api/admin/stats` — thống kê hệ thống.
- `POST /api/admin/ban` — chặn user `{ userId }`.

## Chat Realtime (Socket.io)
- Sự kiện: `join` `{ roomId, userId }`, `user:joined`, `message` `{ roomId, from, to, text }`.
- Gợi ý dùng `roomId` là `chatId` hoặc ghép từ 2 userId theo quy ước.

## Lệnh Thử Nhanh (PowerShell)
- Users:
  - `curl http://localhost:8080/api/users`
  - `curl -Method Post -Uri http://localhost:8080/api/users -Body (@{name='Alice';age=22} | ConvertTo-Json) -ContentType 'application/json'`
- Admin:
  - `curl http://localhost:8080/api/admin/stats`
  - `curl -Method Post -Uri http://localhost:8080/api/admin/ban -Body (@{userId=1} | ConvertTo-Json) -ContentType 'application/json'`

## Quy Trình Push Lên GitHub
- Từ root repo:
  - `git add .`
  - `git commit -m "chore: organize monorepo (frontend/backend) + docs"`
  - `git push origin <branch>`

## Ghi Chú & Mẹo
- Tên thư mục có khoảng trắng (`neu-amiu frontend`), khi dùng dòng lệnh trên Windows nên đặt trong dấu nháy: `cd "neu-amiu frontend"`.
- Nếu cổng `3000` bận, Vite tự chọn cổng khác (`3001`, `3002`).
- Ảnh demo dùng `images.unsplash.com` để ổn định hiển thị; nếu dùng VPN/Proxy/AdBlock vui lòng kiểm tra lại kết nối.
- Khi chuyển sang DB thật, thay `src/store.js` bằng kết nối MongoDB/MySQL/Postgres và thêm xác thực (JWT/OAuth).