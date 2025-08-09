# FAP Extension - HTML Scraping Feature Guide

## English Version

### Overview
The FAP Extension has been enhanced with comprehensive HTML scraping functionality that allows users to extract and download HTML content from various FAP pages as text files. This feature is particularly useful for data analysis, debugging, or archiving purposes.

### New Features Added

#### 1. Universal HTML Scraper (`html-scraper.ts`)
- **Purpose**: Extracts complete HTML content from any FAP page
- **Output**: Text files with structured metadata and full HTML content
- **Supported Pages**:
  - Weekly Schedule (`ScheduleOfWeek.aspx`)
  - Exam Schedule (`ScheduleExams.asp`)
  - Student Grades (`StudentGrade.aspx`)
  - Attendance Report (`ViewAttendstudent.aspx`)

#### 2. Enhanced Popup Interface
- **New Section**: "Cào HTML Các Trang" (HTML Page Scraping)
- **Buttons**:
  - **Lịch Tuần** (Weekly Schedule): Scrapes `ScheduleOfWeek.aspx`
  - **Lịch Thi** (Exam Schedule): Scrapes `ScheduleExams.aspx`
  - **Điểm** (Grades): Scrapes `StudentGrade.aspx`
  - **Điểm Danh** (Attendance): Scrapes `ViewAttendstudent.aspx`
  - **Cào Trang Hiện Tại** (Scrape Current Page): Scrapes the currently active FAP tab

#### 3. Smart File Naming
The extension automatically generates descriptive filenames based on page content:
- **Weekly Schedule**: `fap-schedule-{year}-{week}-{timestamp}.txt`
- **Exam Schedule**: `fap-exam-schedule-{timestamp}.txt`
- **Student Grades**: `fap-grades-{rollNumber}-{term}-{course}-{timestamp}.txt`
- **Attendance**: `fap-attendance-{studentId}-term{term}-course{course}-{timestamp}.txt`

### How to Use

#### Method 1: Automatic Page Opening
1. Open the FAP Extension popup
2. Click any of the HTML scraping buttons (Lịch Tuần, Lịch Thi, etc.)
3. The extension will:
   - Open the target page in a new tab
   - Wait for the page to load completely
   - Extract all HTML content with metadata
   - Automatically download the text file
   - Close the tab after extraction

#### Method 2: Current Page Scraping
1. Navigate to any FAP page you want to scrape
2. Open the FAP Extension popup
3. Click "Cào Trang Hiện Tại" (Scrape Current Page)
4. The extension will extract HTML from the current tab and download it

### File Structure
Each downloaded text file contains:

```
=== FAP HTML SCRAPING RESULT ===
URL: [Page URL]
Page Title: [Page Title]
Page Type: [Page Type]
Timestamp: [ISO Timestamp]
File Name: [Generated Filename]

=== METADATA ===
{
  "selectedYear": "2024",
  "selectedWeek": "Week 1",
  "dayNames": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "dayDates": ["01/01", "02/01", "03/01", "04/01", "05/01", "06/01", "07/01"]
}

=== HTML CONTENT ===
[Complete HTML content of the page]
```

### Technical Implementation
- **Content Script**: `html-scraper.ts` handles page analysis and HTML extraction
- **Background Script**: Enhanced to manage HTML scraping operations and file downloads
- **Popup**: Updated with new buttons and status management
- **File Downloads**: Uses Chrome Downloads API for automatic file saving

---

## Phiên Bản Tiếng Việt

### Tổng Quan
Extension FAP đã được nâng cấp với tính năng cào HTML toàn diện, cho phép người dùng trích xuất và tải về nội dung HTML từ các trang FAP khác nhau dưới dạng file text. Tính năng này đặc biệt hữu ích cho việc phân tích dữ liệu, debug, hoặc lưu trữ.

### Tính Năng Mới Được Thêm

