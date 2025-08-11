// Attendance JSON Scraper for FAP Course Pages
// Cào dữ liệu điểm danh từ trang môn học và chuyển thành JSON

interface AttendanceDetail {
    no: number;
    date: string;
    dayOfWeek: string;
    slot: number | null;
    time: string | null;
    status: string;
}

interface CourseAttendance {
    subjectCode: string;
    subjectName: string;
    groupName: string;
    absentPercentage: number;
    absentSlots: number;
    totalSlots: number;
    attendanceDetails: AttendanceDetail[];
}

interface SemesterAttendance {
    term: string;
    courses: CourseAttendance[];
}

interface AttendanceJSONResult {
    lastUpdated: string;
    semesters: SemesterAttendance[];
}

function cleanText(text: string | null): string {
    return text ? text.trim() : "";
}

function parseDate(dateStr: string): { date: string | null; dayOfWeek: string | null } {
    const parts = dateStr.trim().split(' ');
    if (parts.length < 2) {
        return { date: null, dayOfWeek: null };
    }
    
    const dayOfWeek = parts[0];
    const datePart = parts[1];
    
    try {
        // Convert from dd/mm/yyyy to yyyy-mm-dd
        const [day, month, year] = datePart.split('/');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return { date: formattedDate, dayOfWeek };
    } catch (error) {
        return { date: null, dayOfWeek };
    }
}

function parseSlot(slotStr: string): { slot: number | null; time: string | null } {
    const match = slotStr.match(/(\d+)_?\((\d{1,2}:\d{2}-\d{1,2}:\d{2})\)/);
    if (match) {
        return {
            slot: parseInt(match[1]),
            time: match[2]
        };
    }
    return { slot: null, time: null };
}

function parseSummary(summaryStr: string): { absentPercentage: number; absentSlots: number; totalSlots: number } {
    const match = summaryStr.match(/([\d\.]+)% absent so far \((\d+) absent on (\d+) total\)/);
    if (match) {
        return {
            absentPercentage: parseFloat(match[1]),
            absentSlots: parseInt(match[2]),
            totalSlots: parseInt(match[3])
        };
    }
    return {
        absentPercentage: 0.0,
        absentSlots: 0,
        totalSlots: 0
    };
}

function parseAttendanceToJSON(): AttendanceJSONResult {
    const lastUpdated = new Date().toISOString();
    
    // Lấy thông tin kỳ học hiện tại
    const termElement = document.querySelector('#ctl00_mainContent_divTerm b');
    const currentTerm = termElement ? cleanText(termElement.textContent) : 'Unknown';
    
    // Lấy thông tin môn học hiện tại
    const courseElement = document.querySelector('#ctl00_mainContent_divCourse b');
    let subjectCode = '';
    let subjectName = '';
    let groupName = '';
    
    if (courseElement) {
        const courseText = cleanText(courseElement.textContent);
        const courseMatch = courseText.match(/(.+?)\((.+?)\)\((.+?),start/);
        if (courseMatch) {
            subjectName = courseMatch[1].trim();
            subjectCode = courseMatch[2].trim();
            groupName = courseMatch[3].trim();
        } else {
            subjectName = courseText;
        }
    }
    
    // Tìm bảng điểm danh
    const attendanceTable = document.querySelector('.table.table-bordered.table1');
    if (!attendanceTable) {
        throw new Error('Không tìm thấy bảng điểm danh');
    }
    
    // Khởi tạo dữ liệu môn học
    const courseData: CourseAttendance = {
        subjectCode: subjectCode,
        subjectName: subjectName,
        groupName: groupName,
        absentPercentage: 0,
        absentSlots: 0,
        totalSlots: 0,
        attendanceDetails: []
    };
    
    // Lấy tất cả các hàng trong bảng điểm danh
    const rows = attendanceTable.querySelectorAll('tbody tr');
    
    // Duyệt qua từng hàng
    for (const row of rows) {
        const cells = row.querySelectorAll('td');
        
        if (cells.length < 7) continue;
        
        const no = parseInt(cleanText(cells[0].textContent)) || 0;
        const { date, dayOfWeek } = parseDate(cleanText(cells[1].textContent));
        const { slot, time } = parseSlot(cleanText(cells[2].textContent));
        const status = cleanText(cells[6].textContent);
        
        if (date && dayOfWeek) {
            courseData.attendanceDetails.push({
                no,
                date,
                dayOfWeek,
                slot,
                time,
                status
            });
        }
    }
    
    // Lấy thông tin tóm tắt từ footer
    const summaryElement = attendanceTable.querySelector('tfoot');
    if (summaryElement) {
        const summaryInfo = parseSummary(cleanText(summaryElement.textContent));
        courseData.absentPercentage = summaryInfo.absentPercentage;
        courseData.absentSlots = summaryInfo.absentSlots;
        courseData.totalSlots = summaryInfo.totalSlots;
    }
    
    // Tạo cấu trúc kết quả
    const semesterData: SemesterAttendance = {
        term: currentTerm,
        courses: [courseData]
    };
    
    const result: AttendanceJSONResult = {
        lastUpdated: lastUpdated,
        semesters: [semesterData]
    };
    
    console.log('Attendance JSON Scraper: Đã cào dữ liệu điểm danh thành công', result);
    return result;
}

// Chạy hàm cào và gửi dữ liệu về background script
try {
    const scrapedData = parseAttendanceToJSON();
    const fileName = `fap-attendance-${scrapedData.semesters[0].courses[0].subjectCode}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    // Gửi dữ liệu về background script để xử lý download
    chrome.runtime.sendMessage({
        action: 'scrapedAttendanceJSON',
        data: {
            content: JSON.stringify(scrapedData, null, 2),
            fileName: fileName,
            attendanceData: scrapedData
        }
    });
} catch (error) {
    console.error('Attendance JSON Scraper: Lỗi khi cào dữ liệu', error);
    chrome.runtime.sendMessage({
        action: 'attendanceJSONScrapingError',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
} 