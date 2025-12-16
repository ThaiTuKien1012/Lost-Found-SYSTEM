# ✅ Đã Clone Repository từ branch merge-V2

## 📁 Thư mục đã clone

```
Backend/LostAndFound-Backend-V2/
```

## 📊 Thông tin Repository

- **Repository:** https://github.com/Nhan0ngu/LostAndFound-Backend
- **Branch:** merge-V2
- **Commit mới nhất:** b596b1f - update merge

## ✅ Controllers đã có (14 controllers)

1. `AuthController.cs`
2. `CampusesController.cs`
3. `NotificationsController.cs`
4. `SecurityFoundItemsController.cs`
5. `SecurityReceivedItemsController.cs`
6. `SecurityVerificationDecisionsController.cs`
7. `SecurityVerificationRequestsController.cs`
8. `Staff/StaffClaimsController.cs`
9. `Staff/StaffFoundItemsController.cs`
10. `Staff/StaffLostReportsController.cs`
11. `Staff/StaffReturnController.cs`
12. `Staff/StaffSecurityRequestsController.cs`
13. `StaffReturnReceiptsController.cs`
14. `StudentClaimsController.cs`

## 🚀 Cách chạy Backend

### 1. Cập nhật Connection String

Mở file `LostAndFound-Backend-V2/LostAndFound.Api/appsettings.json` và cập nhật:

```json
{
  "ConnectionStrings": {
    "LostAndFoundDb": "Server=localhost,1433;Database=LostAndFoundDB;User ID=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;Encrypt=False"
  }
}
```

### 2. Restore Packages

```bash
cd LostAndFound-Backend-V2/LostAndFound.Api
dotnet restore
```

### 3. Build Project

```bash
dotnet build
```

### 4. Chạy Backend

```bash
# HTTP
dotnet run --launch-profile http

# HTTPS
dotnet run --launch-profile https
```

### 5. Truy cập Swagger

- **HTTP:** http://localhost:5124/swagger
- **HTTPS:** https://localhost:7259/swagger

## 📝 Lưu ý

- Đảm bảo SQL Server container đang chạy
- Database `LostAndFoundDB` đã được tạo và import data
- Có thể cần cấu hình Cloudinary cho file upload (nếu có)

## 🔄 So sánh với thư mục cũ

Nếu bạn muốn thay thế thư mục cũ:

```bash
cd /Users/phamtrungkien/Documents/SWP-REAL/Lost-Found-SYSTEM/Backend
mv LostAndFound-Backend LostAndFound-Backend-old  # Backup
mv LostAndFound-Backend-V2 LostAndFound-Backend   # Đổi tên
```

