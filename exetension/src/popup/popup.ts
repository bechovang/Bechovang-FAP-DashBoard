// Lấy các element từ HTML
const scrapeBtn = document.getElementById('scrapeBtn') as HTMLButtonElement;
const downloadAllBtn = document.getElementById('downloadAllBtn') as HTMLButtonElement;
const downloadProfileBtn = document.getElementById('downloadProfileBtn') as HTMLButtonElement;
const downloadExamBtn = document.getElementById('downloadExamBtn') as HTMLButtonElement;
const downloadCurriculumBtn = document.getElementById('downloadCurriculumBtn') as HTMLButtonElement;

// HTML scraping buttons
const scrapeWeeklyScheduleBtn = document.getElementById('scrapeWeeklyScheduleBtn') as HTMLButtonElement;
const scrapeExamScheduleBtn = document.getElementById('scrapeExamScheduleBtn') as HTMLButtonElement;
const scrapeGradesBtn = document.getElementById('scrapeGradesBtn') as HTMLButtonElement;
const scrapeAttendanceBtn = document.getElementById('scrapeAttendanceBtn') as HTMLButtonElement;
const scrapeCurrentPageBtn = document.getElementById('scrapeCurrentPageBtn') as HTMLButtonElement;

// JSON scraping buttons
const scrapeScheduleJSONBtn = document.getElementById('scrapeScheduleJSONBtn') as HTMLButtonElement;
const scrapeGradeJSONBtn = document.getElementById('scrapeGradeJSONBtn') as HTMLButtonElement;
const gradeUrlsInput = document.getElementById('gradeUrlsInput') as HTMLTextAreaElement;
const scrapeAttendanceJSONBtn = document.getElementById('scrapeAttendanceJSONBtn') as HTMLButtonElement;
const attendanceUrlsInput = document.getElementById('attendanceUrlsInput') as HTMLTextAreaElement;

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

// Xử lý các sự kiện tải file JSON
downloadAllBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'downloadAll' });
});

downloadProfileBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'downloadProfile' });
});

downloadExamBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'downloadExam' });
});

downloadCurriculumBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'downloadCurriculum' });
});

// HTML scraping event listeners
scrapeWeeklyScheduleBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Đang mở trang lịch tuần...';
    chrome.runtime.sendMessage({ action: 'scrapeHTMLPage', pageType: 'weekly-schedule' });
});

scrapeExamScheduleBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Đang mở trang lịch thi...';
    chrome.runtime.sendMessage({ action: 'scrapeHTMLPage', pageType: 'exam-schedule' });
});

scrapeGradesBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Đang mở trang điểm...';
    chrome.runtime.sendMessage({ action: 'scrapeHTMLPage', pageType: 'student-grades' });
});

scrapeAttendanceBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Đang mở trang điểm danh...';
    chrome.runtime.sendMessage({ action: 'scrapeHTMLPage', pageType: 'attendance-report' });
});

scrapeCurrentPageBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Đang cào trang hiện tại...';
    chrome.runtime.sendMessage({ action: 'scrapeCurrentPage' });
});

// JSON scraping event listeners
scrapeScheduleJSONBtn.addEventListener('click', () => {
    statusDiv.textContent = 'Đang mở trang lịch tuần để cào JSON...';
    chrome.runtime.sendMessage({ action: 'scrapeScheduleJSON' });
});

scrapeGradeJSONBtn.addEventListener('click', () => {
    const urls = gradeUrlsInput.value.trim().split('\n').filter(url => url.trim() !== '');
    if (urls.length === 0) {
        statusDiv.textContent = 'Vui lòng nhập ít nhất một link môn học!';
        return;
    }
    
    statusDiv.textContent = `Đang cào điểm từ ${urls.length} môn học...`;
    chrome.runtime.sendMessage({ 
        action: 'scrapeGradeJSON', 
        urls: urls 
    });
});

scrapeAttendanceJSONBtn.addEventListener('click', () => {
    const urls = attendanceUrlsInput.value.trim().split('\n').filter(url => url.trim() !== '');
    if (urls.length === 0) {
        statusDiv.textContent = 'Vui lòng nhập ít nhất một link điểm danh!';
        return;
    }
    
    statusDiv.textContent = `Đang cào điểm danh từ ${urls.length} môn học...`;
    chrome.runtime.sendMessage({ 
        action: 'scrapeAttendanceJSON', 
        urls: urls 
    });
});

// Lắng nghe thông điệp cập nhật trạng thái từ background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'updateStatus') {
        statusDiv.textContent = message.data;
    } else if (message.action === 'scrapingComplete') {
        statusDiv.textContent = 'Đã cào dữ liệu thành công!';
        // Kích hoạt tất cả nút tải
        downloadAllBtn.disabled = false;
        downloadProfileBtn.disabled = false;
        downloadExamBtn.disabled = false;
        downloadCurriculumBtn.disabled = false;
        scrapeBtn.disabled = false;  // Cho phép cào lại
    } else if (message.action === 'htmlScrapingComplete') {
        statusDiv.textContent = `Đã cào HTML thành công! File: ${message.fileName}`;
    } else if (message.action === 'htmlScrapingError') {
        statusDiv.textContent = `Lỗi cào HTML: ${message.error}`;
    } else if (message.action === 'scheduleJSONScrapingComplete') {
        statusDiv.textContent = `Đã cào JSON lịch học thành công! File: ${message.fileName}`;
    } else if (message.action === 'scheduleJSONScrapingError') {
        statusDiv.textContent = `Lỗi cào JSON lịch học: ${message.error}`;
    } else if (message.action === 'gradeJSONScrapingComplete') {
        statusDiv.textContent = `Đã cào JSON điểm thành công! File tổng hợp đã được tải xuống.`;
    } else if (message.action === 'gradeJSONScrapingError') {
        statusDiv.textContent = `Lỗi cào JSON điểm: ${message.error}`;
    } else if (message.action === 'gradeJSONScrapingProgress') {
        statusDiv.textContent = `Đang cào điểm... (${message.current}/${message.total})`;
    } else if (message.action === 'attendanceJSONScrapingComplete') {
        statusDiv.textContent = `Đã cào JSON điểm danh thành công! File tổng hợp đã được tải xuống.`;
    } else if (message.action === 'attendanceJSONScrapingError') {
        statusDiv.textContent = `Lỗi cào JSON điểm danh: ${message.error}`;
    } else if (message.action === 'attendanceJSONScrapingProgress') {
        statusDiv.textContent = `Đang cào điểm danh... (${message.current}/${message.total})`;
    }
});