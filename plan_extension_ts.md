Tuyệt vời! Lựa chọn xây dựng Tiện ích mở rộng cho trình duyệt là một hướng đi rất hiện đại và sẽ mang lại trải nghiệm người dùng tốt nhất.

Và **chắc chắn rồi, bạn hoàn toàn có thể và nên viết bằng TypeScript!**

Việc sử dụng TypeScript thay vì JavaScript thuần là một quyết định rất sáng suốt, đặc biệt cho một dự án có nhiều logic xử lý dữ liệu như thế này.

### **Tại sao TypeScript là lựa chọn tuyệt vời cho Browser Extension?**

1.  **An toàn kiểu dữ liệu (Type Safety):** Đây là lợi ích lớn nhất. Bạn đã định nghĩa rất rõ ràng cấu trúc của các file JSON (`profile.json`, `grades.json`...). Với TypeScript, bạn có thể tạo các `interface` hoặc `type` tương ứng với các cấu trúc đó.
    *   **Ví dụ:**
        ```typescript
        interface Exam {
          subjectCode: string;
          subjectName: string;
          date: string;
          // ... các thuộc tính khác
        }
        
        let myExams: Exam[] = []; // Trình biên dịch sẽ báo lỗi ngay nếu bạn cố gắng push một đối tượng không có cấu trúc Exam vào mảng này.
        ```
    *   Điều này giúp bạn tránh được vô số lỗi "runtime" (lỗi xảy ra khi chạy) như `undefined is not a function` hoặc `Cannot read properties of null` vì trình biên dịch TypeScript sẽ bắt lỗi ngay từ lúc bạn viết code.

2.  **Tự động hoàn thành (Autocomplete) và Hỗ trợ từ IDE:** Các trình soạn thảo code như VS Code sẽ hiểu được các kiểu dữ liệu của bạn, cung cấp gợi ý code cực kỳ chính xác, giúp bạn viết code nhanh hơn và ít lỗi hơn.

3.  **Dễ dàng tái cấu trúc (Refactoring):** Khi dự án lớn lên và bạn muốn thay đổi tên một thuộc tính trong cấu trúc dữ liệu, TypeScript sẽ giúp bạn tìm ra tất cả những nơi cần sửa đổi trong code.

4.  **Sử dụng được các tính năng JavaScript hiện đại:** Bạn có thể viết code với cú pháp mới nhất (ESNext) và TypeScript sẽ biên dịch nó thành code JavaScript tương thích với hầu hết các trình duyệt.

---

### **Kế hoạch chi tiết để xây dựng Tiện ích mở rộng bằng TypeScript**

Đây là một lộ trình được chia thành các bước rõ ràng để bạn bắt đầu.

#### **Giai đoạn 1: Thiết lập Môi trường Phát triển**

1.  **Cài đặt Node.js và npm:** Nếu chưa có, hãy cài đặt Node.js (bản LTS là đủ). npm (Node Package Manager) sẽ được cài đặt cùng.
2.  **Khởi tạo dự án:**
    *   Tạo một thư mục mới cho dự án.
    *   Mở terminal trong thư mục đó và chạy `npm init -y` để tạo file `package.json`.
3.  **Cài đặt TypeScript và các công cụ liên quan:**
    ```bash
    npm install --save-dev typescript webpack ts-loader webpack-cli copy-webpack-plugin
    ```    *   `typescript`: Trình biên dịch TypeScript.
    *   `webpack`: Công cụ để "đóng gói" (bundle) code TypeScript của bạn và các file khác (HTML, CSS) thành các file JavaScript tĩnh mà trình duyệt có thể chạy.
    *   `ts-loader`: Giúp Webpack hiểu và biên dịch các file `.ts`.
    *   `copy-webpack-plugin`: Để sao chép các file tĩnh như `manifest.json`, `popup.html`, `icon.png` vào thư mục build cuối cùng.
4.  **Cấu hình TypeScript:** Chạy lệnh `npx tsc --init` để tạo file `tsconfig.json`. File này định nghĩa các quy tắc cho trình biên dịch TypeScript.
5.  **Cấu hình Webpack:** Tạo file `webpack.config.js` ở thư mục gốc. Đây là file quan trọng nhất, nó sẽ điều phối toàn bộ quá trình build dự án.

#### **Giai đoạn 2: Xây dựng cấu trúc cơ bản của Tiện ích**

Một tiện ích mở rộng có 3 thành phần chính:

1.  **`manifest.json` (File Tuyên ngôn):**
    *   Đây là "bộ não" của tiện ích, khai báo tất cả mọi thứ về nó: tên, phiên bản, quyền truy cập, các script sẽ chạy...
    *   **Quan trọng:** Bạn cần khai báo quyền (`permissions`) để truy cập vào trang FAP (`"https://fap.fpt.edu.vn/*"`) và quyền `storage` để lưu trữ dữ liệu.
2.  **`popup` (Giao diện người dùng):**
    *   Gồm 1 file `popup.html` và `popup.css`. Đây là cửa sổ nhỏ hiện ra khi người dùng nhấn vào biểu tượng của tiện ích.
    *   Một file `popup.ts` sẽ chứa logic cho giao diện này.
