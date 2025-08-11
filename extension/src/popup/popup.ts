// Lấy các element từ HTML
const scrapeBtn = document.getElementById('scrapeBtn') as HTMLButtonElement;
const downloadAllBtn = document.getElementById('downloadAllBtn') as HTMLButtonElement;
const downloadProfileBtn = document.getElementById('downloadProfileBtn') as HTMLButtonElement;
const downloadExamBtn = document.getElementById('downloadExamBtn') as HTMLButtonElement;
const downloadCurriculumBtn = document.getElementById('downloadCurriculumBtn') as HTMLButtonElement;

// HTML scraping buttons (optional, section may be removed from UI)
const scrapeWeeklyScheduleBtn = document.getElementById('scrapeWeeklyScheduleBtn') as HTMLButtonElement | null;
const scrapeExamScheduleBtn = document.getElementById('scrapeExamScheduleBtn') as HTMLButtonElement | null;
const scrapeGradesBtn = document.getElementById('scrapeGradesBtn') as HTMLButtonElement | null;
const scrapeAttendanceBtn = document.getElementById('scrapeAttendanceBtn') as HTMLButtonElement | null;
const scrapeCurrentPageBtn = document.getElementById('scrapeCurrentPageBtn') as HTMLButtonElement | null;

// JSON scraping buttons
const scrapeScheduleJSONBtn = document.getElementById('scrapeScheduleJSONBtn') as HTMLButtonElement;
const scrapeGradeJSONBtn = document.getElementById('scrapeGradeJSONBtn') as HTMLButtonElement;
const gradeUrlsInput = document.getElementById('gradeUrlsInput') as HTMLTextAreaElement;
const scrapeAttendanceJSONBtn = document.getElementById('scrapeAttendanceJSONBtn') as HTMLButtonElement;
const attendanceUrlsInput = document.getElementById('attendanceUrlsInput') as HTMLTextAreaElement;

const statusDiv = document.getElementById('status') as HTMLParagraphElement;

// Khởi tạo trạng thái khi mở popup: nếu đã có dữ liệu cào, bật nút tải
chrome.storage.local.get('scrapedData', (result) => {
    if (result && result.scrapedData) {
        downloadAllBtn.disabled = false;
        downloadProfileBtn.disabled = false;
        downloadExamBtn.disabled = false;
        downloadCurriculumBtn.disabled = false;
        statusDiv.textContent = 'Dữ liệu đã sẵn sàng để tải.';
    }
});

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

// HTML scraping event listeners (optional)
scrapeWeeklyScheduleBtn?.addEventListener('click', () => {
    statusDiv.textContent = 'Đang mở trang lịch tuần...';
    chrome.runtime.sendMessage({ action: 'scrapeHTMLPage', pageType: 'weekly-schedule' });
});

scrapeExamScheduleBtn?.addEventListener('click', () => {
    statusDiv.textContent = 'Đang mở trang lịch thi...';
    chrome.runtime.sendMessage({ action: 'scrapeHTMLPage', pageType: 'exam-schedule' });
});

scrapeGradesBtn?.addEventListener('click', () => {
    statusDiv.textContent = 'Đang mở trang điểm...';
    chrome.runtime.sendMessage({ action: 'scrapeHTMLPage', pageType: 'student-grades' });
});

scrapeAttendanceBtn?.addEventListener('click', () => {
    statusDiv.textContent = 'Đang mở trang điểm danh...';
    chrome.runtime.sendMessage({ action: 'scrapeHTMLPage', pageType: 'attendance-report' });
});

scrapeCurrentPageBtn?.addEventListener('click', () => {
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

// Settings: load on open
const autoScrapeEnabledInput = document.getElementById('autoScrapeEnabled') as HTMLInputElement | null
const autoUploadEnabledInput = document.getElementById('autoUploadEnabled') as HTMLInputElement | null
const uploadTargetUrlInput = document.getElementById('uploadTargetUrl') as HTMLInputElement | null
const phase1HoursInput = document.getElementById('phase1Hours') as HTMLInputElement | null
const phase2HoursInput = document.getElementById('phase2Hours') as HTMLInputElement | null
const settingsGradeUrls = document.getElementById('settingsGradeUrls') as HTMLTextAreaElement | null
const settingsAttendanceUrls = document.getElementById('settingsAttendanceUrls') as HTMLTextAreaElement | null
const saveSettingsBtn = document.getElementById('saveSettingsBtn') as HTMLButtonElement | null
const saveStatus = document.getElementById('saveStatus') as HTMLDivElement | null

function toMultiline(urls?: string[]): string { return (urls ?? []).join('\n') }
function toArray(text?: string): string[] { return (text ?? '').split('\n').map(s => s.trim()).filter(Boolean) }

if (autoScrapeEnabledInput && autoUploadEnabledInput && uploadTargetUrlInput) {
  chrome.storage.sync.get([
    'autoScrapeEnabled',
    'autoUploadEnabled',
    'uploadTargetUrl',
    'runIntervals',
    'gradeUrls',
    'attendanceUrls',
  ], (res) => {
    autoScrapeEnabledInput.checked = Boolean(res.autoScrapeEnabled)
    autoUploadEnabledInput.checked = Boolean(res.autoUploadEnabled)
    uploadTargetUrlInput.value = res.uploadTargetUrl || 'https://v0-web-app-logic.vercel.app/upload'
    const p1 = res.runIntervals?.phase1Hours ?? 12
    const p23 = res.runIntervals?.phase2Hours ?? 24
    if (phase1HoursInput) phase1HoursInput.value = String(p1)
    if (phase2HoursInput) phase2HoursInput.value = String(p23)
    if (settingsGradeUrls) settingsGradeUrls.value = toMultiline(res.gradeUrls)
    if (settingsAttendanceUrls) settingsAttendanceUrls.value = toMultiline(res.attendanceUrls)
  })
}

saveSettingsBtn?.addEventListener('click', () => {
  const runIntervals = {
    phase1Hours: Number(phase1HoursInput?.value || 12),
    phase2Hours: Number(phase2HoursInput?.value || 24),
    phase3Hours: Number(phase2HoursInput?.value || 24),
  }

  const payload = {
    autoScrapeEnabled: Boolean(autoScrapeEnabledInput?.checked),
    autoUploadEnabled: Boolean(autoUploadEnabledInput?.checked),
    uploadTargetUrl: uploadTargetUrlInput?.value?.trim() || 'https://v0-web-app-logic.vercel.app/upload',
    runIntervals,
    gradeUrls: toArray(settingsGradeUrls?.value),
    attendanceUrls: toArray(settingsAttendanceUrls?.value),
  }

  chrome.storage.sync.set(payload, () => {
    if (chrome.runtime.lastError) {
      if (saveStatus) saveStatus.textContent = `Lỗi: ${chrome.runtime.lastError.message}`
      return
    }
    if (saveStatus) {
      saveStatus.textContent = 'Đã lưu cài đặt!'
      setTimeout(() => { if (saveStatus) saveStatus.textContent = '' }, 1500)
    }
  })
})