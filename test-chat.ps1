# Script test Chat Realtime - Neu Amiu
# Chạy: .\test-chat.ps1

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Test Chat Realtime - Neu Amiu" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra backend có đang chạy không
Write-Host "🔍 Đang kiểm tra backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Backend đang chạy tại http://localhost:8080" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Backend không chạy!" -ForegroundColor Red
    Write-Host "💡 Hãy chạy backend trước:" -ForegroundColor Yellow
    Write-Host "   cd 'neu-amiu backend'" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Hướng dẫn test
Write-Host "📋 HƯỚNG DẪN TEST:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1️⃣  Khởi động Frontend (nếu chưa chạy):" -ForegroundColor Yellow
Write-Host "   cd 'neu-amiu frontend'" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Mở 2 cửa sổ trình duyệt:" -ForegroundColor Yellow
Write-Host "   - Cửa sổ 1: URL frontend (ví dụ: http://localhost:5173)" -ForegroundColor White
Write-Host "   - Cửa sổ 2: URL frontend (hoặc tab ẩn danh)" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  Vào trang Chat:" -ForegroundColor Yellow
Write-Host "   - Đăng nhập hoặc bỏ qua" -ForegroundColor White
Write-Host "   - Vào Chat/ChatList" -ForegroundColor White
Write-Host "   - Chọn một user để chat" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  Test gửi tin nhắn:" -ForegroundColor Yellow
Write-Host "   - Cửa sổ 1: Gõ tin nhắn và gửi" -ForegroundColor White
Write-Host "   - Cửa sổ 2: Tin nhắn sẽ xuất hiện ngay (realtime)" -ForegroundColor White
Write-Host ""

Write-Host "5️⃣  Kiểm tra Console (F12):" -ForegroundColor Yellow
Write-Host "   - Không có lỗi kết nối" -ForegroundColor White
Write-Host "   - Tin nhắn được log" -ForegroundColor White
Write-Host ""

Write-Host "📝 Xem file test-chat-realtime.md để biết chi tiết hơn" -ForegroundColor Cyan
Write-Host ""

