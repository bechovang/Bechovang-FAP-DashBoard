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

// Lắng nghe sự kiện từ popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startScraping') {
        console.log('Nhận được yêu cầu cào dữ liệu...');
        
        // Bắt đầu quy trình
        scrapeData();

        // Phản hồi ngay lập tức cho popup biết là đã nhận lệnh
        sendResponse({ status: 'Đã nhận lệnh, đang xử lý...' });
    } else if (message.action === 'downloadJson') {
        console.log("== DOWNLOAD FLOW: Nhận được yêu cầu tải file."); // Log 1
        
        chrome.storage.local.get('scrapedData', (result) => {
            console.log("== DOWNLOAD FLOW: Dữ liệu lấy từ storage:", result); // Log 2
            
            if (result && result.scrapedData) {
                const data = result.scrapedData;
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                
                console.log("== DOWNLOAD FLOW: Chuẩn bị tải xuống file."); // Log 3
                
                try {
                    chrome.downloads.download({
                        url: dataStr,
                        filename: 'fap_data.json',
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
                console.error("== DOWNLOAD FLOW: Không tìm thấy 'scrapedData' trong storage."); // Log lỗi
            }
        });
    }
    
    // Trả về true để giữ kênh liên lạc mở cho các phản hồi bất đồng bộ (nếu cần)
    return true; 
});

// Hàm chính điều phối quá trình cào dữ liệu
async function scrapeData() {
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
        console.error("Lỗi trong quá trình cào dữ liệu:", error);
        updatePopupStatus(`Đã xảy ra lỗi: ${(error as Error).message}`);
    }
}

// Lắng nghe dữ liệu được gửi về từ content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'scrapedData') {
        const data = message.data;
        console.log("Đã nhận dữ liệu từ content script:", data);
        
        updatePopupStatus('Đã nhận dữ liệu, đang lưu trữ...');

        // Tạo cấu trúc JSON cuối cùng (hiện tại chỉ có lịch thi)
        const finalJson = {
            examSchedule: data
        };

        // Lưu dữ liệu vào storage
        chrome.storage.local.set({ scrapedData: finalJson }, () => {
            console.log('== SAVE FLOW: Dữ liệu đã được LƯU THÀNH CÔNG vào storage.'); // Thêm log xác nhận
            // Gửi thông báo hoàn tất tới popup
            chrome.runtime.sendMessage({ action: 'scrapingComplete' });
        });
    }
});