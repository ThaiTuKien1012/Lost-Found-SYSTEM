#!/bin/bash

API_URL="http://localhost:5000/api"

echo "🔍 Kiểm tra báo cáo mất đồ mới nhất..."
echo ""

# Login to get token
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sv001@fptu.edu.vn",
    "password": "Password123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

# Get latest reports
REPORTS_RESPONSE=$(curl -s -X GET "${API_URL}/lost-items/my-reports?page=1&limit=1" \
  -H "Authorization: Bearer ${TOKEN}")

LATEST_REPORT=$(echo "$REPORTS_RESPONSE" | python3 -c "
import sys, json
data = json.load(sys.stdin)
if data.get('success') and data.get('data') and len(data['data']) > 0:
    report = data['data'][0]
    print(json.dumps(report, indent=2, ensure_ascii=False))
else:
    print('No reports found')
" 2>/dev/null)

if [ -z "$LATEST_REPORT" ] || [ "$LATEST_REPORT" = "No reports found" ]; then
  echo "❌ Không tìm thấy báo cáo nào"
  exit 1
fi

echo "✅ BÁO CÁO MỚI NHẤT:"
echo ""
echo "$LATEST_REPORT" | python3 -c "
import sys, json
report = json.load(sys.stdin)
print('📋 Report ID:', report.get('reportId', 'N/A'))
print('📦 Tên đồ vật:', report.get('itemName', 'N/A'))
print('📝 Mô tả:', report.get('description', 'N/A'))
print('🏷️  Loại:', report.get('category', 'N/A'))
print('🎨 Màu sắc:', report.get('color', 'N/A'))
print('📍 Campus:', report.get('campus', 'N/A'))
print('📍 Địa điểm mất:', report.get('locationLost', 'N/A'))
print('📅 Ngày mất:', report.get('dateLost', 'N/A'))
print('📞 Số điện thoại:', report.get('phone', 'N/A'))
print('⚡ Trạng thái:', report.get('status', 'N/A'))
print('⭐ Độ ưu tiên:', report.get('priority', 'N/A'))
print('🕐 Thời gian tạo:', report.get('createdAt', 'N/A'))
print('🕐 Thời gian hết hạn:', report.get('expiresAt', 'N/A'))
"

