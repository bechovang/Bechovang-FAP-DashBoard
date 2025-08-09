# FAP Revamp Helper - Browser Extension

## English Version

### Overview
This is a browser extension that scrapes data from the FAP (FPT Academic Portal) system. It extracts exam schedules and curriculum data to help students manage their academic information more effectively.

### Features
- **Profile Scraping**: Extracts student profile information including personal details and academic info
- **Exam Schedule Scraping**: Automatically extracts exam schedule data from FAP
- **Curriculum Scraping**: Extracts complete curriculum information including subjects and terms
- **JSON Export**: Downloads the scraped data as separate JSON files or combined
- **User-friendly Interface**: Simple popup interface for easy operation

### Installation

1. **Build the Extension**:
   ```bash
   cd exetension
   npm install
   npm run build
   ```

2. **Load Extension in Browser**:
   - Open Chrome/Edge and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" button
   - Select the `exetension/dist` folder

### Usage

1. **Login to FAP**: Make sure you're logged into https://fap.fpt.edu.vn
2. **Open Extension**: Click on the FAP Revamp Helper icon in your browser toolbar
3. **Start Scraping**: Click "Cào Profile + Lịch Thi + Chương Trình Học" button
4. **Wait for Completion**: The extension will automatically:
   - Open the profile page and scrape student information
   - Open the exam schedule page and scrape data
   - Open the curriculum page and scrape data
   - Combine all datasets
5. **Download Data**: Once complete, you can download:
   - **"Tải tất cả dữ liệu (JSON)"**: Downloads all data (profile + exam + curriculum) in one file
   - **"Tải Profile (JSON)"**: Downloads only student profile data
   - **"Tải Lịch Thi (JSON)"**: Downloads only exam schedule data
   - **"Tải Chương Trình Học (JSON)"**: Downloads only curriculum data

### Data Structure

The exported JSON contains:
```json
{
  "profile": {
    "studentId": "SE203055",
    "fullName": "Nguyễn Ngọc Phúc",
    "email": "phuchcm2006@gmail.com",
    "campus": "FPTU-Hồ Chí Minh",
    "curriculumCode": "BIT_SE_20B",
    "lastUpdated": "2025-08-04T08:00:00Z"
  },
  "examSchedule": [
    {
      "no": "1",
      "subjectCode": "PRF192",
      "subjectName": "Programming Fundamentals",
      "date": "15/12/2024",
      "room": "BE-301",
      "time": "07:30",
      "examForm": "Written",
      "examType": "FE",
      "publicationDate": "10/12/2024"
    }
  ],
  "curriculum": {
    "lastUpdated": "2024-12-10T10:30:00.000Z",
    "programCode": "BIT_SE_20B",
    "subjects": [
      {
        "termNo": 1,
        "subjectCode": "PRF192",
        "subjectName": "Programming Fundamentals"
      }
    ]
  }
}
```

### Technical Details

- **Content Scripts**: `fap-scraper.ts` and `fap-curriculum-scraper.ts`
- **Background Script**: `background.ts` handles navigation and data coordination
- **Popup Interface**: `popup.html` and `popup.ts` provide user interface
- **Build System**: Vite with TypeScript compilation

---

## Phiên Bản Tiếng Việt

### Tổng Quan
Đây là một tiện ích mở rộng trình duyệt để cào dữ liệu từ hệ thống FAP (FPT Academic Portal). Nó trích xuất lịch thi và dữ liệu chương trình học để giúp sinh viên quản lý thông tin học tập hiệu quả hơn.

### Tính Năng
- **Cào Profile**: Trích xuất thông tin sinh viên bao gồm thông tin cá nhân và học tập
- **Cào Lịch Thi**: Tự động trích xuất dữ liệu lịch thi từ FAP
- **Cào Chương Trình Học**: Trích xuất thông tin đầy đủ về chương trình học bao gồm các môn học và học kỳ
- **Xuất JSON**: Tải về dữ liệu đã cào dưới dạng các file JSON riêng biệt hoặc kết hợp
- **Giao Diện Thân Thiện**: Popup đơn giản dễ sử dụng

### Cài Đặt

1. **Build Extension**:
   ```bash
   cd exetension
   npm install
   npm run build
   ```

2. **Tải Extension vào Trình Duyệt**:
   - Mở Chrome/Edge và truy cập `chrome://extensions/`
   - Bật "Developer mode" (công tắc ở góc trên phải)
   - Nhấn nút "Load unpacked"
   - Chọn thư mục `exetension/dist`

### Cách Sử Dụng

1. **Đăng Nhập FAP**: Đảm bảo bạn đã đăng nhập vào https://fap.fpt.edu.vn
2. **Mở Extension**: Nhấn vào biểu tượng FAP Revamp Helper trên thanh công cụ trình duyệt
3. **Bắt Đầu Cào Dữ Liệu**: Nhấn nút "Cào Profile + Lịch Thi + Chương Trình Học"
4. **Chờ Hoàn Tất**: Extension sẽ tự động:
   - Mở trang profile và cào thông tin sinh viên
   - Mở trang lịch thi và cào dữ liệu
   - Mở trang chương trình học và cào dữ liệu
   - Kết hợp tất cả bộ dữ liệu
5. **Tải Dữ Liệu**: Khi hoàn tất, bạn có thể tải về:
   - **"Tải tất cả dữ liệu (JSON)"**: Tải về tất cả dữ liệu (profile + lịch thi + chương trình học) trong một file
   - **"Tải Profile (JSON)"**: Chỉ tải về dữ liệu thông tin sinh viên
   - **"Tải Lịch Thi (JSON)"**: Chỉ tải về dữ liệu lịch thi
   - **"Tải Chương Trình Học (JSON)"**: Chỉ tải về dữ liệu chương trình học

### Cấu Trúc Dữ Liệu

File JSON xuất ra chứa:
```json
{
  "profile": {
    "studentId": "SE203055",
    "fullName": "Nguyễn Ngọc Phúc",
    "email": "phuchcm2006@gmail.com",
    "campus": "FPTU-Hồ Chí Minh",
    "curriculumCode": "BIT_SE_20B",
    "lastUpdated": "2025-08-04T08:00:00Z"
  },
  "examSchedule": [
    {
      "no": "1",
      "subjectCode": "PRF192",
      "subjectName": "Programming Fundamentals",
      "date": "15/12/2024", 
      "room": "BE-301",
      "time": "07:30",
      "examForm": "Written",
      "examType": "FE",
      "publicationDate": "10/12/2024"
    }
  ],
  "curriculum": {
    "lastUpdated": "2024-12-10T10:30:00.000Z",
    "programCode": "BIT_SE_20B",
    "subjects": [
      {
        "termNo": 1,
        "subjectCode": "PRF192", 
        "subjectName": "Programming Fundamentals"
      }
    ]
  }
}
```

### Chi Tiết Kỹ Thuật

- **Content Scripts**: `fap-scraper.ts` và `fap-curriculum-scraper.ts`
- **Background Script**: `background.ts` xử lý điều hướng và phối hợp dữ liệu
- **Giao Diện Popup**: `popup.html` và `popup.ts` cung cấp giao diện người dùng
- **Hệ Thống Build**: Vite với biên dịch TypeScript

### Lưu Ý
- Đảm bảo bạn đã đăng nhập vào FAP trước khi sử dụng
- Extension cần quyền truy cập vào https://fap.fpt.edu.vn
- Dữ liệu được lưu tạm thời trong extension storage và sẽ bị ghi đè ở lần cào tiếp theo 