#### 1. Bộ Cào HTML Đa Năng (`html-scraper.ts`)
- **Mục đích**: Trích xuất toàn bộ nội dung HTML từ bất kỳ trang FAP nào
- **Đầu ra**: File text có cấu trúc metadata và nội dung HTML đầy đủ
- **Trang được hỗ trợ**:
  - Lịch học hàng tuần (`ScheduleOfWeek.aspx`)
  - Lịch thi (`ScheduleExams.asp`)
  - Điểm sinh viên (`StudentGrade.aspx`)
  - Báo cáo điểm danh (`ViewAttendstudent.aspx`)

#### 2. Giao Diện Popup Được Cải Tiến
- **Phần mới**: "Cào HTML Các Trang"
- **Các nút**:
  - **Lịch Tuần**: Cào `ScheduleOfWeek.aspx`
  - **Lịch Thi**: Cào `ScheduleExams.aspx`
  - **Điểm**: Cào `StudentGrade.aspx`
  - **Điểm Danh**: Cào `ViewAttendstudent.aspx`
  - **Cào Trang Hiện Tại**: Cào tab FAP đang hoạt động

#### 3. Đặt Tên File Thông Minh
Extension tự động tạo tên file mô tả dựa trên nội dung trang:
- **Lịch Tuần**: `fap-schedule-{năm}-{tuần}-{timestamp}.txt`
- **Lịch Thi**: `fap-exam-schedule-{timestamp}.txt`
- **Điểm Sinh Viên**: `fap-grades-{mã SV}-{kỳ học}-{mã môn}-{timestamp}.txt`
- **Điểm Danh**: `fap-attendance-{mã SV}-term{kỳ học}-course{mã môn}-{timestamp}.txt`

### Cách Sử Dụng

#### Phương Pháp 1: Tự Động Mở Trang
1. Mở popup Extension FAP
2. Nhấn vào một trong các nút cào HTML (Lịch Tuần, Lịch Thi, v.v.)
3. Extension sẽ:
   - Mở trang đích trong tab mới
   - Chờ trang tải hoàn toàn
   - Trích xuất toàn bộ nội dung HTML kèm metadata
   - Tự động tải về file text
   - Đóng tab sau khi trích xuất xong

#### Phương Pháp 2: Cào Trang Hiện Tại
1. Điều hướng đến bất kỳ trang FAP nào bạn muốn cào
2. Mở popup Extension FAP
3. Nhấn "Cào Trang Hiện Tại"
4. Extension sẽ trích xuất HTML từ tab hiện tại và tải về

### Cấu Trúc File
Mỗi file text được tải về chứa:

```
=== FAP HTML SCRAPING RESULT ===
URL: [URL của trang]
Page Title: [Tiêu đề trang]
Page Type: [Loại trang]
Timestamp: [Timestamp ISO]
File Name: [Tên file được tạo]

=== METADATA ===
{
  "selectedYear": "2024",
  "selectedWeek": "Tuần 1",
  "dayNames": ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "CN"],
  "dayDates": ["01/01", "02/01", "03/01", "04/01", "05/01", "06/01", "07/01"]
}

=== HTML CONTENT ===
[Nội dung HTML đầy đủ của trang]
```

### Triển Khai Kỹ Thuật
- **Content Script**: `html-scraper.ts` xử lý phân tích trang và trích xuất HTML
- **Background Script**: Được cải tiến để quản lý các hoạt động cào HTML và tải file
- **Popup**: Được cập nhật với các nút mới và quản lý trạng thái
- **Tải File**: Sử dụng Chrome Downloads API để tự động lưu file

### Lưu Ý Quan Trọng
- Đảm bảo bạn đã đăng nhập vào FAP trước khi sử dụng
- Extension cần quyền truy cập vào https://fap.fpt.edu.vn
- File được tải về tự động với tên mô tả chi tiết
- Chức năng hoạt động với tất cả các trang FAP chính
- Phù hợp cho mục đích nghiên cứu, phân tích dữ liệu và lưu trữ

### Khắc Phục Sự Cố
1. **Extension không phản hồi**: Đảm bảo bạn đang ở trang FAP hợp lệ
2. **Không tải được file**: Kiểm tra quyền tải file trong trình duyệt
3. **Trang không mở được**: Đảm bảo bạn đã đăng nhập FAP
4. **File trống**: Chờ trang tải hoàn toàn trước khi cào 