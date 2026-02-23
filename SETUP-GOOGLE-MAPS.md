# 🗺️ Hướng dẫn cài đặt Google Maps API

Hướng dẫn chi tiết từng bước để cấu hình Google Maps API cho tính năng chọn địa điểm trên bản đồ.

## ⏱️ Thời gian: 3-5 phút

## 📋 Yêu cầu
- Tài khoản Gmail/Google
- Trình duyệt web

---

## 🚀 Các bước thực hiện

### Bước 1: Truy cập Google Cloud Console

1. Mở trình duyệt và truy cập:
   ```
   https://console.cloud.google.com/google/maps-apis
   ```

2. Đăng nhập bằng tài khoản Gmail của bạn

### Bước 2: Tạo Project mới

1. Click vào dropdown "Select a project" (góc trên bên trái)
2. Click nút "NEW PROJECT"
3. Điền thông tin:
   - **Project name**: `ResQHub` (hoặc tên tùy ý)
   - **Location**: Để mặc định hoặc chọn organization (nếu có)
4. Click "CREATE"
5. Đợi vài giây để project được tạo

### Bước 3: Enable APIs cần thiết

Bạn cần enable 3 APIs sau:

#### 3.1. Maps JavaScript API

1. Trong Google Cloud Console, click "Enable APIs and Services"
2. Tìm kiếm: `Maps JavaScript API`
3. Click vào kết quả đầu tiên
4. Click nút "ENABLE"
5. Đợi API được kích hoạt

#### 3.2. Places API

1. Click "Enable APIs and Services" lại
2. Tìm kiếm: `Places API`
3. Click vào kết quả
4. Click "ENABLE"

#### 3.3. Geocoding API

1. Click "Enable APIs and Services" lần nữa
2. Tìm kiếm: `Geocoding API`
3. Click vào kết quả
4. Click "ENABLE"

### Bước 4: Tạo API Key

1. Trong menu bên trái, click "Credentials"
2. Click nút "CREATE CREDENTIALS" (góc trên)
3. Chọn "API Key"
4. API Key sẽ được tạo và hiển thị trong popup
5. **QUAN TRỌNG**: Copy API Key này ngay (chỉ hiển thị 1 lần)

   Ví dụ API Key:
   ```
   AIzaSyC_example_key_1234567890abcdefghijklmn
   ```

### Bước 5: Cấu hình bảo mật (Khuyến nghị)

⚠️ **Rất quan trọng để bảo vệ API Key của bạn!**

1. Sau khi tạo xong, click vào API Key vừa tạo
2. Trong phần "API restrictions":
   - Chọn "Restrict key"
   - Chọn 3 APIs đã enable ở trên:
     - Maps JavaScript API
     - Places API
     - Geocoding API

3. Trong phần "Application restrictions":
   - Chọn "HTTP referrers (web sites)"
   - Click "ADD AN ITEM"
   - Thêm các domain:
     ```
     http://localhost:3000/*
     http://localhost:5173/*
     https://yourdomain.com/*
     ```
   - Click "DONE"

4. Click "SAVE" để lưu cấu hình

### Bước 6: Cấu hình trong dự án

1. Mở file `.env` trong thư mục gốc của dự án
2. Tìm dòng:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_API_KEY
   ```

3. Thay `YOUR_GOOGLE_MAPS_API_KEY` bằng API Key bạn vừa copy:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyC_example_key_1234567890abcdefghijklmn
   ```

4. **Lưu file** (Ctrl + S)

### Bước 7: Restart Development Server

1. Dừng server hiện tại (Ctrl + C trong terminal)
2. Chạy lại:
   ```bash
   npm run dev
   ```

3. Mở trình duyệt: `http://localhost:3000`

---

## ✅ Kiểm tra cấu hình

Sau khi cấu hình xong:

1. Đăng nhập vào hệ thống với tài khoản Admin
2. Vào menu **"Sự kiện"** → **"Tạo sự kiện mới"**
3. Chọn loại sự kiện: **"Đội cứu trợ - Tuyển tình nguyện viên"**
4. Trong phần **"Địa điểm tập trung"**:
   - Bạn sẽ thấy bản đồ Google Maps hiển thị
   - Khi nhập địa chỉ, sẽ có gợi ý autocomplete
   - Click trên bản đồ để chọn vị trí chính xác
   - Kéo marker để điều chỉnh vị trí

