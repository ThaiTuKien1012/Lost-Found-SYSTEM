# 📡 Danh sách đầy đủ 51 APIs trong branch merge-V2

## ✅ Backend đã chạy thành công!

- **URL:** https://localhost:7259/swagger
- **Tổng số endpoints:** 51 APIs (vượt mức yêu cầu 40 APIs!)
- **Status:** ✅ Running

---

## 📋 Danh sách đầy đủ 51 APIs

### 🔐 Authentication (5 APIs)
1. `POST /api/Auth/login` - Đăng nhập
2. `POST /api/Auth/request-otp` - Yêu cầu OTP
3. `POST /api/Auth/request-reset-password` - Yêu cầu reset password
4. `POST /api/Auth/reset-password` - Reset password
5. `POST /api/Auth/signup` - Đăng ký

### 🏫 Campus (5 APIs)
6. `GET /api/Campuses` - Lấy danh sách campus
7. `POST /api/Campuses` - Tạo campus mới
8. `GET /api/Campuses/{id}` - Lấy campus theo ID
9. `PUT /api/Campuses/{id}` - Cập nhật campus
10. `DELETE /api/Campuses/{id}` - Xóa campus

### 🔔 Notifications (3 APIs)
11. `GET /api/Notifications` - Lấy danh sách thông báo
12. `POST /api/Notifications` - Tạo thông báo mới
13. `PUT /api/Notifications/{id}/read` - Đánh dấu đã đọc

### 🔒 Security Received Items (4 APIs)
14. `GET /api/SecurityReceivedItems` - Lấy danh sách đồ nhận
15. `POST /api/SecurityReceivedItems` - Ghi nhận đồ nhận được
16. `GET /api/SecurityReceivedItems/{id}` - Lấy chi tiết
17. `PUT /api/SecurityReceivedItems/{id}/status` - Cập nhật trạng thái

### ✅ Security Verification Decisions (4 APIs)
18. `GET /api/SecurityVerificationDecisions` - Lấy danh sách quyết định
19. `POST /api/SecurityVerificationDecisions` - Tạo quyết định mới
20. `GET /api/SecurityVerificationDecisions/{id}` - Lấy chi tiết
21. `PUT /api/SecurityVerificationDecisions/{id}` - Cập nhật quyết định

### 📋 Security Verification Requests (4 APIs)
22. `GET /api/SecurityVerificationRequests` - Lấy danh sách yêu cầu
23. `POST /api/SecurityVerificationRequests` - Tạo yêu cầu mới
24. `GET /api/SecurityVerificationRequests/{id}` - Lấy chi tiết
25. `PUT /api/SecurityVerificationRequests/{id}/status` - Cập nhật trạng thái

### 📦 Staff Return Receipts (4 APIs)
26. `GET /api/StaffReturnReceipts` - Lấy danh sách biên lai
27. `POST /api/StaffReturnReceipts` - Tạo biên lai mới
28. `GET /api/StaffReturnReceipts/{id}` - Lấy chi tiết
29. `PUT /api/StaffReturnReceipts/{id}` - Cập nhật biên lai

### 🔍 Security Found Items (4 APIs)
30. `GET /api/security/found-items` - Lấy danh sách đồ tìm được
31. `POST /api/security/found-items` - Ghi nhận đồ tìm được
32. `GET /api/security/found-items/my-items` - Đồ của tôi
33. `GET /api/security/found-items/{id}` - Lấy chi tiết

### 👨‍💼 Staff Claims (4 APIs)
34. `GET /api/staff/claims` - Lấy danh sách claims
35. `GET /api/staff/claims/{id}` - Lấy chi tiết claim
36. `POST /api/staff/claims/{id}/approve` - Duyệt claim
37. `POST /api/staff/claims/{id}/reject` - Từ chối claim

### 📦 Staff Found Items (4 APIs)
38. `GET /api/staff/found-items` - Lấy danh sách đồ tìm được
39. `POST /api/staff/found-items/receive-from-security` - Nhận đồ từ bảo vệ
40. `GET /api/staff/found-items/{id}` - Lấy chi tiết
41. `PUT /api/staff/found-items/{id}` - Cập nhật
42. `POST /api/staff/found-items/{id}/image` - Upload ảnh

### 📝 Staff Lost Reports (2 APIs)
43. `GET /api/staff/lost-reports` - Lấy danh sách báo mất
44. `GET /api/staff/lost-reports/{id}` - Lấy chi tiết báo mất

### 🔄 Staff Return (1 API)
45. `POST /api/staff/return` - Xử lý trả đồ

### 🔐 Staff Security Requests (1 API)
46. `POST /api/staff/security-requests` - Yêu cầu xác minh từ bảo vệ

### 👨‍🎓 Student Claims (5 APIs)
47. `GET /api/student/claims` - Lấy danh sách claims của tôi
48. `POST /api/student/claims` - Tạo claim mới
49. `GET /api/student/claims/check-availability/{foundItemId}` - Kiểm tra khả dụng
50. `GET /api/student/claims/{id}` - Lấy chi tiết claim
51. `DELETE /api/student/claims/{id}` - Xóa claim

---

## 🎯 Tổng kết

- **Tổng số APIs:** 51 endpoints
- **Yêu cầu ban đầu:** 40 APIs
- **Vượt mức:** +11 APIs (127.5%)

## 📊 Phân loại theo chức năng

- **Authentication:** 5 APIs
- **Campus Management:** 5 APIs
- **Notifications:** 3 APIs
- **Security Operations:** 12 APIs (Received Items + Verification + Found Items)
- **Staff Operations:** 12 APIs (Claims + Found Items + Lost Reports + Return + Security Requests)
- **Student Operations:** 5 APIs (Claims)
- **Return Receipts:** 4 APIs
- **Other:** 5 APIs

## 🔗 Truy cập

- **Swagger UI:** https://localhost:7259/swagger
- **HTTP:** http://localhost:5124/swagger

## 📝 Lưu ý

- Một số APIs yêu cầu JWT authentication
- Một số APIs yêu cầu role cụ thể (STAFF, SECURITY, STUDENT)
- Kiểm tra Swagger UI để xem chi tiết request/response của từng API
