Đã hiểu, chúng ta sẽ bỏ qua hoàn toàn phần đăng nhập và tập trung vào việc cào dữ liệu từ một phiên đã đăng nhập sẵn. Điều này giúp đơn giản hóa đáng kể extension và tập trung vào phần cốt lõi là xử lý và hiển thị dữ liệu.

Dưới đây là bản kế hoạch chi tiết đã được cập nhật theo yêu cầu mới của bạn.

---

### **Phần 1: Kế hoạch chi tiết cho Extension cào dữ liệu (Đã cập nhật)**

**Mục tiêu:** Khi người dùng đã đăng nhập vào FAP, họ sẽ nhấn vào extension để bắt đầu quá trình cào dữ liệu từ các trang liên quan. Extension sẽ tự động duyệt qua các trang này, thu thập thông tin và cho phép người dùng tải về một file JSON duy nhất.

#### **1. Phân tích & Kiến trúc Extension (Đơn giản hóa)**

*   **Công nghệ:** TypeScript, Webpack/Vite, Manifest V3 (không thay đổi).
*   **Cấu trúc Extension:**
    *   **`background.ts` (Background Script):** Vẫn là trung tâm điều phối. Nó sẽ nhận lệnh từ popup, quản lý hàng đợi các URL cần cào, và tổng hợp dữ liệu từ các content script.
    *   **`content-script.ts` (Content Scripts):** Nhiệm vụ không đổi, được tiêm vào các trang FAP để đọc HTML và trích xuất dữ liệu.
    *   **`popup.html` / `popup.ts`:** Giao diện chính cho người dùng. Vì không cần đăng nhập, nó sẽ trở nên cực kỳ đơn giản:
        *   Một nút lớn: **"Bắt đầu cào dữ liệu"**.
        *   Khu vực hiển thị trạng thái: "Đang chờ", "Đang lấy lịch học...", "Đang cào điểm môn X...", "Hoàn tất!".
        *   Một nút **"Tải dữ liệu (JSON)"** sẽ bị vô hiệu hóa và chỉ bật lên khi quá trình cào hoàn tất.
    *   **Trang `options`:** **ĐÃ LOẠI BỎ.** Không còn cần thiết vì chúng ta không lưu trữ thông tin đăng nhập nữa.

#### **2. Luồng hoạt động chi tiết (Workflow mới)**

**Bước 1: Người dùng khởi động**

1.  Người dùng tự đăng nhập vào FAP bằng tài khoản FEID của họ như bình thường.
2.  Sau khi đã ở trong trang FAP, người dùng nhấn vào biểu tượng extension trên thanh công cụ.
3.  Popup hiện ra, người dùng nhấn nút **"Bắt đầu cào dữ liệu"**.

**Bước 2: Quá trình cào dữ liệu tự động**

1.  **Gửi yêu cầu:** Popup gửi một thông điệp đến `background.ts` để bắt đầu.
2.  **Tạo hàng đợi URL:** `background.ts` tạo một danh sách các URL cần cào dữ liệu. Danh sách này bao gồm:
    *   `Report/ScheduleOfWeek.aspx` (Lịch học tuần)
    *   `Exam/ScheduleExams.aspx` (Lịch thi)
    *   `Grade/StudentGrade.aspx` (Trang điểm)
    *   `Report/ViewAttendstudent.aspx` (Trang điểm danh)
    *   `FrontOffice/StudentCurriculum.aspx` (Khung chương trình)
    *   `App/AcadAppView.aspx` (Xem đơn từ)
3.  **Điều hướng và cào dữ liệu:**
    *   `background.ts` sẽ mở một tab mới (có thể dùng `Offscreen Documents` trong Manifest V3 để quy trình mượt mà hơn và không làm phiền người dùng) và duyệt qua từng URL một.
    *   **Cào Lịch học & Lịch thi:** Các trang này tương đối tĩnh. Content script sẽ được tiêm vào, phân tích cấu trúc bảng `<table>`, duyệt qua các hàng `<tr>`, cột `<td>` để lấy thông tin.
    *   **Cào Điểm & Điểm danh (Quy trình phức tạp):** Đây là phần thử thách nhất.
        *   Content script vào trang chính của mục điểm/điểm danh.
        *   **Bước A:** Cào danh sách các kỳ học và các liên kết tương ứng.
        *   **Bước B:** `background.ts` sẽ lặp qua từng link của kỳ học. Với mỗi kỳ, content script sẽ cào danh sách các môn học trong kỳ đó.
        *   **Bước C:** `background.ts` tiếp tục lặp qua từng môn học. Content script sẽ mô phỏng việc "click" vào môn học đó để tải chi tiết điểm/điểm danh.
        *   **Bước D:** Content script phải **chờ** cho đến khi bảng dữ liệu chi tiết được AJAX tải xong, sau đó mới tiến hành bóc tách dữ liệu điểm thành phần hoặc lịch sử điểm danh.
    *   **Cào Khung chương trình & Đơn từ:** Tương tự như lịch học, đây là các trang tĩnh, chỉ cần phân tích bảng.
4.  **Tổng hợp dữ liệu:**
    *   Mỗi khi một content script cào xong một phần dữ liệu, nó sẽ gửi dữ liệu đó về `background.ts`.
    *   `background.ts` nhận và xây dựng một đối tượng JSON lớn, có cấu trúc như đã đề xuất ở bản kế hoạch trước.
