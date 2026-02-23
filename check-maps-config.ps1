# ============================================
# Kiểm tra cấu hình Google Maps API
# ============================================

Write-Host "
🔍 Đang kiểm tra cấu hình...
" -ForegroundColor Cyan

# Đọc file .env
if (Test-Path .env) {
    $content = Get-Content .env -Raw
    
    # Tìm API key
    if ($content -match 'VITE_GOOGLE_MAPS_API_KEY=(.+)') {
        $apiKey = $matches[1].Trim()
        
        if ($apiKey -eq 'YOUR_GOOGLE_MAPS_API_KEY') {
            Write-Host "❌ Google Maps API chưa được cấu hình" -ForegroundColor Red
            Write-Host ""
            Write-Host "📋 Hướng dẫn cấu hình:" -ForegroundColor Yellow
            Write-Host "  1. Mở file SETUP-GOOGLE-MAPS.md" -ForegroundColor White
            Write-Host "  2. Làm theo hướng dẫn (chỉ mất 3-5 phút)" -ForegroundColor White
            Write-Host "  3. Paste API key vào file .env" -ForegroundColor White
            Write-Host "  4. Restart dev server: npm run dev" -ForegroundColor White
            Write-Host ""
            Write-Host "💡 Nếu chưa cấu hình:" -ForegroundColor Cyan
            Write-Host "   - Bạn vẫn dùng được app bình thường" -ForegroundColor White
            Write-Host "   - Chỉ không có autocomplete địa chỉ và bản đồ interactive" -ForegroundColor White
        }
        elseif ($apiKey -match '^AIza[0-9A-Za-z_-]{35}$') {
            Write-Host "✅ Google Maps API đã được cấu hình!" -ForegroundColor Green
            Write-Host ""
            Write-Host "API Key: $($apiKey.Substring(0, 10))...$($apiKey.Substring($apiKey.Length - 4))" -ForegroundColor Gray
            Write-Host ""
            Write-Host "🎯 Tính năng có sẵn:" -ForegroundColor Cyan
            Write-Host "  ✓ Autocomplete địa chỉ từ Google Places" -ForegroundColor Green
            Write-Host "  ✓ Bản đồ interactive" -ForegroundColor Green
            Write-Host "  ✓ Click/kéo marker để chọn vị trí" -ForegroundColor Green
            Write-Host "  ✓ Reverse geocoding (tọa độ → địa chỉ)" -ForegroundColor Green
        }
        else {
            Write-Host "⚠️  API Key có vẻ không đúng format" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Format đúng: AIzaSy... (39 ký tự)" -ForegroundColor Gray
            Write-Host "API Key hiện tại: $apiKey" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "❌ Không tìm thấy VITE_GOOGLE_MAPS_API_KEY trong .env" -ForegroundColor Red
    }
}
else {
    Write-Host "❌ Không tìm thấy file .env" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Tạo file .env:" -ForegroundColor Yellow
    Write-Host "  Copy-Item .env.example .env" -ForegroundColor White
}

Write-Host ""
