Dựa trên docs, tôi tìm thấy API endpoint cho Security:

API #11: POST /api/found-items - "Ghi nhận tìm được"

text
Auth: Required
Role: Security Officer
Status: 201 Created
✅ ĐÚNG - BẢO VỆ CÓ FORM NHẶT ĐƯỢC ĐỒ
Theo docs, Security Officer (Bảo vệ) CÓ form ghi nhận tìm được đồ với các fields:

📋 Form Fields (API #11):

javascript
Request Body: {
  itemName: "Điện thoại màu đen",
  description: "Có vết xước pha sau",
  category: "PHONE",
  color: "Black",
  condition: "good",  // ← Add field: excellent, good, slightlydamaged, damaged
  campus: "NVH",
  dateFound: "2025-12-04T09:00:00Z",  // ← Khác "dateLost"
  locationFound: "Quầy tiếp tân",     // ← Khác "locationLost"
  images: ["url1", "url2"]
}

Response 201: {
  foundId: "FF-NVH-2025-005",  // Format: FF-CAMPUS-YEAR-NUMBER
  itemName: "Điện thoại màu đen",
  campus: "NVH",
  status: "unclaimed",  // ← Khác Lost Item (pending)
  condition: "good",
  createdAt: "2025-12-04T09:15:00Z"
}
🆚 SO SÁNH: FORM BÁO MẤT vs FORM NHẶT ĐƯỢC
Field	Báo Mất (Student)	Nhặt Được (Security)
Tên Đồ	✅ itemName (3-100 chars)	✅ itemName
Mô Tả	✅ description (10-1000 chars)	✅ description
Loại	✅ category (enum)	✅ category (enum)
Màu	❌ color (optional)	✅ color (required)
Ngày	✅ dateLost (no future)	✅ dateFound (no future)
Nơi	❌ locationLost (optional)	✅ locationFound (required)
Campus	✅ campus (required)	✅ campus (required)
Số ĐT	❌ phone (optional)	❌ NOT in found form
Ảnh	❌ images (optional)	✅ images
Condition	❌ NOT have	✅ condition (NEW)
warehouseLocation	❌ NOT have	✅ warehouseLocation (optional)
📝 VALIDATION RULES - FORM NHẶT ĐƯỢC
New Fields trong Found Item Form:

javascript
// 1. Condition (NEW)
{
  required: true,
  enum: ['excellent', 'good', 'slightlydamaged', 'damaged'],
  validationMessages: {
    required: "Vui lòng chọn tình trạng đồ"
  }
}

// 2. dateFound (Replace dateLost)
{
  required: true,
  notFutureDate: true,
  validationMessages: {
    required: "Vui lòng chọn ngày tìm được",
    futureDate: "Ngày tìm được không thể trong tương lai"
  }
}

// 3. locationFound (Required, not optional)
{
  required: true,  // ← CHANGE: Bắt buộc cho Security
  minLength: 1,
  maxLength: 200,
  trim: true,
  validationMessages: {
    required: "Vui lòng nhập nơi tìm được"
  }
}

// 4. Condition (NEW field)
{
  required: true,
  enum: ['excellent', 'good', 'slightlydamaged', 'damaged'],
  dropdown: true,
  validationMessages: {
    required: "Vui lòng chọn tình trạng đồ"
  }
}

// 5. warehouseLocation (Optional)
{
  required: false,
  maxLength: 200,
  trim: true,
  validationMessages: {}
}
🎯 FORM NHẶT ĐƯỢC - COMPLETE FIELDS
text
[Tên Đồ]* (itemName)
[Mô Tả]* (description)
[Loại Đồ]* (category)
[Màu Sắc]* (color) ← REQUIRED (unlike Lost Form)
[Ngày Tìm Được]* (dateFound) ← Different name
[Nơi Tìm Được]* (locationFound) ← REQUIRED
[Campus]* (campus)
[Tình Trạng]* (condition) ← NEW FIELD
  └─ Tuyệt vời (excellent)
  ├─ Tốt (good)
  ├─ Hơi hư hại (slightlydamaged)
  └─ Hư hại (damaged)
[Vị Trí Kho]  (warehouseLocation) ← Optional, NEW
[Hình Ảnh]   (images) ← Max 5 files
[Ghi Nhận]   (button)
📊 SUMMARY
✅ ĐÚNG: Bảo vệ CÓ form nhặt được đồ
✅ API #11: POST /api/found-items
✅ Role: Security Officer
✅ Status: 201 Created
✅ Response: foundId (FF-SHTP-2025-001 format)

Differences từ Lost Form:

✅ Thêm field condition (excellent, good, slightlydamaged, damaged)

✅ Thêm field warehouseLocation (nơi lưu giữ)

✅ locationFound bắt buộc (không optional)

✅ color bắt buộc (không optional)

✅ dateFound thay dateLost

❌ KHÔNG có phone field