5.  **Hoàn tất và lưu trữ:**
    *   Sau khi cào xong tất cả các URL, `background.ts` sẽ lưu đối tượng JSON hoàn chỉnh vào `chrome.storage.local`.
    *   Nó gửi một thông báo "Hoàn tất" đến popup.
    *   Popup nhận được tín hiệu, hiển thị "Đã cào dữ liệu thành công!" và kích hoạt nút **"Tải dữ liệu (JSON)"**.

**Bước 3: Người dùng xuất file**

1.  Người dùng nhấn nút "Tải dữ liệu (JSON)".
2.  Popup yêu cầu `background.ts` cung cấp file JSON đã lưu, sau đó kích hoạt API của trình duyệt để tải file đó về máy người dùng.

---

### **Phần 2: Ý tưởng thiết kế Web App hiển thị dữ liệu (UI/UX)**

Phần này gần như không thay đổi, chỉ có một bổ sung quan trọng ở màn hình đầu tiên để người dùng tải file JSON lên.

#### **1. Triết lý thiết kế**

*   **Lấy người dùng làm trung tâm, trực quan hóa dữ liệu, tối giản, mobile-first.** (Giữ nguyên)

#### **2. Cấu trúc và thiết kế chi tiết các trang**

**A. Màn hình Chào mừng & Tải dữ liệu (Trang đầu tiên)**

*   Thay vì dashboard, người dùng sẽ thấy một trang chào mừng, sạch sẽ.
*   **Nội dung chính:**
    *   Một lời chào: "Chào mừng đến với FAP phiên bản nâng cấp!".
    *   Một khu vực lớn, nổi bật để tải file lên: Có thể là một nút "Tải lên file dữ liệu.json" hoặc một vùng "Kéo và thả file của bạn vào đây".
    *   Hướng dẫn ngắn gọn: "1. Đăng nhập vào FAP. 2. Nhấn vào extension để tải file dữ liệu. 3. Tải file đó lên đây để bắt đầu."
*   **Lưu trữ cục bộ:** Sau khi người dùng tải file lên lần đầu, web app của bạn nên phân tích file JSON và lưu toàn bộ dữ liệu vào `localStorage` của trình duyệt. Bằng cách này, những lần sau khi người dùng truy cập lại web app, nó có thể tự động tải dữ liệu từ `localStorage` và đưa thẳng đến Dashboard mà không cần tải lại file (trừ khi họ muốn cập nhật dữ liệu mới).

**B. Trang chủ (Dashboard)** - *Hiển thị sau khi tải file thành công*

*   **Bố cục và các widget:** Giữ nguyên ý tưởng từ bản kế hoạch trước.
    *   **"Lịch học hôm nay"**: Hiển thị nổi bật, trực quan.
    *   **"Sắp diễn ra"**: Các deadline và lịch thi sắp tới.
    *   **"Thông báo mới"**: (Tính năng này có thể hiển thị sự khác biệt giữa file JSON mới và cũ nếu người dùng tải lên file cập nhật).
    *   **"Thống kê nhanh"**: GPA, tín chỉ, số buổi nghỉ.

**C. Trang Lịch học (Schedule)**

*   **Giữ nguyên ý tưởng:** Giao diện lịch hiện đại, xem theo tuần/tháng, các khối sự kiện có thể click để xem chi tiết.

**D. Trang Điểm số (Grades)**

*   **Giữ nguyên ý tưởng:**
    *   Hiển thị theo từng kỳ (dạng accordion).
    *   Mỗi môn là một thẻ (card) với điểm tổng kết và trạng thái.
    *   Click vào thẻ để xem chi tiết điểm thành phần.
    *   **Công cụ "Ước tính điểm cuối kỳ"**: Vẫn là tính năng đắt giá nhất. Cho phép người dùng nhập điểm dự kiến để xem cần bao nhiêu điểm thi để đạt mục tiêu.

**E. Trang Thống kê & Tiến độ (Analytics & Progress)**

*   **Giữ nguyên ý tưởng:**
    *   Biểu đồ đường về GPA qua các kỳ.
    *   Biểu đồ tròn/cột về phân bổ điểm số.
    *   Thanh tiến trình theo dõi số buổi nghỉ cho từng môn.
    *   Thanh tiến trình về tổng số tín chỉ đã tích lũy so với khung chương trình.

#### **3. Đề xuất về v0 dev và Thẩm mỹ (UI)**

*   **Chủ đề, màu sắc, font chữ:** Giữ nguyên các đề xuất về bảng màu hiện đại, font sans-serif dễ đọc (`Inter`, `Manrope`...).
*   **Components:** Tiếp tục khuyến khích sử dụng thư viện component như **Shadcn/UI** để có giao diện chuyên nghiệp, đồng nhất và hỗ trợ Dark Mode.
*   **Biểu đồ:** Sử dụng `Chart.js` hoặc `Recharts` để hiện thực hóa các ý tưởng ở trang Thống kê.

Bằng cách loại bỏ phần đăng nhập, dự án của bạn trở nên khả thi hơn và ít bị ảnh hưởng bởi những thay đổi từ trang FAP. Bạn có thể tập trung hoàn toàn vào việc xây dựng một trải nghiệm người dùng tuyệt vời để hiển thị dữ liệu. Chúc bạn thành công