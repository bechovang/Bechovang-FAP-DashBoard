# Hướng Dẫn Load Extension Vào Chrome

## 🚨 Vấn đề gặp phải:
```
Failed to load extension
Manifest file is missing or unreadable
Could not load manifest.
```

## ✅ Giải pháp đã áp dụng:

### 1. **Sửa Unicode trong manifest.json**
- **Vấn đề**: Description có ký tự tiếng Việt gây lỗi encoding
- **Sửa**: Đổi sang ASCII thuần túy
```json
// CŨ (LỖI):
"description": "Cào dữ liệu từ FAP để hiển thị trên Web App mới."

// MỚI (ĐÚNG):  
"description": "Cao du lieu tu FAP de hien thi tren Web App moi."
```

## 🔧 Cách Load Extension:

### Bước 1: Mở Chrome Extensions
1. Mở Chrome/Edge
2. Vào: `chrome://extensions/`
3. Bật **"Developer mode"** (toggle ở góc trên phải)

### Bước 2: Load Extension
1. Nhấn **"Load unpacked"**
2. Chọn thư mục: `C:\Users\Admin\Desktop\GIT CLONE\Bechovang-FAP-DashBoard\exetension\dist`
3. Nhấn **"Select Folder"**

### Bước 3: Kiểm tra
- Extension sẽ xuất hiện trong danh sách
- Icon sẽ hiện trên thanh công cụ Chrome
- Không có lỗi đỏ

## 🔍 Nếu vẫn lỗi:

### Kiểm tra 1: Manifest có đúng không?
```bash
# Vào thư mục dist
cd dist

# Kiểm tra file manifest
type manifest.json
```

### Kiểm tra 2: Cấu trúc thư mục
```
dist/
├── manifest.json ✅
├── background.js ✅  
├── popup.html ✅
├── popup.js ✅
├── icons/ ✅
│   ├── icon16.png
│   ├── icon48.png  
│   └── icon128.png
└── content-scripts/ ✅
    ├── fap-scraper.js
    ├── fap-curriculum-scraper.js
    ├── fap-profile-scraper.js
    ├── fap-schedule-scraper.js
    └── debug-html-extractor.js
```

### Kiểm tra 3: Validate JSON
```powershell
Get-Content dist/manifest.json | ConvertFrom-Json
```

## 🎯 Sau khi load thành công:

1. **Icon extension** sẽ xuất hiện trên thanh công cụ
2. **Nhấn icon** → popup hiện ra với các nút
3. **Vào trang FAP** → test chức năng
4. **Dùng nút debug** để tạo file debug.txt

Extension đã được sửa lỗi manifest và sẵn sàng sử dụng! 🚀 