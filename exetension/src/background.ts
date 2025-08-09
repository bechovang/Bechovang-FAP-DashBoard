console.log("Background script loaded.");

// Hàm để tiêm và chạy content script
async function injectAndExecuteScript(tabId: number, file: string) {
    await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [file],
    });
}

// Hàm gửi thông điệp cập nhật trạng thái tới popup
function updatePopupStatus(status: string) {
    chrome.runtime.sendMessage({ action: 'updateStatus', data: status });
}

// Hàm tải dữ liệu
function downloadData(type: 'all' | 'exam' | 'curriculum' | 'profile', filename: string) {
    chrome.storage.local.get('scrapedData', (result) => {
        console.log("== DOWNLOAD FLOW: Dữ liệu lấy từ storage:", result);
        
        if (result && result.scrapedData) {
            let dataToDownload;
            
            switch (type) {
                case 'all':
                    dataToDownload = result.scrapedData;
                    break;
                case 'exam':
                    dataToDownload = {
                        examSchedule: result.scrapedData.examSchedule || []
                    };
                    break;
                case 'curriculum':
                    dataToDownload = {
                        curriculum: result.scrapedData.curriculum || {}
                    };
                    break;
                case 'profile':
                    dataToDownload = {
                        profile: result.scrapedData.profile || {}
                    };
                    break;
                default:
                    console.error("== DOWNLOAD FLOW: Loại tải không hợp lệ:", type);
                    return;
            }
            
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToDownload, null, 2));
            
            console.log("== DOWNLOAD FLOW: Chuẩn bị tải xuống file:", filename);
            
            try {
                chrome.downloads.download({
                    url: dataStr,
                    filename: filename,
                    saveAs: true
                }, (downloadId) => {
                    if (chrome.runtime.lastError) {
                        console.error("== DOWNLOAD FLOW: Lỗi khi tải file:", chrome.runtime.lastError);
                    } else {
                        console.log("== DOWNLOAD FLOW: Tải file thành công, downloadId:", downloadId);
                    }
                });
            } catch (error) {
                console.error("== DOWNLOAD FLOW: Lỗi khi gọi chrome.downloads.download:", error);
            }
        } else {
            console.error("== DOWNLOAD FLOW: Không tìm thấy 'scrapedData' trong storage.");
        }
    });
}

// Lắng nghe sự kiện từ popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startScraping') {
        console.log('Nhận được yêu cầu cào dữ liệu...');
        
        // Bắt đầu quy trình cào dữ liệu (bao gồm cả lịch thi và chương trình học)
        scrapeAllData();

        // Phản hồi ngay lập tức cho popup biết là đã nhận lệnh
        sendResponse({ status: 'Đã nhận lệnh, đang xử lý...' });
    } else if (message.action === 'downloadAll') {
        console.log("== DOWNLOAD FLOW: Nhận được yêu cầu tải tất cả dữ liệu."); 
        downloadData('all', 'fap_data_complete.json');
        
    } else if (message.action === 'downloadExam') {
        console.log("== DOWNLOAD FLOW: Nhận được yêu cầu tải dữ liệu lịch thi.");
        downloadData('exam', 'fap_exam_schedule.json');
        
    } else if (message.action === 'downloadCurriculum') {
        console.log("== DOWNLOAD FLOW: Nhận được yêu cầu tải dữ liệu chương trình học.");
        downloadData('curriculum', 'fap_curriculum.json');
        
    } else if (message.action === 'downloadProfile') {
        console.log("== DOWNLOAD FLOW: Nhận được yêu cầu tải dữ liệu profile.");
        downloadData('profile', 'fap_profile.json');
    }
    
    // Trả về true để giữ kênh liên lạc mở cho các phản hồi bất đồng bộ (nếu cần)
    return true; 
});

// Hàm chính điều phối quá trình cào dữ liệu (lịch thi và chương trình học)
async function scrapeAllData() {
    try {
        updatePopupStatus('Bắt đầu cào dữ liệu...');
        
        // Cào dữ liệu profile trước
        await scrapeProfile();
        
        // Sau đó cào dữ liệu lịch thi
        await scrapeExamData();
        
        // Cuối cùng cào dữ liệu chương trình học
        await scrapeCurriculum();
        
    } catch (error) {
        console.error("Lỗi trong quá trình cào dữ liệu:", error);
        updatePopupStatus(`Đã xảy ra lỗi: ${(error as Error).message}`);
    }
}

// Hàm cào dữ liệu lịch thi
async function scrapeExamData() {
    try {
        // URL của trang lịch thi
        const examScheduleUrl = "https://fap.fpt.edu.vn/Exam/ScheduleExams.aspx";
        
        updatePopupStatus('Đang mở trang Lịch thi...');

        // Tạo một tab mới để thực hiện việc cào
        const tab = await chrome.tabs.create({ url: examScheduleUrl, active: false });
        
        if (tab.id) {
            // Lắng nghe sự kiện tab được cập nhật hoàn toàn
            chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                    // Gỡ bỏ listener để tránh chạy nhiều lần
                    chrome.tabs.onUpdated.removeListener(listener);

                    updatePopupStatus('Đang cào dữ liệu Lịch thi...');
                    
                    // Tiêm content script vào trang
                    await injectAndExecuteScript(tab.id, 'content-scripts/fap-scraper.js');
                    
                    // Đóng tab sau khi cào xong (có thể comment dòng này để debug)
                    // await chrome.tabs.remove(tab.id);
                }
            });
        }
    } catch (error) {
        console.error("Lỗi trong quá trình cào dữ liệu lịch thi:", error);
        updatePopupStatus(`Đã xảy ra lỗi: ${(error as Error).message}`);
    }
}

