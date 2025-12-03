# Fix Lỗi Hiển Thị Hình Ảnh - Image Display Issue Fix

## 📋 Tổng Quan

Tài liệu này mô tả chi tiết quá trình fix lỗi hiển thị hình ảnh trong hệ thống Lost & Found, bao gồm việc upload ảnh thành công nhưng không hiển thị được trên giao diện.

---

## 🐛 Vấn Đề Gặp Phải

### Mô tả
- **Hiện tượng**: Sau khi upload hình ảnh thành công, ảnh không hiển thị trên trang `LostItemDetailPage`
- **Lỗi Console**: 
  ```
  GET http://localhost:5000/api/uploads/1764792488850.jpg 
  net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin 404 (Not Found)
  ```
- **Lỗi tiếp theo**:
  ```
  GET http://localhost:5000/uploads/1764792625485.jpg 
  net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin 200 (OK)
  ```

### Nguyên nhân

#### 1. **URL Conversion Sai** (Lỗi đầu tiên)
- **Vấn đề**: Code đang sử dụng `API_URL` (`http://localhost:5000/api`) để tạo image URLs
- **Kết quả**: URL bị sai thành `http://localhost:5000/api/uploads/...`
- **Đúng**: Static files được serve từ base URL: `http://localhost:5000/uploads/...`

#### 2. **CORS Policy** (Lỗi thứ hai)
- **Vấn đề**: Mặc dù URL đã đúng (`http://localhost:5000/uploads/...`), browser vẫn chặn do thiếu CORS headers
- **Nguyên nhân**: 
  - `express.static()` không tự động thêm CORS headers
  - Helmet middleware có thể chặn cross-origin resources

---

## 🔧 Giải Pháp

### 1. Fix URL Conversion

#### Vấn đề
Code đang dùng `API_URL` để convert relative URLs thành absolute URLs:

```javascript
// ❌ SAI
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const imageUrl = `${API_URL}${url}`; // → http://localhost:5000/api/uploads/...
```

#### Giải pháp
Tách `BASE_URL` (không có `/api`) để serve static files:

```javascript
// ✅ ĐÚNG
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
const imageUrl = `${BASE_URL}${url}`; // → http://localhost:5000/uploads/...
```

#### Files đã sửa
- `frontend/src/pages/LostItemDetailPage.jsx`:
  - Function `handleImageUpload`: Convert URLs sau khi upload
  - `useEffect` khi load data: Convert URLs từ API response
  - Display images: Convert URLs khi render
  - Save images: Convert về relative URLs khi lưu

### 2. Fix CORS Headers

#### Vấn đề
Static files route không có CORS headers, browser chặn requests.

#### Giải pháp

**File: `backend/src/app.js`**

##### a) Thêm CORS middleware cho `/uploads` route:

```javascript
// Serve static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static('uploads'));
```

##### b) Cấu hình Helmet để cho phép cross-origin resources:

```javascript
app.use(helmet({
  contentSecurityPolicy: false, // Allow Swagger UI
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images from different origins
}));
```

---

## 📝 Chi Tiết Thay Đổi

### Backend Changes

#### `backend/src/app.js`

**Trước:**
```javascript
// Serve static files
app.use('/uploads', express.static('uploads'));
```

**Sau:**
```javascript
// Serve static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static('uploads'));
```

**Helmet config:**
```javascript
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
```

### Frontend Changes

#### `frontend/src/pages/LostItemDetailPage.jsx`

**1. Helper function để get BASE_URL:**
```javascript
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
```

**2. Convert URLs khi upload:**
```javascript
const absoluteUrls = result.data.urls.map(url => {
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/uploads/${url}`;
});
```

**3. Convert URLs khi load data:**
```javascript
const imageUrls = (data.data.images || []).map(url => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return `${BASE_URL}${url}`;
  return `${BASE_URL}/uploads/${url}`;
}).filter(Boolean);
```

**4. Convert về relative URLs khi save:**
```javascript
const imageUrlsForStorage = images.map(url => {
  if (!url) return url;
  if (url.includes(BASE_URL)) {
    return url.replace(BASE_URL, '');
  }
  if (url.startsWith('/')) return url;
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch (e) {
      return url;
    }
  }
  return url;
});
```

---

## ✅ Kết Quả

### Trước khi fix:
- ❌ URL sai: `http://localhost:5000/api/uploads/...` → 404 Not Found
- ❌ CORS error: `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin`

### Sau khi fix:
- ✅ URL đúng: `http://localhost:5000/uploads/...` → 200 OK
- ✅ CORS headers được set đúng
- ✅ Images hiển thị bình thường trên frontend

---

## 🧪 Testing

### Các bước test:

1. **Upload image:**
   - Vào trang "Báo Cáo Đồ Thất Lạc"
   - Tạo báo cáo mới với hình ảnh
   - Verify: Ảnh hiển thị ngay sau khi upload

2. **Edit và thêm image:**
   - Vào trang chi tiết báo cáo
   - Click "Chỉnh sửa"
   - Upload thêm ảnh mới
   - Verify: Ảnh mới hiển thị trong preview grid

3. **View saved images:**
   - Reload trang
   - Verify: Tất cả ảnh đã lưu hiển thị đúng

4. **Check Console:**
   - Mở Developer Tools (F12)
   - Verify: Không có lỗi CORS hoặc 404
   - Verify: Images load với status 200 OK

---

## 🔍 Debug Tips

### Nếu vẫn gặp lỗi:

1. **Check URL format:**
   ```javascript
   console.log('Image URL:', imageUrl);
   // Should be: http://localhost:5000/uploads/filename.jpg
   // NOT: http://localhost:5000/api/uploads/filename.jpg
   ```

2. **Check CORS headers:**
   - Mở Network tab trong DevTools
   - Click vào request image
   - Check Response Headers:
     - `Access-Control-Allow-Origin: *`
     - `Access-Control-Allow-Methods: GET, OPTIONS`

3. **Check backend logs:**
   - Verify static files route được register đúng
   - Verify CORS middleware được apply

4. **Clear cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac)
   - Clear browser cache

---

## 📚 Kiến Thức Liên Quan

### Static Files Serving
- Express.js serve static files từ một directory cụ thể
- Route `/uploads` map tới directory `uploads/` trên server
- Files được serve trực tiếp, không qua API routes

### CORS (Cross-Origin Resource Sharing)
- Browser security policy ngăn requests từ origin khác
- Cần set headers để cho phép cross-origin requests
- Static files cần CORS headers nếu frontend và backend khác origin

### URL Conversion
- **Relative URLs**: `/uploads/filename.jpg` (từ API response)
- **Absolute URLs**: `http://localhost:5000/uploads/filename.jpg` (để hiển thị)
- **Base URL**: `http://localhost:5000` (không có `/api`)

---

## 📅 Timeline

- **Ngày fix**: 2025-12-04
- **Commit**: `b804a3d`
- **Files changed**: 5 files
- **Lines changed**: +430 insertions, -21 deletions

---

## 👥 Contributors

- Fix implemented by: AI Assistant
- Reviewed by: Development Team

---

## 📌 Notes

- Đảm bảo `VITE_API_URL` trong `.env` không có `/api` ở cuối nếu dùng cho BASE_URL
- Hoặc sử dụng helper function để tự động remove `/api` như đã implement
- CORS policy có thể cần điều chỉnh cho production (thay `*` bằng specific origins)

---

**Last Updated**: 2025-12-04

