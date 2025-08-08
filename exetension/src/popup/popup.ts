// Lấy các element từ HTML
const scrapeBtn = document.getElementById('scrapeBtn') as HTMLButtonElement;
const downloadBtn = document.getElementById('downloadBtn') as HTMLButtonElement;
const statusDiv = document.getElementById('status') as HTMLParagraphElement;

// Gửi yêu cầu cào dữ liệu khi nhấn nút
scrapeBtn.addEventListener('click', () => {
    // Vô hiệu hóa nút để tránh người dùng nhấn nhiều lần
    scrapeBtn.disabled = true;
    statusDiv.textContent = 'Đang bắt đầu...';

    // Gửi một thông điệp tới background script để bắt đầu quá trình cào
    chrome.runtime.sendMessage({ action: 'startScraping' }, (response) => {
        if (chrome.runtime.lastError) {
            // Xử lý trường hợp có lỗi (ví dụ: background script chưa sẵn sàng)
            statusDiv.textContent = `Lỗi: ${chrome.runtime.lastError.message}`;
            scrapeBtn.disabled = false;
        } else if (response && response.status) {
            // Nhận phản hồi từ background script
            statusDiv.textContent = response.status;
        }
    });
});

// Xử lý sự kiện tải file JSON
downloadBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'downloadJson' });
});

// Lắng nghe thông điệp cập nhật trạng thái từ background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateStatus') {
        statusDiv.textContent = message.data;
    } else if (message.action === 'scrapingComplete') {
        statusDiv.textContent = 'Đã cào dữ liệu thành công!';
        downloadBtn.disabled = false; // Kích hoạt nút tải
        scrapeBtn.disabled = false;  // Cho phép cào lại
    }
});