// Hàm cào dữ liệu chương trình học
async function scrapeCurriculum() {
    try {
        // URL của trang chương trình học
        const curriculumUrl = "https://fap.fpt.edu.vn/FrontOffice/StudentCurriculum.aspx";
        
        updatePopupStatus('Đang mở trang Chương trình học...');

        // Tạo một tab mới để thực hiện việc cào
        const tab = await chrome.tabs.create({ url: curriculumUrl, active: false });
        
        if (tab.id) {
            // Lắng nghe sự kiện tab được cập nhật hoàn toàn
            chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                    // Gỡ bỏ listener để tránh chạy nhiều lần
                    chrome.tabs.onUpdated.removeListener(listener);

                    updatePopupStatus('Đang cào dữ liệu Chương trình học...');
                    
                    // Tiêm content script vào trang
                    await injectAndExecuteScript(tab.id, 'content-scripts/fap-curriculum-scraper.js');
                    
                    // Đóng tab sau khi cào xong (có thể comment dòng này để debug)
                    // await chrome.tabs.remove(tab.id);
                }
            });
        }
    } catch (error) {
        console.error("Lỗi trong quá trình cào dữ liệu chương trình học:", error);
        updatePopupStatus(`Đã xảy ra lỗi: ${(error as Error).message}`);
    }
}

// Hàm cào dữ liệu profile
async function scrapeProfile() {
    try {
        // URL của trang profile
        const profileUrl = "https://fap.fpt.edu.vn/User/Profile.aspx";
        
        updatePopupStatus('Đang mở trang Profile...');

        // Tạo một tab mới để thực hiện việc cào
        const tab = await chrome.tabs.create({ url: profileUrl, active: false });
        
        if (tab.id) {
            // Lắng nghe sự kiện tab được cập nhật hoàn toàn
            chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                    // Gỡ bỏ listener để tránh chạy nhiều lần
                    chrome.tabs.onUpdated.removeListener(listener);

                    updatePopupStatus('Đang cào dữ liệu Profile...');
                    
                    // Tiêm content script vào trang
                    await injectAndExecuteScript(tab.id, 'content-scripts/fap-profile-scraper.js');
                    
                    // Đóng tab sau khi cào xong (có thể comment dòng này để debug)
                    // await chrome.tabs.remove(tab.id);
                }
            });
        }
    } catch (error) {
        console.error("Lỗi trong quá trình cào dữ liệu profile:", error);
        updatePopupStatus(`Đã xảy ra lỗi: ${(error as Error).message}`);
    }
}

// Biến để lưu trữ dữ liệu tạm thời
let tempProfileData: any = null;
let tempExamData: any = null;
let tempCurriculumData: any = null;

// Lắng nghe dữ liệu được gửi về từ content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrapedData') {
        const data = message.data;
        console.log("Đã nhận dữ liệu lịch thi từ content script:", data);
        
        updatePopupStatus('Đã nhận dữ liệu lịch thi...');
        
        // Lưu dữ liệu lịch thi tạm thời
        tempExamData = data;
        
        // Kiểm tra xem đã có dữ liệu chương trình học chưa
        checkAndSaveAllData();
        
    } else if (message.action === 'scrapedCurriculumData') {
        const data = message.data;
        console.log("Đã nhận dữ liệu chương trình học từ content script:", data);
        
        updatePopupStatus('Đã nhận dữ liệu chương trình học...');
        
        // Lưu dữ liệu chương trình học tạm thời
        tempCurriculumData = data;
        
        // Kiểm tra xem đã có đủ dữ liệu chưa
        checkAndSaveAllData();
        
    } else if (message.action === 'scrapedProfileData') {
        const data = message.data;
        console.log("Đã nhận dữ liệu profile từ content script:", data);
        
        updatePopupStatus('Đã nhận dữ liệu profile...');
        
        // Lưu dữ liệu profile tạm thời
        tempProfileData = data;
        
        // Kiểm tra xem đã có đủ dữ liệu chưa
        checkAndSaveAllData();
    }
});

// Hàm kiểm tra và lưu tất cả dữ liệu khi đã có đủ
function checkAndSaveAllData() {
    if (tempProfileData && tempExamData && tempCurriculumData) {
        updatePopupStatus('Đang lưu trữ tất cả dữ liệu...');

        // Tạo cấu trúc JSON cuối cùng với profile, lịch thi và chương trình học
        const finalJson = {
            profile: tempProfileData,
            examSchedule: tempExamData,
            curriculum: tempCurriculumData
        };

        // Lưu dữ liệu vào storage
        chrome.storage.local.set({ scrapedData: finalJson }, () => {
            console.log('== SAVE FLOW: Tất cả dữ liệu đã được LƯU THÀNH CÔNG vào storage.'); // Thêm log xác nhận
            
            // Reset dữ liệu tạm thời
            tempProfileData = null;
            tempExamData = null;
            tempCurriculumData = null;
            
            // Gửi thông báo hoàn tất tới popup
            chrome.runtime.sendMessage({ action: 'scrapingComplete' });
        });
    }
}