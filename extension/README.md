# FAP Revamp Helper - Browser Extension

## English Version

### Overview
This is a browser extension that scrapes data from the FAP (FPT Academic Portal) system. It extracts exam schedules and curriculum data to help students manage their academic information more effectively.

### Features
- **Profile Scraping**: Extracts student profile information including personal details and academic info
- **Exam Schedule Scraping**: Automatically extracts exam schedule data from FAP
- **Curriculum Scraping**: Extracts complete curriculum information including subjects and terms
- **JSON Export**: Downloads the scraped data as separate JSON files or combined
- **HTML Scraping**: NEW! Extracts complete HTML content from any FAP page and downloads as text files
- **Multi-page Support**: Supports weekly schedule, exam schedule, grades, and attendance pages
- **Smart File Naming**: Automatically generates descriptive filenames based on page content
- **User-friendly Interface**: Enhanced popup interface with both JSON and HTML scraping options

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

#### JSON Data Scraping (Original Feature)
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

#### HTML Scraping (New Feature)
1. **Choose Scraping Method**:
   - **Automatic**: Click any HTML scraping button (Lịch Tuần, Lịch Thi, Điểm, Điểm Danh) to automatically open and scrape specific pages
   - **Manual**: Navigate to any FAP page and click "Cào Trang Hiện Tại" to scrape the current tab
2. **Automatic Download**: The extension will automatically download a text file containing:
   - Page metadata (URL, title, timestamps, etc.)
   - Complete HTML content
   - Smart filename based on page type and content

#### Supported URLs for HTML Scraping
- **Weekly Schedule**: `https://fap.fpt.edu.vn/Report/ScheduleOfWeek.aspx`
- **Exam Schedule**: `https://fap.fpt.edu.vn/Exam/ScheduleExams.aspx` 
- **Student Grades**: `https://fap.fpt.edu.vn/Grade/StudentGrade.aspx` (including specific course grades)
- **Attendance Report**: `https://fap.fpt.edu.vn/Report/ViewAttendstudent.aspx` (for specific terms and courses)

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

- **Content Scripts**: 
  - `fap-scraper.ts`: Extracts exam schedule data
  - `fap-curriculum-scraper.ts`: Extracts curriculum data
  - `fap-profile-scraper.ts`: Extracts student profile data
  - `html-scraper.ts`: NEW! Universal HTML scraper for all FAP pages
- **Background Script**: `background.ts` handles navigation, data coordination, and file downloads
- **Popup Interface**: `popup.html` and `popup.ts` provide enhanced user interface with HTML scraping options
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
- **Cào HTML**: MỚI! Trích xuất toàn bộ nội dung HTML từ bất kỳ trang FAP nào và tải về dưới dạng file text
- **Hỗ Trợ Đa Trang**: Hỗ trợ lịch tuần, lịch thi, điểm số và báo cáo điểm danh
- **Đặt Tên File Thông Minh**: Tự động tạo tên file mô tả dựa trên nội dung trang
- **Giao Diện Thân Thiện**: Popup được cải tiến với các tùy chọn cào JSON và HTML

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

#### Cào Dữ Liệu JSON (Tính Năng Gốc)
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

#### Cào HTML (Tính Năng Mới)
1. **Chọn Phương Thức Cào**:
   - **Tự Động**: Nhấn vào các nút cào HTML (Lịch Tuần, Lịch Thi, Điểm, Điểm Danh) để tự động mở và cào các trang cụ thể
   - **Thủ Công**: Điều hướng đến bất kỳ trang FAP nào và nhấn "Cào Trang Hiện Tại" để cào tab hiện tại
2. **Tải Về Tự Động**: Extension sẽ tự động tải về file text chứa:
   - Metadata của trang (URL, tiêu đề, timestamp, v.v.)
   - Nội dung HTML đầy đủ
   - Tên file thông minh dựa trên loại trang và nội dung

#### Các URL Được Hỗ Trợ Cho Cào HTML
- **Lịch Tuần**: `https://fap.fpt.edu.vn/Report/ScheduleOfWeek.aspx`
- **Lịch Thi**: `https://fap.fpt.edu.vn/Exam/ScheduleExams.aspx`
- **Điểm Sinh Viên**: `https://fap.fpt.edu.vn/Grade/StudentGrade.aspx` (bao gồm điểm từng môn học)
- **Báo Cáo Điểm Danh**: `https://fap.fpt.edu.vn/Report/ViewAttendstudent.aspx` (cho các kỳ và môn học cụ thể)

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

- **Content Scripts**: 
  - `fap-scraper.ts`: Trích xuất dữ liệu lịch thi
  - `fap-curriculum-scraper.ts`: Trích xuất dữ liệu chương trình học
  - `fap-profile-scraper.ts`: Trích xuất dữ liệu thông tin sinh viên
  - `html-scraper.ts`: MỚI! Bộ cào HTML đa năng cho tất cả trang FAP
- **Background Script**: `background.ts` xử lý điều hướng, phối hợp dữ liệu và tải file
- **Giao Diện Popup**: `popup.html` và `popup.ts` cung cấp giao diện người dùng được cải tiến với các tùy chọn cào HTML
- **Hệ Thống Build**: Vite với biên dịch TypeScript

### Lưu Ý
- Đảm bảo bạn đã đăng nhập vào FAP trước khi sử dụng
- Extension cần quyền truy cập vào https://fap.fpt.edu.vn
- Dữ liệu được lưu tạm thời trong extension storage và sẽ bị ghi đè ở lần cào tiếp theo 