### Dấu hiệu cấu hình thành công:
- ✅ Bản đồ hiển thị bình thường
- ✅ Có gợi ý địa chỉ khi nhập
- ✅ Click/kéo trên map hoạt động
- ✅ Hiển thị tọa độ (latitude, longitude)

### Nếu có lỗi:
- ❌ Console hiển thị lỗi API Key
- ❌ Bản đồ không load
- ❌ Không có autocomplete

**Nguyên nhân có thể:**
- API Key chưa đúng hoặc còn dấu cách thừa
- Chưa enable đủ 3 APIs
- Giới hạn domain không đúng
- Chưa restart dev server

---

## 🎯 Tính năng khi đã cấu hình

Với Google Maps API đã cấu hình, bạn có thể:

1. **Autocomplete địa chỉ**:
   - Nhập địa chỉ → Gợi ý từ Google Places
   - Chọn nhanh từ danh sách

2. **Bản đồ interactive**:
   - Xem vị trí chính xác trên map
   - Click để chọn địa điểm
   - Kéo marker để điều chỉnh

3. **Reverse Geocoding**:
   - Click map → Tự động lấy địa chỉ
   - Hiển thị tọa độ chính xác

4. **Xem trước vị trí**:
   - Kiểm tra địa điểm trước khi lưu
   - Đảm bảo tọa độ chính xác

---

## 💰 Chi phí

### Google Maps Platform Pricing

Google Cloud cung cấp **$200 credit miễn phí mỗi tháng** cho tất cả người dùng mới.

#### Pricing cho các API được sử dụng:

| API | Giá | Free tier/tháng |
|-----|-----|-----------------|
| Maps JavaScript API | $7 per 1,000 loads | 28,500 loads |
| Places API (Autocomplete) | $2.83 per 1,000 requests | Included in $200 credit |
| Geocoding API | $5 per 1,000 requests | Included in $200 credit |

**Ví dụ thực tế:**
- Website có 1,000 users/tháng
- Mỗi user tạo 2 sự kiện
- Tổng: 2,000 requests
- Chi phí: **$0** (vì dưới free tier)

**Lưu ý:**
- $200 credit miễn phí mỗi tháng
- Chỉ tính phí khi vượt credit
- Có thể set budget alerts để kiểm soát chi phí

---

## 🔒 Bảo mật

### Các biện pháp bảo vệ API Key:

1. **KHÔNG bao giờ:**
   - Commit API key lên Git public
   - Share API key qua email/chat
   - Hard-code API key trong code

2. **NÊN:**
   - Lưu trong file `.env` (đã gitignore)
   - Giới hạn API key theo domain
   - Giới hạn APIs có thể sử dụng
   - Enable alerts khi có usage bất thường

3. **Kiểm tra:**
   - Xem usage hàng ngày tại Google Cloud Console
   - Set budget alerts
   - Review security recommendations

---

## ❓ Troubleshooting

### Lỗi: "This page can't load Google Maps correctly"

**Nguyên nhân:**
- API Key không hợp lệ
- Chưa enable APIs

**Giải pháp:**
1. Kiểm tra API Key trong `.env`
2. Verify đã enable đủ 3 APIs
3. Restart dev server

### Lỗi: "RefererNotAllowedMapError"

**Nguyên nhân:**
- Domain restrictions không đúng

**Giải pháp:**
1. Vào Google Cloud Console → Credentials
2. Edit API Key
3. Thêm domain chính xác: `http://localhost:3000/*`
4. Save và đợi vài phút

### Lỗi: "ApiNotActivatedMapError"

**Nguyên nhân:**
- Chưa enable APIs

**Giải pháp:**
1. Vào Google Cloud Console
2. Enable APIs đã nêu ở Bước 3
3. Đợi vài phút để APIs active

### Bản đồ hiển thị nhưng không có autocomplete

**Nguyên nhân:**
- Chưa enable Places API

**Giải pháp:**
1. Enable Places API
2. Restart dev server

---

## 🔗 Tài liệu tham khảo

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Get API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)
- [Best Practices](https://developers.google.com/maps/api-security-best-practices)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console log trong trình duyệt (F12)
2. Xem error message cụ thể
3. Tham khảo troubleshooting ở trên
4. Liên hệ team support

---

**Chúc bạn cấu hình thành công! 🎉**
