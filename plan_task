Tuyệt vời! Với vai trò là Quản lý dự án (Project Manager), tôi sẽ chia dự án này thành các giai đoạn (Phases) và các nhiệm vụ (Tasks) cụ thể, kèm theo mức độ ưu tiên và thời gian ước tính. Chúng ta sẽ áp dụng một phương pháp linh hoạt, tập trung vào việc tạo ra sản phẩm hoạt động được ở cuối mỗi giai đoạn.

---

### **Tổng quan dự án: FAP Revamp**

*   **Mục tiêu:** Xây dựng một bộ công cụ gồm (1) một Chrome Extension để cào dữ liệu từ cổng thông tin FPT và (2) một Web App hiện đại để hiển thị dữ liệu đó một cách trực quan, hữu ích.
*   **Phạm vi:**
    *   **Extension:** Chỉ cào dữ liệu khi người dùng đã đăng nhập. Không xử lý đăng nhập tự động.
    *   **Web App:** Nhận dữ liệu đầu vào từ file JSON do extension tạo ra.
*   **Công cụ quản lý:** Bạn có thể dùng Trello, Asana, hoặc đơn giản là một file Markdown để theo dõi các task này.

---

### **Giai đoạn 0: Nền tảng & Thiết lập (Foundation & Setup)**

*Mục tiêu: Chuẩn bị môi trường phát triển và cấu trúc cơ bản cho cả hai phần của dự án.*
* **Thời gian ước tính:** 1 ngày.

| Task ID | Nhiệm vụ | Chi tiết công việc | Ưu tiên | Ước tính |
| :--- | :--- | :--- | :--- | :--- |
| **P0-T1** | **Khởi tạo môi trường phát triển** | - Tạo một repo chính trên GitHub cho toàn bộ dự án. <br> - Bên trong repo, tạo 2 thư mục con: `/extension` và `/webapp`. | **Cao** | 2 giờ |
| **P0-T2** | **Cấu hình Extension** | - Trong thư mục `/extension`, thiết lập một dự án TypeScript. <br> - Cài đặt và cấu hình Webpack/Vite để biên dịch TS và đóng gói. <br> - Tạo file `manifest.json` (V3) cơ bản với tên, mô tả, và các quyền cần thiết (`storage`, `tabs`, `scripting`). | **Cao** | 3 giờ |
| **P0-T3** | **Cấu hình Web App** | - Trong thư mục `/webapp`, khởi tạo dự án với v0.dev. <br> - Thiết lập các thư viện component được đề xuất (ví dụ: tích hợp Shadcn/UI) và cấu hình TailwindCSS. | **Cao** | 2 giờ |

**Cột mốc Giai đoạn 0:** Môi trường phát triển sẵn sàng, extension có thể được cài đặt vào Chrome (chưa có chức năng), web app có thể chạy được ở local.

---

### **Giai đoạn 1: Extension - Cào dữ liệu cơ bản (Proof of Concept)**

*Mục tiêu: Chứng minh ý tưởng bằng cách cào thành công dữ liệu từ MỘT trang tĩnh và xuất ra file JSON.*
* **Thời gian ước tính:** 2-3 ngày.

| Task ID | Nhiệm vụ | Chi tiết công việc | Ưu tiên | Ước tính |
| :--- | :--- | :--- | :--- | :--- |
| **P1-T1** | **Xây dựng Popup UI cơ bản** | - Tạo file `popup.html` và `popup.ts`. <br> - Thiết kế giao diện đơn giản với 1 nút "Bắt đầu cào dữ liệu" và khu vực hiển thị trạng thái. | **Cao** | 3 giờ |
| **P1-T2** | **Cào Lịch thi (ScheduleExams)** | - Viết content script để phân tích bảng HTML của trang Lịch thi. <br> - Lấy ra các thông tin: Mã môn, Tên môn, Ngày thi, Phòng thi, Hình thức... <br> - Gửi dữ liệu đã cào về background script. | **Cao** | 1 ngày |
| **P1-T3** | **Xây dựng luồng cào cơ bản** | - Viết logic trong `background.ts` để: <br> 1. Nhận lệnh từ popup. <br> 2. Mở tab trang Lịch thi. <br> 3. Tiêm content script (P1-T2) vào. <br> 4. Nhận dữ liệu trả về và log ra console. | **Cao** | 6 giờ |
| **P1-T4** | **Xuất file JSON** | - Bổ sung chức năng cho nút "Tải dữ liệu" trên popup. <br> - Khi nhấn, yêu cầu background script trả về dữ liệu đã cào và kích hoạt trình duyệt tải file xuống. | **Trung bình** | 4 giờ |

