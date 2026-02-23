# 🎉 Cấu hình Google Maps API - Hoàn tất!

## ✅ Đã chuẩn bị cho bạn:

### 📁 Files được tạo/cập nhật:

1. **`.env`** - File cấu hình environment variables
   - Đã có placeholder cho Google Maps API Key
   - Có hướng dẫn chi tiết ngay trong file

2. **`SETUP-GOOGLE-MAPS.md`** - Hướng dẫn đầy đủ
   - Từng bước lấy API key từ Google Cloud Console
   - Ảnh mô tả (dạng text)
   - Troubleshooting thường gặp
   - Thông tin pricing và bảo mật

3. **`check-maps-config.ps1`** - Script kiểm tra cấu hình
   - Tự động kiểm tra xem đã cấu hình API key chưa
   - Hiển thị hướng dẫn nếu chưa có
   - Xác nhận cấu hình thành công

4. **Components mới:**
   - `src/components/ui/alert.tsx` - Alert component
   - `src/components/ui/google-maps-setup-alert.tsx` - Alert hướng dẫn setup
   - `src/components/ui/location-autocomplete.tsx` - Đã nâng cấp với:
     - Bản đồ interactive
     - Click/kéo marker
     - Reverse geocoding
     - Hiển thị tọa độ

5. **Updated files:**
   - `src/pages/admin/CreateEvent/index.tsx` - Hiển thị alert setup
   - `package.json` - Thêm script `check:maps`
   - `README.md` - Thêm hướng dẫn cấu hình
   - `.env.example` - Template với Google Maps config

---

## 🚀 Bước tiếp theo:

### Option 1: Cấu hình Google Maps API (Khuyến nghị)

1. **Mở file hướng dẫn:**
   ```bash
   # Mở bằng text editor yêu thích
   notepad SETUP-GOOGLE-MAPS.md
   
   # Hoặc xem ngay trong VS Code
   code SETUP-GOOGLE-MAPS.md
   ```

2. **Làm theo hướng dẫn** (3-5 phút):
   - Truy cập Google Cloud Console
   - Tạo project và enable APIs
   - Lấy API key
   - Paste vào file `.env`

3. **Kiểm tra cấu hình:**
   ```bash
   npm run check:maps
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

5. **Test tính năng:**
   - Login → Sự kiện → Tạo sự kiện mới
   - Chọn "Đội cứu trợ - Tuyển tình nguyện viên"
   - Thử nhập địa chỉ và click trên bản đồ

### Option 2: Dùng mà không cấu hình

Nếu bạn chưa muốn cấu hình ngay, không sao cả!

- ✅ App vẫn hoạt động bình thường
- ✅ Vẫn tạo sự kiện được
- ✅ Vẫn nhập địa chỉ (dạng text thông thường)
- ❌ Không có autocomplete từ Google
- ❌ Không có bản đồ interactive
- ❌ Không click/kéo marker

---

## 📊 Tính năng sau khi cấu hình:

### Khi tạo sự kiện "Đội cứu trợ":

**Trước (chưa cấu hình):**
```
[Input text box]
Nhập địa chỉ: __________________
```

**Sau (đã cấu hình):**
```
[Alert] Hướng dẫn cấu hình Google Maps (nếu chưa có)

[Input text box with autocomplete]
Nhập địa chỉ: Đà Nẵng________
                ↓ Gợi ý:
                - Đà Nẵng, Việt Nam
                - Đà Nẵng Beach
                - Sân bay Đà Nẵng

[Bản đồ interactive]
┌─────────────────────────────┐
│   🗺️ Google Maps           │
│                             │
│       📍 Marker             │
│   (Click or drag me!)       │
│                             │
└─────────────────────────────┘

Tọa độ: 16.0544, 108.2022
• Click trên bản đồ để chọn vị trí
• Kéo marker để điều chỉnh
```

---

## 🆘 Cần trợ giúp?

### Kiểm tra cấu hình hiện tại:
```bash
npm run check:maps
```

### Đọc hướng dẫn đầy đủ:
```bash
# Windows
notepad SETUP-GOOGLE-MAPS.md

# VS Code
code SETUP-GOOGLE-MAPS.md

# Hoặc mở trong browser của bạn
```

### Các lỗi thường gặp:

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| "This page can't load Google Maps" | API Key không hợp lệ | Kiểm tra API key trong `.env` |
| "RefererNotAllowedMapError" | Domain restrictions | Thêm `http://localhost:3000/*` |
| "ApiNotActivatedMapError" | Chưa enable APIs | Enable 3 APIs trong Console |
| Không có autocomplete | Chưa enable Places API | Enable Places API |

---

## 💡 Tips:

1. **Bảo mật API Key:**
   - File `.env` đã được thêm vào `.gitignore`
   - KHÔNG commit API key lên Git
   - Giới hạn API key theo domain trong Google Cloud Console

2. **Chi phí:**
   - Google cung cấp $200 credit miễn phí/tháng
   - Đủ cho hàng chục nghìn requests
   - Thiết lập budget alerts để theo dõi

3. **Performance:**
   - Google Maps script chỉ load khi cần
   - Cached sau lần đầu
   - Không ảnh hưởng tốc độ nếu không dùng

---

## 📚 Tài liệu:

- [Hướng dẫn chi tiết](SETUP-GOOGLE-MAPS.md)
- [Google Maps Documentation](https://developers.google.com/maps/documentation)
- [Pricing](https://mapsplatform.google.com/pricing/)
- [Best Practices](https://developers.google.com/maps/api-security-best-practices)

---

**Chúc bạn phát triển thành công! 🚀**

Nếu có câu hỏi, hãy check file `SETUP-GOOGLE-MAPS.md` hoặc chạy `npm run check:maps`.
