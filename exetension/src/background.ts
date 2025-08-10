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
    } else if (message.action === 'scrapeHTMLPage') {
        // Xử lý yêu cầu cào HTML từ popup
        console.log(`Nhận được yêu cầu cào HTML trang: ${message.pageType}`);
        scrapeHTMLPage(message.pageType);
        sendResponse({ status: 'Đang mở trang để cào HTML...' });
    } else if (message.action === 'scrapeCurrentPage') {
        // Cào HTML trang hiện tại
        console.log('Nhận được yêu cầu cào HTML trang hiện tại');
        scrapeCurrentPageHTML();
        sendResponse({ status: 'Đang cào HTML trang hiện tại...' });
    } else if (message.action === 'scrapeScheduleJSON') {
        // Cào JSON lịch học tuần
        console.log('Nhận được yêu cầu cào JSON lịch học tuần');
        scrapeScheduleJSON();
        sendResponse({ status: 'Đang mở trang lịch tuần để cào JSON...' });
    } else if (message.action === 'scrapeGradeJSON') {
        // Cào JSON điểm từ các link môn học
        console.log('Nhận được yêu cầu cào JSON điểm từ các link:', message.urls);
        scrapeGradeJSON(message.urls);
        sendResponse({ status: 'Đang bắt đầu cào điểm từ các môn học...' });
    } else if (message.action === 'scrapeAttendanceJSON') {
        // Cào JSON điểm danh từ các link môn học
        console.log('Nhận được yêu cầu cào JSON điểm danh từ các link:', message.urls);
        scrapeAttendanceJSON(message.urls);
        sendResponse({ status: 'Đang bắt đầu cào điểm danh từ các môn học...' });
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
    } else if (message.action === 'scrapedHTMLData') {
        // Xử lý dữ liệu HTML đã cào từ content script
        const htmlData = message.data;
        console.log("Đã nhận dữ liệu HTML từ content script:", htmlData.fileName);
        
        updatePopupStatus('Đang tải file HTML...');
        
        // Tải file HTML
        downloadHTMLFile(htmlData.content, htmlData.fileName);
    } else if (message.action === 'scrapedScheduleJSON') {
        // Xử lý dữ liệu JSON lịch học đã cào từ content script
        const scheduleData = message.data;
        console.log("Đã nhận dữ liệu JSON lịch học từ content script:", scheduleData.fileName);
        
        updatePopupStatus('Đang tải file JSON lịch học...');
        
        // Tải file JSON
        downloadJSONFile(scheduleData.content, scheduleData.fileName);
    } else if (message.action === 'scrapedGradeJSON') {
        // Xử lý dữ liệu JSON điểm đã cào từ content script
        const gradeData = message.data;
        console.log("Đã nhận dữ liệu JSON điểm từ content script:", gradeData.fileName);
        
        // Thêm dữ liệu vào bộ sưu tập tổng hợp
        if (gradeData.gradeData && gradeData.gradeData.semesters) {
            for (const semester of gradeData.gradeData.semesters) {
                // Kiểm tra xem kỳ học này đã có trong danh sách chưa
                let existingSemester = semesterMap.get(semester.term);
                
                if (!existingSemester) {
                    // Tạo kỳ học mới
                    existingSemester = {
                        term: semester.term,
                        courses: []
                    };
                    semesterMap.set(semester.term, existingSemester);
                    allGradeData.semesters.push(existingSemester);
                }
                
                // Thêm các môn học vào kỳ học
                for (const course of semester.courses) {
                    existingSemester.courses.push(course);
                }
            }
        }
        
        // Đánh dấu đã nhận được dữ liệu
        dataReceived = true;
        
        updatePopupStatus('Đã thu thập dữ liệu điểm, đang tiếp tục...');
    } else if (message.action === 'scrapedAttendanceJSON') {
        // Xử lý dữ liệu JSON điểm danh đã cào từ content script
        const attendanceData = message.data;
        console.log("Đã nhận dữ liệu JSON điểm danh từ content script:", attendanceData.fileName);
        
        // Thêm dữ liệu vào bộ sưu tập tổng hợp
        if (attendanceData.attendanceData && attendanceData.attendanceData.semesters) {
            for (const semester of attendanceData.attendanceData.semesters) {
                // Kiểm tra xem kỳ học này đã có trong danh sách chưa
                let existingSemester = attendanceSemesterMap.get(semester.term);
                
                if (!existingSemester) {
                    // Tạo kỳ học mới
                    existingSemester = {
                        term: semester.term,
                        courses: []
                    };
                    attendanceSemesterMap.set(semester.term, existingSemester);
                    allAttendanceData.semesters.push(existingSemester);
                }
                
                // Thêm các môn học vào kỳ học
                for (const course of semester.courses) {
                    existingSemester.courses.push(course);
                }
            }
        }
        
        // Đánh dấu đã nhận được dữ liệu
        attendanceDataReceived = true;
        
        updatePopupStatus('Đã thu thập dữ liệu điểm danh, đang tiếp tục...');
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

// Hàm cào HTML từ các trang cụ thể
async function scrapeHTMLPage(pageType: string) {
    try {
        let targetUrl = '';
        
        // Xác định URL dựa trên loại trang
        switch (pageType) {
            case 'weekly-schedule':
                targetUrl = 'https://fap.fpt.edu.vn/Report/ScheduleOfWeek.aspx';
                break;
            case 'exam-schedule':
                targetUrl = 'https://fap.fpt.edu.vn/Exam/ScheduleExams.aspx';
                break;
            case 'student-grades':
                targetUrl = 'https://fap.fpt.edu.vn/Grade/StudentGrade.aspx';
                break;
            case 'attendance-report':
                targetUrl = 'https://fap.fpt.edu.vn/Report/ViewAttendstudent.aspx';
                break;
            default:
                throw new Error(`Loại trang không được hỗ trợ: ${pageType}`);
        }
        
        updatePopupStatus(`Đang mở trang ${pageType}...`);
        
        // Tạo tab mới để thực hiện việc cào HTML
        const tab = await chrome.tabs.create({ url: targetUrl, active: false });
        
        if (tab.id) {
            // Lắng nghe sự kiện tab được cập nhật hoàn toàn
            chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                    // Gỡ bỏ listener để tránh chạy nhiều lần
                    chrome.tabs.onUpdated.removeListener(listener);

                    updatePopupStatus(`Đang cào HTML từ ${pageType}...`);
                    
                    // Tiêm content script HTML scraper vào trang
                    await injectAndExecuteScript(tab.id, 'content-scripts/html-scraper.js');
                    
                    // Đóng tab sau 5 giây (để đảm bảo scraping hoàn tất)
                    setTimeout(async () => {
                        try {
                            if (tab.id) {
                                await chrome.tabs.remove(tab.id);
                            }
                        } catch (error) {
                            console.log('Tab có thể đã được đóng trước đó');
                        }
                    }, 5000);
                }
            });
        }
    } catch (error) {
        console.error(`Lỗi trong quá trình cào HTML ${pageType}:`, error);
        updatePopupStatus(`Lỗi: ${(error as Error).message}`);
        chrome.runtime.sendMessage({ 
            action: 'htmlScrapingError', 
            error: (error as Error).message 
        });
    }
}

