// Universal HTML Scraper for FAP Pages
// Cào HTML từ các trang FAP khác nhau và gửi về background script

interface HTMLScrapingResult {
    url: string;
    pageTitle: string;
    timestamp: string;
    pageType: string;
    htmlContent: string;
    metadata?: any;
}

function scrapePageHTML(): HTMLScrapingResult {
    const url = window.location.href;
    const pageTitle = document.title;
    const timestamp = new Date().toISOString();
    
    // Xác định loại trang dựa trên URL
    let pageType = 'unknown';
    let metadata: any = {};
    
    if (url.includes('ScheduleOfWeek.aspx')) {
        pageType = 'weekly-schedule';
        metadata = extractWeeklyScheduleMetadata();
    } else if (url.includes('ScheduleExams.asp')) {
        pageType = 'exam-schedule';
        metadata = extractExamScheduleMetadata();
    } else if (url.includes('StudentGrade.aspx')) {
        pageType = 'student-grades';
        metadata = extractStudentGradesMetadata();
    } else if (url.includes('ViewAttendstudent.aspx')) {
        pageType = 'attendance-report';
        metadata = extractAttendanceMetadata();
    }
    
    // Lấy toàn bộ HTML content
    const htmlContent = document.documentElement.outerHTML;
    
    const result: HTMLScrapingResult = {
        url,
        pageTitle,
        timestamp,
        pageType,
        htmlContent,
        metadata
    };
    
    console.log(`HTML Scraper: Đã cào trang ${pageType}`, result);
    return result;
}

function extractWeeklyScheduleMetadata() {
    const metadata: any = {};
    
    // Lấy thông tin năm và tuần được chọn
    const yearSelect = document.querySelector('#ctl00_mainContent_drpYear') as HTMLSelectElement;
    const weekSelect = document.querySelector('#ctl00_mainContent_drpSelectWeek') as HTMLSelectElement;
    
    if (yearSelect) {
        metadata.selectedYear = yearSelect.value;
        metadata.selectedYearText = yearSelect.options[yearSelect.selectedIndex]?.text;
    }
    
    if (weekSelect) {
        metadata.selectedWeek = weekSelect.value;
        metadata.selectedWeekText = weekSelect.options[weekSelect.selectedIndex]?.text;
    }
    
    // Lấy thông tin ngày trong tuần
    const dayNameDiv = document.querySelector('#ctl00_mainContent_divNameDay');
    const dayDateDiv = document.querySelector('#ctl00_mainContent_divShowDate');
    
    if (dayNameDiv) {
        const dayNames = Array.from(dayNameDiv.querySelectorAll('th')).map(th => th.textContent?.trim());
        metadata.dayNames = dayNames;
    }
    
    if (dayDateDiv) {
        const dayDates = Array.from(dayDateDiv.querySelectorAll('th')).map(th => th.textContent?.trim());
        metadata.dayDates = dayDates;
    }
    
    return metadata;
}

function extractExamScheduleMetadata() {
    const metadata: any = {};
    
    // Lấy thông tin số lượng kỳ thi
    const examTable = document.querySelector('#ctl00_mainContent_divContent table');
    if (examTable) {
        const rows = examTable.querySelectorAll('tr');
        metadata.totalExams = rows.length - 1; // Trừ đi header row
    }
    
    return metadata;
}

function extractStudentGradesMetadata() {
    const metadata: any = {};
    
    // Lấy thông tin từ URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    metadata.rollNumber = urlParams.get('rollNumber');
    metadata.term = urlParams.get('term');
    metadata.course = urlParams.get('course');
    
    // Lấy thông tin môn học từ trang
    const courseNameElement = document.querySelector('.course-name, h2, h3');
    if (courseNameElement) {
        metadata.courseName = courseNameElement.textContent?.trim();
    }
    
    return metadata;
}

function extractAttendanceMetadata() {
    const metadata: any = {};
    
    // Lấy thông tin từ URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    metadata.studentId = urlParams.get('id');
    metadata.campus = urlParams.get('campus');
    metadata.term = urlParams.get('term');
    metadata.course = urlParams.get('course');
    
    return metadata;
}

function generateFileName(pageType: string, metadata: any): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    let fileName = `fap-${pageType}-${timestamp}`;
    
    switch (pageType) {
        case 'weekly-schedule':
            if (metadata.selectedYearText && metadata.selectedWeekText) {
                fileName = `fap-schedule-${metadata.selectedYearText}-${metadata.selectedWeekText}-${timestamp}`;
            }
            break;
        case 'exam-schedule':
            fileName = `fap-exam-schedule-${timestamp}`;
            break;
        case 'student-grades':
            if (metadata.rollNumber && metadata.term && metadata.course) {
                fileName = `fap-grades-${metadata.rollNumber}-${metadata.term}-${metadata.course}-${timestamp}`;
            }
            break;
        case 'attendance-report':
            if (metadata.studentId && metadata.term && metadata.course) {
                fileName = `fap-attendance-${metadata.studentId}-term${metadata.term}-course${metadata.course}-${timestamp}`;
            }
            break;
    }
    
    return fileName + '.txt';
}

// Chạy hàm cào và gửi dữ liệu về background script
const scrapedData = scrapePageHTML();
const fileName = generateFileName(scrapedData.pageType, scrapedData.metadata);

// Tạo nội dung file với metadata và HTML
const fileContent = `=== FAP HTML SCRAPING RESULT ===
URL: ${scrapedData.url}
Page Title: ${scrapedData.pageTitle}
Page Type: ${scrapedData.pageType}
Timestamp: ${scrapedData.timestamp}
File Name: ${fileName}

=== METADATA ===
${JSON.stringify(scrapedData.metadata, null, 2)}

=== HTML CONTENT ===
${scrapedData.htmlContent}
`;

// Gửi dữ liệu về background script để xử lý download
chrome.runtime.sendMessage({
    action: 'scrapedHTMLData',
    data: {
        content: fileContent,
        fileName: fileName,
        pageType: scrapedData.pageType,
        metadata: scrapedData.metadata
    }
}); 