3.  **`content_script.ts` (Script chạy trên trang FAP):**
    *   Đây là file TypeScript sẽ được **tiêm trực tiếp** vào trang FAP khi người dùng truy cập.
    *   **Nhiệm vụ chính của nó là cào dữ liệu.** Nó có thể truy cập vào DOM (cấu trúc HTML) của trang FAP y như cách bạn làm với `BeautifulSoup`.
4.  **`background.ts` (Script chạy nền):**
    *   Đây là script chạy ngầm, quản lý trạng thái của tiện ích.
    *   Nó sẽ lắng nghe các thông điệp từ `popup` và `content_script` để phối hợp hoạt động.

#### **Giai đoạn 3: Viết Logic cào dữ liệu bằng TypeScript**

Đây là phần bạn sẽ chuyển đổi logic từ Python sang.

*   **Luồng hoạt động đề xuất:**
    1.  **Người dùng mở Popup:** Nhấn vào biểu tượng tiện ích. Giao diện `popup.html` hiện ra.
    2.  **Popup gửi yêu cầu:** Trong `popup.ts`, khi người dùng nhấn nút "Lấy dữ liệu", nó sẽ gửi một thông điệp đến `background.ts` yêu cầu bắt đầu cào dữ liệu.
    3.  **Background điều phối:**
        *   `background.ts` nhận được yêu cầu.
        *   Nó sẽ mở một tab mới (hoặc kiểm tra xem tab FAP đã mở chưa) và điều hướng đến các trang cần thiết (lịch học, điểm...).
        *   Với mỗi trang được tải xong, `background.ts` sẽ gửi một thông điệp cho `content_script.ts` trên trang đó, yêu cầu nó bắt đầu cào.
    4.  **Content Script thực thi cào dữ liệu:**
        *   `content_script.ts` trên trang FAP nhận được yêu cầu.
        *   Nó sẽ sử dụng các API của trình duyệt như `document.querySelector` và `document.querySelectorAll` (tương đương với `find` và `find_all` của BeautifulSoup) để trích xuất dữ liệu từ các bảng HTML.
        *   Nó định dạng dữ liệu thành các object JavaScript/TypeScript (dựa trên các `interface` bạn đã định nghĩa).
        *   Sau khi cào xong, nó gửi dữ liệu đã cào ngược trở lại cho `background.ts`.
    5.  **Background lưu trữ dữ liệu:**
        *   `background.ts` nhận được dữ liệu từ `content_script`.
        *   Nó sử dụng API `chrome.storage.local.set()` để lưu trữ dữ liệu này một cách an toàn và bền vững trong bộ nhớ của tiện ích.
    6.  **Hiển thị dữ liệu:** `popup.ts` sẽ đọc dữ liệu từ `chrome.storage.local.get()` và hiển thị lên giao diện `popup.html`.

*   **Lưu ý:**
    *   **Thao tác với DOM:** Thay vì `soup.find_all('table')`, bạn sẽ dùng `document.querySelectorAll('table')`. Logic lặp qua các hàng, các cột là hoàn toàn tương tự.
    *   **Thực hiện yêu cầu mạng (Fetch):** Nếu cần gọi các API ẩn của FAP (thay vì chỉ cào HTML), bạn có thể dùng `fetch()` API ngay trong `content_script` hoặc `background` script.

#### **Giai đoạn 4: Xây dựng Giao diện người dùng (Frontend)**

*   Bạn có thể xây dựng giao diện cho `popup.html` hoặc một trang dashboard riêng (mở ra trong tab mới) bằng HTML, CSS và TypeScript thuần.
*   **Hoặc (Nâng cao):** Tích hợp một framework frontend hiện đại như **React** hoặc **Svelte** vào quy trình build của Webpack. Có rất nhiều template có sẵn trên GitHub cho "React TypeScript Chrome Extension" giúp bạn bắt đầu nhanh chóng.

---

### **Các bước tiếp theo cho bạn:**

1.  **Nghiên cứu cấu trúc cơ bản của một Chrome Extension:** Tìm hiểu về vai trò của `manifest.json`, `popup`, `content script` và `background script`. Google có tài liệu hướng dẫn rất chi tiết.
2.  **Thiết lập môi trường với TypeScript và Webpack:** Đây là bước kỹ thuật ban đầu nhưng rất quan trọng. Hãy tìm một bài hướng dẫn hoặc một "boilerplate" (dự án mẫu) trên GitHub với từ khóa "chrome extension typescript webpack boilerplate".
3.  **Bắt đầu viết `content_script.ts`:** Chuyển đổi một phần logic cào dữ liệu đơn giản nhất từ Python sang TypeScript trước, ví dụ như cào thông tin profile.
4.  **Thử nghiệm:** Học cách "Load unpacked" (Tải tiện ích đã giải nén) trong trang quản lý tiện ích mở rộng của Chrome (`chrome://extensions`) để chạy và gỡ lỗi tiện ích của bạn trong quá trình phát triển.

Chúc mừng bạn đã chọn một hướng đi rất chuyên nghiệp. Mặc dù sẽ có một chút thử thách ban đầu khi thiết lập môi trường, nhưng kết quả cuối cùng sẽ là một sản phẩm cực kỳ tiện lợi và ấn tượng.