// Hàm cào HTML từ trang hiện tại
async function scrapeCurrentPageHTML() {
    try {
        // Lấy tab hiện tại
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];
        
        if (!currentTab || !currentTab.id) {
            throw new Error('Không thể tìm thấy tab hiện tại');
        }
        
        // Kiểm tra xem tab có phải là trang FAP không
        if (!currentTab.url || !currentTab.url.includes('fap.fpt.edu.vn')) {
            throw new Error('Tab hiện tại không phải là trang FAP');
        }
        
        updatePopupStatus('Đang cào HTML từ trang hiện tại...');
        
        // Tiêm content script HTML scraper vào tab hiện tại
        await injectAndExecuteScript(currentTab.id, 'content-scripts/html-scraper.js');
        
    } catch (error) {
        console.error('Lỗi trong quá trình cào HTML trang hiện tại:', error);
        updatePopupStatus(`Lỗi: ${(error as Error).message}`);
        chrome.runtime.sendMessage({ 
            action: 'htmlScrapingError', 
            error: (error as Error).message 
        });
    }
}

// Hàm tải file HTML
function downloadHTMLFile(content: string, fileName: string) {
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(content);
    
    console.log("== HTML DOWNLOAD FLOW: Chuẩn bị tải xuống file HTML:", fileName);
    
    try {
        chrome.downloads.download({
            url: dataStr,
            filename: fileName,
            saveAs: true
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("== HTML DOWNLOAD FLOW: Lỗi khi tải file:", chrome.runtime.lastError);
                chrome.runtime.sendMessage({ 
                    action: 'htmlScrapingError', 
                    error: chrome.runtime.lastError.message 
                });
            } else {
                console.log("== HTML DOWNLOAD FLOW: Tải file thành công, downloadId:", downloadId);
                chrome.runtime.sendMessage({ 
                    action: 'htmlScrapingComplete', 
                    fileName: fileName 
                });
            }
        });
    } catch (error) {
        console.error("== HTML DOWNLOAD FLOW: Lỗi khi gọi chrome.downloads.download:", error);
        chrome.runtime.sendMessage({ 
            action: 'htmlScrapingError', 
            error: (error as Error).message 
        });
    }
}

