#!/bin/bash

API_URL="http://localhost:5000/api"

echo "🔐 Step 1: Logging in to get token..."
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
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${TOKEN:0:50}..."
echo ""

echo "============================================================"
echo ""

echo "📋 Step 2: Fetching My Reports (Báo Mất Đồ)..."
echo ""

MY_REPORTS_RESPONSE=$(curl -s -X GET "${API_URL}/lost-items/my-reports?page=1&limit=10" \
  -H "Authorization: Bearer ${TOKEN}")

echo "✅ My Reports API Response:"
echo "$MY_REPORTS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$MY_REPORTS_RESPONSE"
echo ""

echo "============================================================"
echo ""

echo "🔗 Step 3: Fetching Matching Suggestions (Khớp Đồ)..."
echo ""

SUGGESTIONS_RESPONSE=$(curl -s -X GET "${API_URL}/matching/suggestions" \
  -H "Authorization: Bearer ${TOKEN}")

echo "✅ Matching Suggestions API Response:"
echo "$SUGGESTIONS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$SUGGESTIONS_RESPONSE"
echo ""

echo "============================================================"
echo ""
echo "✅ API Testing Complete!"
echo ""

