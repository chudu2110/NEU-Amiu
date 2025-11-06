# Hướng dẫn test chức năng Chat Realtime

## Bước 1: Khởi động Backend Server

Mở terminal thứ nhất và chạy:

```bash
cd "NEU-Amiu/neu-amiu backend"
npm install  # Chỉ cần chạy lần đầu
npm run dev
```

Backend sẽ chạy tại: `http://localhost:8080`

Bạn sẽ thấy log: `Neu Amiu backend listening on http://localhost:8080`

## Bước 2: Cấu hình Frontend

Tạo file `.env.local` trong thư mục `neu-amiu frontend` với nội dung:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:8080
```

**Lưu ý:** Nếu file `.env.local` đã tồn tại, hãy đảm bảo có 2 dòng trên.

## Bước 3: Khởi động Frontend

Mở terminal thứ hai và chạy:

```bash
cd "NEU-Amiu/neu-amiu frontend"
npm install  # Chỉ cần chạy lần đầu
npm run dev
```

Frontend sẽ chạy tại một port khác (thường là `http://localhost:5173` hoặc `http://localhost:3000`)

## Bước 3: Test Chat Realtime

**Lưu ý quan trọng:** 
- Sau khi đăng nhập, hệ thống sẽ tự động tạo 3 matches mẫu (Minh Anh, Bảo Trân, Quốc Hùng) để test
- **QUAN TRỌNG:** Hệ thống cũng sẽ tự động hiển thị các users **thực sự đang online** trong danh sách chat
- Khi 2 người đăng nhập khác nhau, họ sẽ tự động thấy nhau trong danh sách chat và có thể chat realtime

### Cách 1: Test bằng 2 cửa sổ trình duyệt (Test với users thực)

1. Mở 2 cửa sổ trình duyệt (hoặc 2 tab riêng biệt - một tab ẩn danh)
2. Truy cập URL frontend ở cả 2 cửa sổ
3. **Cửa sổ 1:** Đăng nhập với email `user1@st.neu.edu.vn` (ví dụ: `test1@st.neu.edu.vn`)
4. **Cửa sổ 2:** Đăng nhập với email **khác** `user2@st.neu.edu.vn` (ví dụ: `test2@st.neu.edu.vn`)
5. Vào tab **Chat** (icon tin nhắn ở thanh dưới) ở cả 2 cửa sổ
6. **Bạn sẽ thấy:**
   - 3 matches mẫu: Minh Anh, Bảo Trân, Quốc Hùng
   - **User thực đang online:** Trong cửa sổ 1 sẽ thấy user2, trong cửa sổ 2 sẽ thấy user1
7. **Cửa sổ 1:** Chọn user2 (user thực) để chat
8. **Cửa sổ 1:** Gõ tin nhắn và gửi
9. **Cửa sổ 2:** Vào cuộc trò chuyện với user1 → Tin nhắn sẽ xuất hiện ngay lập tức (realtime)!

### Cách 2: Test bằng Developer Console

Mở Developer Console (F12) trong cửa sổ chat và kiểm tra:

```javascript
// Kiểm tra kết nối socket
import socket from './data/socket';
console.log('Socket connected:', socket.connected);

// Gửi tin nhắn test
socket.emit('message', {
  roomId: 'global-room',
  from: 'test-user-1',
  to: 'test-user-2',
  text: 'Test message from console'
});
```

### Cách 3: Sử dụng script test tự động

**Lưu ý:** Cần cài `socket.io-client` trong thư mục gốc để chạy script:

```bash
cd "NEU-Amiu"
npm install socket.io-client
node test-socket-connection.js
```

### Cách 4: Sử dụng PowerShell script (Windows)

```powershell
cd "NEU-Amiu"
.\test-chat.ps1
```

Script này sẽ kiểm tra backend có chạy không và hiển thị hướng dẫn test.

## Kiểm tra kết nối

### Backend logs sẽ hiển thị:
- `client connected: [socket-id]` - Khi frontend kết nối thành công
- `client disconnected: [socket-id]` - Khi frontend ngắt kết nối

### Frontend Console sẽ hiển thị:
- Lỗi nếu không kết nối được: `Connection failed`
- Tin nhắn đến: Các event `message` được log

## Troubleshooting

1. **Backend không chạy**: Kiểm tra port 8080 có bị chiếm không
   ```bash
   # Windows PowerShell
   netstat -ano | findstr :8080
   ```

2. **Frontend không kết nối được**: 
   - Kiểm tra file `.env.local` đã có `VITE_SOCKET_URL=http://localhost:8080`
   - Khởi động lại frontend sau khi tạo/sửa `.env.local`

3. **Tin nhắn không hiển thị realtime**:
   - Kiểm tra console có lỗi không
   - Đảm bảo cả 2 cửa sổ đều trong cùng một room (`global-room`)
   - Kiểm tra backend logs có nhận được event `message` không

4. **CORS errors**:
   - Đảm bảo backend cho phép CORS từ frontend URL
   - Kiểm tra `CORS_ORIGIN` trong backend `.env` nếu có

## Lưu ý

- **Matches mẫu:** Khi đăng nhập/đăng ký, hệ thống tự động tạo 3 matches mẫu để test chat. Bạn không cần phải swipe để có matches.
- **Users online thực:** Hệ thống tự động detect và hiển thị các users thực sự đang online. Khi 2 người đăng nhập khác nhau, họ sẽ tự động thấy nhau trong danh sách chat.
- **Room chat:** Hiện tại dự án đang dùng room `global-room` cho test, tất cả người dùng đều join vào room này
- **Realtime:** Tin nhắn được broadcast cho tất cả client trong room, nên bạn cần mở 2 cửa sổ trình duyệt với 2 email khác nhau để test chat giữa 2 users thực
- **Backend:** Cần đảm bảo backend và frontend đều đang chạy đồng thời
- **Email:** Để đăng nhập, email phải có domain `@st.neu.edu.vn`. Mỗi email khác nhau sẽ tạo một user ID khác nhau.
- **Console logs:** Mở Developer Console (F12) để xem logs về users online/offline và socket events