// Hàm tải file JSON
function downloadJSONFile(content: string, fileName: string) {
    const dataStr = "data:application/json;charset=utf-8," + encodeURIComponent(content);
    
    console.log("== JSON DOWNLOAD FLOW: Chuẩn bị tải xuống file JSON:", fileName);
    
    try {
        chrome.downloads.download({
            url: dataStr,
            filename: fileName,
            saveAs: true
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                console.error("== JSON DOWNLOAD FLOW: Lỗi khi tải file:", chrome.runtime.lastError);
                chrome.runtime.sendMessage({ 
                    action: 'scheduleJSONScrapingError', 
                    error: chrome.runtime.lastError.message 
                });
            } else {
                console.log("== JSON DOWNLOAD FLOW: Tải file thành công, downloadId:", downloadId);
                chrome.runtime.sendMessage({ 
                    action: 'scheduleJSONScrapingComplete', 
                    fileName: fileName 
                });
            }
        });
    } catch (error) {
        console.error("== JSON DOWNLOAD FLOW: Lỗi khi gọi chrome.downloads.download:", error);
        chrome.runtime.sendMessage({ 
            action: 'scheduleJSONScrapingError', 
            error: (error as Error).message 
        });
    }
}

// Hàm cào JSON lịch học tuần
async function scrapeScheduleJSON() {
    try {
        // URL của trang lịch học tuần
        const scheduleUrl = "https://fap.fpt.edu.vn/Report/ScheduleOfWeek.aspx";
        
        updatePopupStatus('Đang mở trang lịch học tuần...');

        // Tạo một tab mới để thực hiện việc cào
        const tab = await chrome.tabs.create({ url: scheduleUrl, active: false });
        
        if (tab.id) {
            // Lắng nghe sự kiện tab được cập nhật hoàn toàn
            chrome.tabs.onUpdated.addListener(async function listener(tabId, info) {
                if (tabId === tab.id && info.status === 'complete') {
                    // Gỡ bỏ listener để tránh chạy nhiều lần
                    chrome.tabs.onUpdated.removeListener(listener);

                    updatePopupStatus('Đang cào JSON lịch học tuần...');
                    
                    // Tiêm content script schedule JSON scraper vào trang
                    await injectAndExecuteScript(tab.id, 'content-scripts/schedule-json-scraper.js');
                    
                    // Đóng tab sau 5 giây (để đảm bảo scraping hoàn tất)
                    setTimeout(async () => {
                        try {
                            if (tab.id) {
                                await chrome.tabs.remove(tab.id);
                            }
                        } catch (error) {
                            console.log('Tab có thể đã được đóng trước đó');
                        }
                    }, 5000);
                }
            });
        }
    } catch (error) {
        console.error('Lỗi trong quá trình cào JSON lịch học tuần:', error);
        updatePopupStatus(`Lỗi: ${(error as Error).message}`);
        chrome.runtime.sendMessage({ 
            action: 'scheduleJSONScrapingError', 
            error: (error as Error).message 
        });
    }
}

