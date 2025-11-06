# 🗺️ Neu Amiu - Roadmap Phát Triển Dating App

## ✅ Đã Hoàn Thành

### Core Features
- [x] Authentication & Registration (Email-based với domain @st.neu.edu.vn)
- [x] User Onboarding (MBTI, Zodiac, Interests, Preferences)
- [x] Profile Management (Photos, Bio, Social Links, Card Frames)
- [x] Swipe/Match System (Left/Right swipe với animation)
- [x] Chat Realtime (Socket.io với global room)
- [x] Match Detection & Notification
- [x] Multi-language Support (Vietnamese/English)
- [x] Dark/Light Theme

---

## 🔥 Ưu Tiên Cao - Cần Làm Tiếp Theo

### 1. Database Integration (QUAN TRỌNG NHẤT) ⚠️
**Vấn đề hiện tại:** Dữ liệu chỉ lưu trong memory, mất khi restart server

**Cần làm:**
- [ ] Chọn database: **MongoDB** (recommended) hoặc PostgreSQL
- [ ] Setup database connection
- [ ] Migrate user data schema
- [ ] Migrate chat/messages schema
- [ ] Migrate matches schema
- [ ] Implement CRUD operations
- [ ] Add data persistence cho matches, chats, messages

**Lý do ưu tiên:** Không có DB thì không thể deploy production

---

### 2. Authentication & Security 🛡️
**Vấn đề hiện tại:** Authentication chỉ check email format, không có JWT/security

**Cần làm:**
- [ ] Implement JWT authentication
- [ ] Email verification (OTP hoặc magic link)
- [ ] Password reset functionality
- [ ] Session management
- [ ] Rate limiting cho API
- [ ] Input validation & sanitization
- [ ] CORS configuration cho production
- [ ] HTTPS setup

**Lý do ưu tiên:** Bảo mật là yêu cầu cơ bản

---

### 3. Photo Upload & Storage 📸
**Vấn đề hiện tại:** Dùng ảnh từ Unsplash, không có upload thật

**Cần làm:**
- [ ] Setup file storage (AWS S3, Cloudinary, hoặc local storage)
- [ ] Image upload API endpoint
- [ ] Image validation (format, size, dimensions)
- [ ] Image compression/optimization
- [ ] Multiple photo upload (up to 6 photos)
- [ ] Photo deletion
- [ ] Photo reordering
- [ ] Profile picture selection

**Lý do ưu tiên:** User cần upload ảnh thật để app hoạt động

---

### 4. Matching Algorithm & Discovery 🔍
**Vấn đề hiện tại:** Swipe random, không có algorithm thông minh

**Cần làm:**
- [ ] Matching algorithm dựa trên:
  - [ ] MBTI compatibility
  - [ ] Age preferences
  - [ ] Distance/location
  - [ ] Interests matching
  - [ ] Activity/engagement score
- [ ] Filters (age range, distance, interests)
- [ ] Discovery settings (who can see me)
- [ ] Daily swipe limit (free users)
- [ ] Boost/Super Like features
- [ ] "See who liked me" (premium)

**Lý do ưu tiên:** Cải thiện trải nghiệm matching

---

### 5. Notifications System 🔔
**Cần làm:**
- [ ] Push notifications cho:
  - [ ] New matches
  - [ ] New messages
  - [ ] Profile views
  - [ ] Likes received
- [ ] In-app notifications
- [ ] Email notifications (optional)
- [ ] Notification preferences/settings
- [ ] Badge counts (unread messages, new matches)

**Lý do ưu tiên:** Tăng engagement, user không bỏ lỡ tin nhắn

---

### 6. Block & Report System 🚫
**Cần làm:**
- [ ] Block user functionality
- [ ] Report user (spam, inappropriate, fake profile)
- [ ] Unmatch functionality
- [ ] Admin moderation panel
- [ ] Auto-moderation (detect spam/inappropriate content)

**Lý do ưu tiên:** Bảo vệ users khỏi spam/abuse

---

### 7. Location-Based Features 📍
**Cần làm:**
- [ ] Request location permission
- [ ] Store user location (city/area, không cần exact)
- [ ] Distance calculation
- [ ] "Nearby" filter
- [ ] Location-based discovery
- [ ] Privacy: distance blur option

**Lý do ưu tiên:** Dating app thường cần location

---

## 📋 Ưu Tiên Trung Bình