**Cột mốc Giai đoạn 1:** Người dùng có thể nhấn nút trên extension, extension tự động cào trang lịch thi và người dùng có thể tải về một file JSON chứa thông tin lịch thi.

---

### **Giai đoạn 2: Extension - Cào dữ liệu toàn diện**

*Mục tiêu: Hoàn thiện khả năng cào dữ liệu cho tất cả các trang còn lại và tổng hợp thành một file JSON có cấu trúc hoàn chỉnh.*
* **Thời gian ước tính:** 4-6 ngày.

| Task ID | Nhiệm vụ | Chi tiết công việc | Ưu tiên | Ước tính |
| :--- | :--- | :--- | :--- | :--- |
| **P2-T1** | **Định nghĩa cấu trúc JSON cuối cùng** | - Thiết kế cấu trúc lồng nhau cho file JSON (như đã đề xuất) để chứa thông tin người dùng, các kỳ học, các môn học, điểm, điểm danh... | **Cao** | 3 giờ |
| **P2-T2** | **Cào Lịch học & Khung chương trình** | - Viết thêm các content script cho trang Lịch học tuần (`ScheduleOfWeek`) và Khung chương trình (`StudentCurriculum`). Đây là các trang tĩnh, tương tự P1-T2. | **Cao** | 1 ngày |
| **P2-T3** | **Cào Điểm & Điểm danh (Phức tạp)** | - Xây dựng luồng cào nhiều bước: <br> 1. Lấy danh sách các kỳ học. <br> 2. Với mỗi kỳ, lấy danh sách các môn học. <br> 3. Với mỗi môn, mô phỏng click để tải chi tiết và chờ AJAX hoàn tất. <br> 4. Bóc tách bảng dữ liệu chi tiết. | **Cao** | 2-3 ngày |
| **P2-T4** | **Hoàn thiện Background Script** | - Nâng cấp `background.ts` để quản lý một "hàng đợi" cào dữ liệu phức tạp. <br> - Tuần tự xử lý các URL và các bước trong P2-T3. <br> - Tổng hợp tất cả dữ liệu nhận được vào cấu trúc JSON đã định nghĩa ở P2-T1. | **Cao** | 1-2 ngày |
| **P2-T5** | **Cải thiện Popup UI** | - Cập nhật popup để hiển thị tiến trình chi tiết hơn (ví dụ: "Đang cào điểm kỳ Summer2025..."). | **Trung bình** | 4 giờ |

**Cột mốc Giai đoạn 2:** Extension có khả năng cào toàn bộ thông tin học tập của sinh viên và xuất ra một file JSON duy nhất, có cấu trúc tốt.

---

### **Giai đoạn 3: Web App - Hiển thị dữ liệu**

*Mục tiêu: Xây dựng giao diện web có thể đọc file JSON và hiển thị các thông tin chính một cách tĩnh.*
* **Thời gian ước tính:** 3-4 ngày.

| Task ID | Nhiệm vụ | Chi tiết công việc | Ưu tiên | Ước tính |
| :--- | :--- | :--- | :--- | :--- |
| **P3-T1** | **Xây dựng trang Tải file (Landing Page)** | - Dùng v0.dev để tạo trang chào mừng. <br> - Thêm chức năng cho phép người dùng chọn và tải lên file JSON. <br> - Đọc nội dung file và lưu vào `localStorage` của trình duyệt. | **Cao** | 1 ngày |
| **P3-T2** | **Thiết kế Bố cục chính** | - Xây dựng layout chung cho ứng dụng: Thanh điều hướng (Navigation Bar/Sidebar), khu vực nội dung chính, footer. <br> - Thiết lập routing cho các trang: Dashboard, Lịch học, Điểm số, Thống kê. | **Cao** | 1 ngày |
| **P3-T3** | **Xây dựng Dashboard** | - Tạo trang Dashboard tĩnh. <br> - Đọc dữ liệu từ `localStorage` và hiển thị các thông tin cơ bản: Tên sinh viên, Lịch học hôm nay, các lịch thi sắp tới. | **Cao** | 6 giờ |
| **P3-T4** | **Xây dựng trang Điểm số (tĩnh)** | - Tạo trang Điểm số. <br> - Hiển thị danh sách các kỳ học và các môn học trong mỗi kỳ dưới dạng các thẻ (card), chỉ hiển thị điểm tổng kết. | **Trung bình** | 6 giờ |