// Biến để lưu trữ dữ liệu điểm từ tất cả các môn học
let allGradeData: any = {
    lastUpdated: new Date().toISOString(),
    semesters: []
};

// Map để nhóm các môn học theo kỳ học
const semesterMap = new Map<string, any>();

// Flag để theo dõi việc nhận dữ liệu từ content script
let dataReceived = false;

// Biến để lưu trữ dữ liệu điểm danh từ tất cả các môn học
let allAttendanceData: any = {
    lastUpdated: new Date().toISOString(),
    semesters: []
};

// Map để nhóm các môn học điểm danh theo kỳ học
const attendanceSemesterMap = new Map<string, any>();

// Flag để theo dõi việc nhận dữ liệu điểm danh từ content script
let attendanceDataReceived = false;

// Hàm cào JSON điểm từ các link môn học
async function scrapeGradeJSON(urls: string[]) {
    try {
        // Reset dữ liệu
        allGradeData = {
            lastUpdated: new Date().toISOString(),
            semesters: []
        };
        semesterMap.clear();
        dataReceived = false;
        
        updatePopupStatus(`Đang cào điểm từ ${urls.length} môn học...`);
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            
            // Cập nhật tiến độ
            chrome.runtime.sendMessage({ 
                action: 'gradeJSONScrapingProgress', 
                current: i + 1, 
                total: urls.length 
            });
            
            try {
                // Tạo tab mới để cào dữ liệu từ URL này
                const tab = await chrome.tabs.create({ url: url, active: false });
                
                if (tab.id) {
                    // Đợi trang load xong và cào dữ liệu
                    await new Promise<void>((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            chrome.tabs.onUpdated.removeListener(listener);
                            reject(new Error('Timeout waiting for page to load'));
                        }, 30000); // 30 giây timeout
                        
                        const listener = async (tabId: number, info: any) => {
                            if (tabId === tab.id && info.status === 'complete') {
                                clearTimeout(timeout);
                                chrome.tabs.onUpdated.removeListener(listener);
                                
                                try {
                                    // Tiêm content script grade JSON scraper vào trang
                                    await injectAndExecuteScript(tab.id, 'content-scripts/grade-json-scraper.js');
                                    
                                    // Đợi một chút để content script chạy xong
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                    
                                    resolve();
                                } catch (error) {
                                    reject(error);
                                }
                            }
                        };
                        
                        chrome.tabs.onUpdated.addListener(listener);
                    });
                    
                    // Đợi cho đến khi nhận được dữ liệu từ content script hoặc timeout
                    let waitTime = 0;
                    const maxWaitTime = 10000; // 10 giây timeout
                    
                    while (!dataReceived && waitTime < maxWaitTime) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        waitTime += 500;
                    }
                    
                    // Reset flag cho môn học tiếp theo
                    dataReceived = false;
                    
                    // Đóng tab sau khi cào xong
                    try {
                        await chrome.tabs.remove(tab.id);
                    } catch (error) {
                        console.log('Tab có thể đã được đóng trước đó:', error);
                    }
                    
                    // Đợi một chút trước khi cào môn học tiếp theo
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                }
            } catch (error) {
                console.error(`Lỗi khi cào điểm từ URL ${url}:`, error);
                // Tiếp tục với môn học tiếp theo
            }
        }
        
        // Tạo file JSON tổng hợp sau khi cào xong tất cả
        const fileName = `fap-grades-combined-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const content = JSON.stringify(allGradeData, null, 2);
        
        // Tải file JSON tổng hợp
        downloadJSONFile(content, fileName);
        
        // Gửi thông báo hoàn thành
        chrome.runtime.sendMessage({ 
            action: 'gradeJSONScrapingComplete', 
            fileName: fileName 
        });
        
        updatePopupStatus(`Đã hoàn thành cào điểm từ ${urls.length} môn học và tạo file tổng hợp!`);
        
    } catch (error) {
        console.error('Lỗi trong quá trình cào JSON điểm:', error);
        updatePopupStatus(`Lỗi: ${(error as Error).message}`);
        chrome.runtime.sendMessage({ 
            action: 'gradeJSONScrapingError', 
            error: (error as Error).message 
        });
    }
}

// Hàm cào JSON điểm danh từ các link môn học
async function scrapeAttendanceJSON(urls: string[]) {
    try {
        // Reset dữ liệu
        allAttendanceData = {
            lastUpdated: new Date().toISOString(),
            semesters: []
        };
        attendanceSemesterMap.clear();
        attendanceDataReceived = false;
        
        updatePopupStatus(`Đang cào điểm danh từ ${urls.length} môn học...`);
        
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            
            // Cập nhật tiến độ
            chrome.runtime.sendMessage({ 
                action: 'attendanceJSONScrapingProgress', 
                current: i + 1, 
                total: urls.length 
            });
            
            try {
                // Tạo tab mới để cào dữ liệu từ URL này
                const tab = await chrome.tabs.create({ url: url, active: false });
                
                if (tab.id) {
                    // Đợi trang load xong và cào dữ liệu
                    await new Promise<void>((resolve, reject) => {
                        const timeout = setTimeout(() => {
                            chrome.tabs.onUpdated.removeListener(listener);
                            reject(new Error('Timeout waiting for page to load'));
                        }, 30000); // 30 giây timeout
                        
                        const listener = async (tabId: number, info: any) => {
                            if (tabId === tab.id && info.status === 'complete') {
                                clearTimeout(timeout);
                                chrome.tabs.onUpdated.removeListener(listener);
                                
                                try {
                                    // Tiêm content script attendance JSON scraper vào trang
                                    await injectAndExecuteScript(tab.id, 'content-scripts/attendance-json-scraper.js');
                                    
                                    // Đợi một chút để content script chạy xong
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                    
                                    resolve();
                                } catch (error) {
                                    reject(error);
                                }
                            }
                        };
                        
                        chrome.tabs.onUpdated.addListener(listener);
                    });
                    
                    // Đợi cho đến khi nhận được dữ liệu từ content script hoặc timeout
                    let waitTime = 0;
                    const maxWaitTime = 10000; // 10 giây timeout
                    
                    while (!attendanceDataReceived && waitTime < maxWaitTime) {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        waitTime += 500;
                    }
                    
                    // Reset flag cho môn học tiếp theo
                    attendanceDataReceived = false;
                    
                    // Đóng tab sau khi cào xong
                    try {
                        await chrome.tabs.remove(tab.id);
                    } catch (error) {
                        console.log('Tab có thể đã được đóng trước đó:', error);
                    }
                    
                    // Đợi một chút trước khi cào môn học tiếp theo
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                }
            } catch (error) {
                console.error(`Lỗi khi cào điểm danh từ URL ${url}:`, error);
                // Tiếp tục với môn học tiếp theo
            }
        }
        
        // Tạo file JSON tổng hợp sau khi cào xong tất cả
        const fileName = `fap-attendance-combined-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        const content = JSON.stringify(allAttendanceData, null, 2);
        
        // Tải file JSON tổng hợp
        downloadJSONFile(content, fileName);
        
        // Gửi thông báo hoàn thành
        chrome.runtime.sendMessage({ 
            action: 'attendanceJSONScrapingComplete', 
            fileName: fileName 
        });
        
        updatePopupStatus(`Đã hoàn thành cào điểm danh từ ${urls.length} môn học và tạo file tổng hợp!`);
        
    } catch (error) {
        console.error('Lỗi trong quá trình cào JSON điểm danh:', error);
        updatePopupStatus(`Lỗi: ${(error as Error).message}`);
        chrome.runtime.sendMessage({ 
            action: 'attendanceJSONScrapingError', 
            error: (error as Error).message 
        });
    }
}