### 8. Enhanced Chat Features 💬
- [ ] Read receipts (seen status)
- [ ] Typing indicators
- [ ] Message reactions (emoji)
- [ ] Chat search
- [ ] Media sharing (photos trong chat)
- [ ] Voice messages
- [ ] Chat backup/export
- [ ] Message unsend (within time limit)

### 9. Profile Enhancement 👤
- [ ] Profile verification (badge)
- [ ] Profile completeness score
- [ ] Instagram/Spotify integration
- [ ] Video profiles (short clips)
- [ ] Question prompts (icebreakers)
- [ ] Relationship goals filter
- [ ] Height, education, job fields

### 10. Premium Features 💎
- [ ] Premium subscription system
- [ ] Payment integration (Stripe/MoMo)
- [ ] Unlimited likes
- [ ] See who liked you
- [ ] Passport (change location)
- [ ] Boost profile visibility
- [ ] Read receipts
- [ ] Advanced filters
- [ ] No ads

---

## 🚀 Ưu Tiên Thấp - Nice to Have

### 11. Social Features
- [ ] Activity feed (recent matches, new users)
- [ ] User stories (24h photo updates)
- [ ] Events/Group meetups
- [ ] Friend referrals

### 12. Analytics & Admin
- [ ] User analytics dashboard
- [ ] Admin panel improvements
- [ ] A/B testing framework
- [ ] User behavior tracking
- [ ] Retention metrics

### 13. Performance & Scalability
- [ ] Redis caching
- [ ] CDN for images
- [ ] Database indexing
- [ ] Load balancing
- [ ] Microservices architecture (nếu cần)

### 14. Mobile App
- [ ] React Native app
- [ ] Push notifications (native)
- [ ] Mobile-specific features
- [ ] App Store deployment

---

## 🎯 Kế Hoạch Phát Triển Ngắn Hạn (1-2 Tháng)

### Phase 1: Foundation (2-3 tuần)
1. **Database Setup** (MongoDB) - 3-5 ngày
2. **JWT Authentication** - 2-3 ngày
3. **Photo Upload** (Cloudinary/AWS S3) - 3-4 ngày
4. **Basic Security** (validation, rate limiting) - 2-3 ngày

### Phase 2: Core Features (2-3 tuần)
1. **Matching Algorithm** - 1 tuần
2. **Filters & Preferences** - 3-4 ngày
3. **Block/Report** - 2-3 ngày
4. **Location Features** - 2-3 ngày

### Phase 3: Enhancements (2-3 tuần)
1. **Notifications** - 1 tuần
2. **Enhanced Chat** (read receipts, typing) - 3-4 ngày
3. **Profile Improvements** - 3-4 ngày
4. **Testing & Bug Fixes** - 1 tuần

---

## 📝 Ghi Chú

### Công Nghệ Đề Xuất
- **Database:** MongoDB (dễ scale, schema flexible) hoặc PostgreSQL (structured)
- **File Storage:** Cloudinary (free tier tốt) hoặc AWS S3
- **Authentication:** JWT với refresh tokens
- **Notifications:** Firebase Cloud Messaging hoặc OneSignal
- **Payment:** Stripe (international) hoặc MoMo (Vietnam)

### Best Practices
- ✅ Write tests (unit tests, integration tests)
- ✅ Code reviews
- ✅ CI/CD pipeline
- ✅ Error logging (Sentry, LogRocket)
- ✅ API documentation (Swagger/OpenAPI)
- ✅ User feedback system
- ✅ Privacy policy & Terms of Service

### Cần Quan Tâm
- 🔒 User privacy & data protection (GDPR compliance)
- 🔒 Age verification
- 🔒 Content moderation
- 🔒 Spam prevention
- 🔒 Scalability planning

---

## 🎓 Học Hỏi Từ Apps Khác

### Tinder
- Swipe mechanism ✅ (đã có)
- Super Like
- Boost
- Passport

### Bumble
- Women message first
- BFF mode
- Business networking

### Hinge
- Prompts/questions
- Comment on photos
- "We met" feedback

---

## 📞 Next Steps

1. **Chọn và setup database** → MongoDB recommended
2. **Implement JWT auth** → Security foundation
3. **Photo upload** → Core functionality
4. **Matching algorithm** → Improve user experience

Sau khi hoàn thành Phase 1, app sẽ sẵn sàng cho beta testing với users thật!

---

**Last Updated:** [Today's Date]
**Current Status:** Chat Realtime ✅ Complete

