# ✅ Đã Import Data Thành Công!

## 📊 Dữ liệu đã được import

### Users (7 records)
- 3 Students (sv001, sv002, sv003)
- 1 Staff (staff001)
- 2 Security (sec001, sec002)
- 1 Admin (admin)

**Password mặc định cho tất cả users:** `Password123!`

### Campus (2 records)
- NVH - Nam Sài Gòn
- SHTP - Saigon Hi-Tech Park

### Item Categories (8 records)
- Điện thoại
- Ví/Bóp
- Túi xách
- Laptop
- Đồng hồ
- Sách
- Chìa khóa
- Khác

### Student Lost Reports (3 records)
- Mất điện thoại iPhone 13
- Mất ví da màu nâu
- Mất Laptop Dell XPS 13

### Staff Found Items (3 records)
- Điện thoại tìm được
- Ví tìm được
- Laptop tìm được

### Security Received Items (2 records)
- Điện thoại nhận từ bảo vệ
- Ví nhận từ bảo vệ

## 🔐 Thông tin đăng nhập

### Students
- Email: `sv001@fptu.edu.vn` / Password: `Password123!`
- Email: `sv002@fptu.edu.vn` / Password: `Password123!`
- Email: `sv003@fptu.edu.vn` / Password: `Password123!`

### Staff
- Email: `staff001@fptu.edu.vn` / Password: `Password123!`

### Security
- Email: `sec001@fptu.edu.vn` / Password: `Password123!`
- Email: `sec002@fptu.edu.vn` / Password: `Password123!`

### Admin
- Email: `admin@fptu.edu.vn` / Password: `Password123!`

## 🧪 Test API với data

```bash
# Lấy danh sách campus
curl https://localhost:7259/api/Campuses -k

# Login để lấy token
curl -X POST https://localhost:7259/api/Auth/login -k \
  -H "Content-Type: application/json" \
  -d '{"email":"sv001@fptu.edu.vn","password":"Password123!"}'

# Sau đó dùng token để test các API khác
```

## 📝 File seed data

File `seed-data.sql` đã được tạo tại:
`Backend/seed-data.sql`

Bạn có thể chạy lại để import data:
```bash
sqlcmd -S localhost,1433 -U sa -P "YourStrong@Passw0rd" -C -i seed-data.sql
```

