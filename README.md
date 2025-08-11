
## **Bechovang FAP Dashboard — Hướng dẫn sử dụng**

Đây là dự án bao gồm một ứng dụng web và một tiện ích mở rộng cho trình duyệt, giúp bạn xem và phân tích dữ liệu học tập từ FAP một cách trực quan và tiện lợi.

### **Mục lục**
1.  [Tổng quan & Cấu trúc Dự án](#1-tổng-quan--cấu-trúc-dự-án)
2.  [Yêu cầu Hệ thống](#2-yêu-cầu-hệ-thống)
3.  [Quy trình Sử dụng Chính (Dành cho người dùng)](#3-quy-trình-sử-dụng-chính-dành-cho-người-dùng)
4.  [Hướng dẫn Cài đặt cho Nhà phát triển (Developer)](#4-hướng-dẫn-cài-đặt-cho-nhà-phát-triển-developer)
5.  [Khắc phục các Sự cố Thường gặp](#5-khắc-phục-các-sự-cố-thường-gặp)

---

### **1. Tổng quan & Cấu trúc Dự án**

Dự án này là một *monorepo* (một kho mã nguồn chứa nhiều dự án con), bao gồm:

*   **`webapp/`**: Ứng dụng web được xây dựng bằng Next.js 15, React 19 và Tailwind 4. Đây là nơi bạn sẽ xem các biểu đồ và bảng biểu dữ liệu của mình.
*   **`exetension/`**: Tiện ích mở rộng (extension) cho trình duyệt Chrome/Edge, được xây dựng bằng Vite và TypeScript. Công cụ này có nhiệm vụ "cào" (lấy) dữ liệu từ trang FAP.
*   **`docs/`**: Chứa các tài liệu về kế hoạch và thiết kế của dự án.

Mô hình hoạt động rất đơn giản: **Dùng Extension để lấy dữ liệu từ FAP → Tải dữ liệu lên Web App để xem.**

### **2. Yêu cầu Hệ thống**

Để có thể chạy dự án trên máy tính của bạn (dành cho developer), bạn cần có:

*   **Node.js**: Phiên bản 20 LTS (khuyến nghị) hoặc tối thiểu là 18.18.
*   **npm**: Phiên bản 9 trở lên (hoặc các trình quản lý gói khác như `yarn`, `pnpm`).
*   **Trình duyệt**: Google Chrome hoặc Microsoft Edge để cài đặt và sử dụng extension.

### **3. Quy trình Sử dụng Chính (Dành cho người dùng)**

Nếu bạn chỉ muốn sử dụng, hãy làm theo các bước sau. Bạn không cần cài đặt phức tạp, chỉ cần cài extension và dùng web app có sẵn.

#### **Bước 1: Cài đặt Tiện ích mở rộng (Extension)**

Bạn cần phải tự build và cài đặt extension vào trình duyệt.

1.  **Tải mã nguồn:** Tải về toàn bộ dự án này (dưới dạng file ZIP) và giải nén ra một thư mục bất kỳ.
2.  **Build Extension:**
    *   Mở **PowerShell** (hoặc Terminal) trên máy tính của bạn.
    *   Di chuyển vào thư mục `exetension` bằng lệnh:
        ```powershell
        cd "đường/dẫn/đến/Bechovang-FAP-DashBoard/exetension"
        ```
    *   Chạy các lệnh sau để build extension:
        ```powershell
        npm install
        npm run build
        ```
    *   Sau khi chạy xong, một thư mục mới tên là `dist` sẽ được tạo ra bên trong thư mục `exetension`. Đây chính là extension đã sẵn sàng để cài đặt.

3.  **Cài Extension vào Trình duyệt:**
    *   Mở trình duyệt Chrome hoặc Edge.
    *   Đi đến trang quản lý tiện ích bằng cách gõ `chrome://extensions` vào thanh địa chỉ và nhấn Enter.
    *   Ở góc trên bên phải, gạt nút **"Chế độ dành cho nhà phát triển" (Developer mode)** sang **Bật**.
    *   Một loạt nút mới sẽ hiện ra. Nhấn vào nút **"Tải tiện ích đã giải nén" (Load unpacked)**.
    *   Một cửa sổ chọn thư mục sẽ hiện lên. Bạn hãy tìm và chọn đúng thư mục `exetension/dist` vừa được tạo ở trên.
    *   Nếu thành công, bạn sẽ thấy icon của extension xuất hiện trên thanh công cụ của trình duyệt.

#### **Bước 2: Lấy dữ liệu từ FAP**

1.  Đăng nhập vào trang FPT Academic Portal (`https://fap.fpt.edu.vn`) như bình thường.
2.  Sau khi đăng nhập thành công, nhấn vào biểu tượng của extension trên thanh công cụ để mở popup.
3.  Trong popup, bạn sẽ thấy các nút để cào từng loại dữ liệu:
    *   Cào thông tin cá nhân (Profile)
    *   Cào lịch thi (Exams)
    *   Cào chương trình học (Curriculum)
    *   Cào lịch học tuần (Schedule)
    *   Cào điểm (Grades)
    *   Cào điểm danh (Attendance)
4.  Nhấn vào các nút tương ứng. Extension sẽ tự động làm việc và trình duyệt sẽ tải về các file dữ liệu có đuôi `.json` (ví dụ: `schedule.json`, `grades.json`...). Hãy lưu các file này vào một thư mục dễ nhớ.

#### **Bước 3: Xem dữ liệu trên Web App**

1.  Mở trình duyệt và truy cập vào địa chỉ: **[https://v0-web-app-logic.vercel.app/](https://v0-web-app-logic.vercel.app/)**
2.  Điều hướng đến trang `/upload`.
3.  Kéo và thả các file `.json` bạn vừa tải về ở Bước 2 vào khu vực tải lên.
4.  Sau khi tải lên thành công, bạn có thể bắt đầu khám phá dữ liệu của mình qua các trang như "Điểm số" (`/grades`), "Lịch học" (`/schedule`), "Phân tích" (`/analytics`),...

---

### **4. Hướng dẫn Cài đặt cho Nhà phát triển (Developer)**

Nếu bạn muốn tùy chỉnh hoặc phát triển thêm tính năng, hãy làm theo các bước sau để chạy dự án trên máyローカルcủa bạn.

#### **Chạy Ứng dụng Web (Web App):**

1.  Mở PowerShell/Terminal.
2.  Di chuyển vào thư mục `webapp`:
    ```powershell
    cd "đường/dẫn/đến/Bechovang-FAP-DashBoard/webapp"
    ```
3.  Cài đặt các gói phụ thuộc:
    ```powershell
    npm install
    ```
4.  Khởi động server phát triển:
    ```powershell
    npm run dev
    ```
5.  Mở trình duyệt và truy cập `http://localhost:3000` để xem ứng dụng.

#### **Build và Theo dõi thay đổi của Extension:**

1.  Mở một cửa sổ PowerShell/Terminal khác.
2.  Di chuyển vào thư mục `exetension`:
    ```powershell
    cd "đường/dẫn/đến/Bechovang-FAP-DashBoard/exetension"
    ```3.  Cài đặt các gói phụ thuộc (nếu chưa làm):
    ```powershell
    npm install
    ```
4.  Chạy chế độ "watch" để tự động build lại mỗi khi bạn sửa code:
    ```powershell
    npm run dev
    ```
5.  Sau đó, bạn chỉ cần nạp thư mục `exetension/dist` vào trình duyệt như hướng dẫn ở trên. Mỗi khi bạn sửa code, extension sẽ tự động được cập nhật. Bạn chỉ cần nhấn nút "Tải lại" trên trang `chrome://extensions` để áp dụng thay đổi.

---

### **5. Khắc phục các Sự cố Thường gặp**

*   **Không cài được extension?**
    *   Hãy chắc chắn rằng bạn đã chọn đúng thư mục `exetension/dist`, không phải thư mục gốc `exetension`.
    *   Đảm bảo "Chế độ dành cho nhà phát triển" đã được bật.

*   **Lỗi khi build (npm install / npm run build)?**
    *   Kiểm tra lại phiên bản Node.js của bạn, nên dùng bản 20 LTS.
    *   Thử xóa thư mục `node_modules` và file `package-lock.json`, sau đó chạy lại `npm install`.

*   **Web App không hiển thị gì (trang trắng)?**
    *   Nhấn F12 để mở DevTools và kiểm tra tab Console xem có lỗi gì không.
    *   Đảm bảo cấu trúc file JSON bạn tải lên khớp với cấu trúc mà các thành phần của web app mong đợi.
    *   Luôn thử tải dữ liệu qua trang `/upload` trước.

*   **Điểm Bonus không hiển thị?**
    *   Script `grade-json-scraper.ts` trong extension đã được thiết kế để xử lý các hàng điểm "Bonus". Nếu có vấn đề, hãy kiểm tra lại cấu trúc HTML của trang điểm trên FAP xem có gì thay đổi không.