**Cột mốc Giai đoạn 3:** Web app có thể đọc file JSON, lưu trữ và hiển thị các thông tin quan trọng nhất trên Dashboard và trang Điểm số.

---

### **Giai đoạn 4: Web App - Tính năng tương tác & Hoàn thiện**

*Mục tiêu: Biến web app từ tĩnh thành động, thêm các tính năng giá trị gia tăng và hoàn thiện UI/UX.*
* **Thời gian ước tính:** 4-5 ngày.

| Task ID | Nhiệm vụ | Chi tiết công việc | Ưu tiên | Ước tính |
| :--- | :--- | :--- | :--- | :--- |
| **P4-T1** | **Công cụ "Ước tính điểm"** | - Trên trang Điểm số, thêm chức năng cho phép người dùng nhập điểm dự kiến và tính toán điểm cuối kỳ cần thiết. Đây là tính năng chủ lực. | **Rất cao** | 1.5 ngày |
| **P4-T2** | **Trang Lịch học tương tác** | - Tích hợp một thư viện lịch (ví dụ: `FullCalendar.js`). <br> - Đổ dữ liệu lịch học/lịch thi từ JSON vào lịch. <br> - Cho phép xem theo tuần/tháng. | **Cao** | 1 ngày |
| **P4-T3** | **Trang Thống kê (Analytics)** | - Tích hợp thư viện biểu đồ (`Chart.js` hoặc `Recharts`). <br> - Vẽ biểu đồ GPA qua các kỳ, biểu đồ phân bổ điểm, thanh tiến trình điểm danh và tín chỉ. | **Cao** | 1.5 ngày |
| **P4-T4** | **Hoàn thiện UI/UX** | - Rà soát lại toàn bộ giao diện, đảm bảo tính nhất quán, dễ sử dụng. <br> - Thêm các hiệu ứng chuyển động (animations) nhỏ để tăng trải nghiệm. <br> - Triển khai Dark Mode. | **Trung bình** | 1 ngày |

**Cột mốc Giai đoạn 4:** Web app hoàn chỉnh với đầy đủ các tính năng tương tác, giao diện đẹp và mượt mà.

---

### **Giai đoạn 5: Kiểm thử & Triển khai**

*Mục tiêu: Đảm bảo sản phẩm hoạt động ổn định và đưa đến tay người dùng.*
* **Thời gian ước tính:** 2-3 ngày.

| Task ID | Nhiệm vụ | Chi tiết công việc | Ưu tiên | Ước tính |
| :--- | :--- | :--- | :--- | :--- |
| **P5-T1** | **Kiểm thử toàn diện (End-to-End)** | - Nhờ bạn bè (sinh viên FPT khác) sử dụng extension để cào dữ liệu của họ. <br> - Kiểm tra xem cấu trúc HTML có khác nhau giữa các ngành/khóa không. <br> - Dùng các file JSON khác nhau để kiểm thử web app. | **Cao** | 1-2 ngày |
| **P5-T2** | **Tối ưu hóa và sửa lỗi** | - Dựa trên kết quả kiểm thử, sửa các lỗi phát sinh (ví dụ: cào sai dữ liệu, hiển thị sai trên web). | **Cao** | 1 ngày |
| **P5-T3** | **Viết tài liệu & Triển khai** | - Viết file `README.md` trên GitHub, hướng dẫn cách cài đặt và sử dụng. <br> - (Tùy chọn) Triển khai web app lên Vercel/Netlify. <br> - (Tùy chọn) Đóng gói extension và chuẩn bị để đăng lên Chrome Web Store. | **Trung bình** | 4 giờ |

---

### **Quản lý rủi ro**

*   **Rủi ro lớn nhất:** **Trường Đại học FPT thay đổi cấu trúc HTML của trang FAP.**
*   **Giải pháp:** Các content script phải được viết theo module, dễ dàng cập nhật. Nếu có thay đổi, bạn chỉ cần sửa lại các selector (`document.querySelector`) trong file content script tương ứng mà không ảnh hưởng đến logic chung.

Bây giờ bạn đã có một lộ trình rõ ràng. Hãy bắt đầu với **Giai đoạn 0** và hoàn thành từng task một. Chúc bạn thành công