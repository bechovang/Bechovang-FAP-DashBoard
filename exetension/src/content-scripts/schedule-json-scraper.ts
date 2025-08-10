// Schedule JSON Scraper for FAP Weekly Schedule
// Cào dữ liệu lịch học tuần và chuyển thành JSON

interface ScheduleActivity {
    slot: number;
    time: string;
    subjectCode: string;
    room: string | null;
    lecturer: string | null;
    attendanceStatus: string;
    materialsUrl: string | null;
}

interface ScheduleDay {
    day: string;
    date: string;
    activities: ScheduleActivity[];
}

interface WeekSchedule {
    year: number;
    weekNumber: number;
    weekLabel: string;
    days: DaySchedule[];
}

interface ScheduleJSONResult {
    lastUpdated: string;
    schedule: WeekSchedule[];
}

function parseScheduleToJSON(): ScheduleJSONResult {
    const lastUpdated = new Date().toISOString();

    // Lấy thông tin tuần từ các select box
    const yearSelect = document.querySelector('#ctl00_mainContent_drpYear') as HTMLSelectElement;
    const weekSelect = document.querySelector('#ctl00_mainContent_drpSelectWeek') as HTMLSelectElement;

    let selectedYear = 2025;
    let weekNumber = 1;
    let weekLabel = '';

    if (yearSelect?.selectedOptions[0]) {
        selectedYear = parseInt(yearSelect.selectedOptions[0].value);
    }

    if (weekSelect?.selectedOptions[0]) {
        weekNumber = parseInt(weekSelect.selectedOptions[0].value);
        weekLabel = weekSelect.selectedOptions[0].text;
    }

    // FIX 1: Selector bảng lịch học đã được sửa.
    // Bảng lịch học là bảng thứ 2 trong trang (sau bảng layout header).
    const allTables = document.querySelectorAll('table');
    // Bảng cần tìm thường là bảng thứ hai từ dưới lên, trước bảng footer.
    const scheduleTable = allTables[allTables.length - 2];
    
    if (!scheduleTable) {
        throw new Error('Không tìm thấy bảng lịch học. Selector có thể đã thay đổi.');
    }

    const weekSchedule: WeekSchedule = {
        year: selectedYear,
        weekNumber: weekNumber,
        weekLabel: weekLabel,
        days: []
    };

    const dayMap: { [key: string]: string } = {
        "Mon": "Monday", "Tue": "Tuesday", "Wed": "Wednesday",
        "Thu": "Thursday", "Fri": "Friday", "Sat": "Saturday", "Sun": "Sunday"
    };
    
    // FIX 2: Lấy header một cách chính xác từ <thead>
    const tableHead = scheduleTable.querySelector('thead');
    if (!tableHead) {
        throw new Error('Không tìm thấy thead trong bảng lịch học.');
    }
    
    const headerRows = tableHead.querySelectorAll('tr');
    if (headerRows.length < 2) {
        throw new Error('Cấu trúc a eader của bảng không hợp lệ');
    }

    const dayNameCells = headerRows[0].querySelectorAll('th');
    const dayDateCells = headerRows[1].querySelectorAll('th');
    
    const daysData: ScheduleDay[] = [];
    // Vòng lặp bắt đầu từ 1 để bỏ qua cột Year/Week
    for (let i = 1; i < dayNameCells.length; i++) {
        const dayNameShort = dayNameCells[i].textContent?.trim() || '';
        const dayNameFull = dayMap[dayNameShort] || dayNameShort;
        // FIX 3: Chỉ số của ngày tháng phải là i-1 vì mảng dayDateCells không có cột đầu tiên
        const date = dayDateCells[i - 1]?.textContent?.trim() || '';

        daysData.push({
            day: dayNameFull,
            date: date,
            activities: []
        });
    }

    // FIX 2 (tiếp): Lấy các dòng nội dung từ <tbody>
    const tableBody = scheduleTable.querySelector('tbody');
    if (!tableBody) {
        throw new Error('Không tìm thấy tbody trong bảng lịch học.');
    }
    
    const contentRows = tableBody.querySelectorAll('tr');

    for (const row of contentRows) {
        const cells = row.querySelectorAll('td');
        if (cells.length === 0) continue;
        
        // FIX 4: Đơn giản hóa việc trích xuất slot
        const slotText = cells[0].textContent?.trim() || '';
        if (!slotText.startsWith('Slot')) continue;

        const slotNumber = parseInt(slotText.replace('Slot ', ''));
        if (isNaN(slotNumber)) continue;

        // Duyệt qua các ô của các ngày (bỏ qua ô slot đầu tiên)
        for (let dayIndex = 0; dayIndex < daysData.length; dayIndex++) {
            const cell = cells[dayIndex + 1];
            if (!cell) continue;

            const activityP = cell.querySelector('p');
            if (!activityP) continue;
            
            const subjectTag = activityP.querySelector('a[href*="ActivityDetail.aspx"]');
            const materialTag = activityP.querySelector('a.label-warning');
            const timeTag = activityP.querySelector('span.label-success');
            const attendanceTag = activityP.querySelector('font');

            if (subjectTag && timeTag) {
                const subjectCode = subjectTag.textContent?.replace('-', '').trim() || '';
                const time = timeTag.textContent?.replace(/[()]/g, '').trim() || '';
                
                let room: string | null = null;
                const brTag = activityP.querySelector('br');
                if (brTag?.nextSibling?.textContent) {
                    const roomText = brTag.nextSibling.textContent.trim();
                    if (roomText.startsWith('at ')) {
                        room = roomText.substring(3).trim(); // Lấy phần text sau "at "
                    }
                }
                
                let attendanceStatus = "Not yet";
                if (attendanceTag) {
                    const attendanceText = attendanceTag.textContent?.trim() || '';
                    if (attendanceText === 'attended') {
                        attendanceStatus = "Attended";
                    } else if (attendanceText === 'absent') {
                        attendanceStatus = "Absent";
                    }
                }
                
                const materialsUrl = materialTag?.getAttribute('href') || null;
                
                const activity: ScheduleActivity = {
                    slot: slotNumber,
                    time: time,
                    subjectCode: subjectCode,
                    room: room,
                    lecturer: null, // Không có thông tin này trong HTML
                    attendanceStatus: attendanceStatus,
                    materialsUrl: materialsUrl
                };
                
                daysData[dayIndex].activities.push(activity);
            }
        }
    }

    weekSchedule.days = daysData;

    const result: ScheduleJSONResult = {
        lastUpdated: lastUpdated,
        schedule: [weekSchedule]
    };

    console.log('Schedule JSON Scraper: Đã cào dữ liệu lịch học thành công', result);
    return result;
}


// Chạy hàm cào và gửi dữ liệu (khối này giữ nguyên)
try {
    const scrapedData = parseScheduleToJSON();
    // Giả định đang chạy trong môi trường extension
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        const fileName = `fap-schedule-json-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        chrome.runtime.sendMessage({
            action: 'scrapedScheduleJSON',
            data: {
                content: JSON.stringify(scrapedData, null, 2),
                fileName: fileName,
                scheduleData: scrapedData
            }
        });
    }
} catch (error) {
    console.error('Schedule JSON Scraper: Lỗi khi cào dữ liệu', error);
    if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
            action: 'scheduleJSONScrapingError',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}