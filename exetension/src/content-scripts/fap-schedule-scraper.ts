// File: src/content-scripts/fap-schedule-scraper.ts

// --- Định nghĩa các kiểu dữ liệu (Interfaces) ---
interface Activity {
    slot: number;
    time: string | null;
    subjectCode: string | null;
    room: string | null;
    lecturer: string | null;
    attendanceStatus: string | null;
    materialsUrl: string | null;
}

interface DaySchedule {
    day: string;
    date: string;
    activities: Activity[];
}

interface WeekSchedule {
    year: number;
    weekNumber: number;
    weekLabel: string;
    days: DaySchedule[];
}

interface FinalScheduleOutput {
    lastUpdated: string;
    schedule: WeekSchedule[];
}

// --- Hàm chính để cào dữ liệu ---
function scrapeSchedule(): FinalScheduleOutput | null {
    console.log("FAP Schedule Scraper: Bắt đầu cào dữ liệu lịch học.");

    // Wait for page to be fully loaded
    if (document.readyState !== 'complete') {
        console.log("Page not fully loaded, waiting...");
        setTimeout(() => scrapeSchedule(), 1000);
        return null;
    }

    // --- Helper function để lấy và xử lý text từ một element ---
    const getElementText = (selector: string, parent: Document | Element = document): string => {
        const el = parent.querySelector(selector);
        return el ? (el as HTMLElement).innerText.trim() : '';
    };

    // --- Helper function để phân tích một ô hoạt động (<td>) ---
    const parseActivityCell = (cell: HTMLElement, slot: number): Activity | null => {
        console.log(`Parsing slot ${slot}, cell content:`, cell.innerHTML);
        
        if (cell.innerText.trim() === '-') {
            console.log(`Slot ${slot}: Empty cell (-)`)
            return null;
        }

        // Tìm thẻ <p> chứa thông tin chính
        const paragraph = cell.querySelector('p');
        if (!paragraph) {
            console.log(`Slot ${slot}: No paragraph found`);
            return null;
        }

        // Tìm thẻ <a> chính trong paragraph
        const mainLink = paragraph.querySelector('a');
        if (!mainLink) {
            console.log(`Slot ${slot}: No main link found`);
            return null;
        }

        const innerHtml = mainLink.innerHTML;
        console.log(`Slot ${slot} main link HTML:`, innerHtml);

        // 1. Lấy Mã môn học (Subject Code) - từ phần đầu trước dấu "-"
        const subjectCodeText = mainLink.textContent?.split('-')[0] || '';
        const subjectCode = subjectCodeText.trim() || null;
        console.log(`Slot ${slot} subject code:`, subjectCode);

        // 2. Lấy link tài liệu (Materials URL) - tìm link có text "View Materials"
        const materialsLink = mainLink.querySelector('a') || paragraph.querySelector('a[href*="ListScheduleSyllabus"]');
        const materialsUrl = materialsLink?.getAttribute('href') || null;
        console.log(`Slot ${slot} materials URL:`, materialsUrl);

        // 3. Lấy thời gian từ span.label-success hoặc text trong ngoặc
        let time: string | null = getElementText('span.label-success', paragraph) || null;
        if (!time) {
            // Fallback: tìm text trong ngoặc (HH:MM-HH:MM)
            const timeMatch = paragraph.innerHTML.match(/\((\d{2}:\d{2}-\d{2}:\d{2})\)/);
            time = timeMatch ? timeMatch[1] : null;
        }
        if (time && time.startsWith('(') && time.endsWith(')')) {
            time = time.slice(1, -1);
        }
        console.log(`Slot ${slot} time:`, time);

        // 4. Lấy trạng thái điểm danh từ font tag hoặc text trong ngoặc
        let attendanceStatus: string | null = getElementText('font', paragraph) || null;
        if (!attendanceStatus) {
            // Fallback: tìm text trong ngoặc
            const statusMatch = paragraph.innerHTML.match(/\((attended|Not yet|absent)\)/i);
            attendanceStatus = statusMatch ? statusMatch[1] : null;
        }
        if (attendanceStatus) {
            // Normalize status text
            attendanceStatus = attendanceStatus.charAt(0).toUpperCase() + attendanceStatus.slice(1);
        }
        console.log(`Slot ${slot} attendance:`, attendanceStatus);
        
        // 5. Lấy phòng học - từ text sau "at" 
        let room = null;
        const roomMatch = paragraph.innerHTML.match(/at\s+([^<(]+)/i);
        if (roomMatch) {
            room = roomMatch[1].trim().replace(/\s+/g, ' ');
        }
        console.log(`Slot ${slot} room:`, room);

        // 6. Lấy tên giảng viên - hiện tại không có trong dữ liệu mẫu
        const lecturer = null; // Không có thông tin giảng viên trong data này

        const activity: Activity = {
            slot,
            time,
            subjectCode,
            room,
            lecturer,
            attendanceStatus,
            materialsUrl
        };

        console.log("Parsed activity:", activity);
        return activity;
    };

    // --- Bắt đầu quá trình cào dữ liệu ---

    // 1. Lấy thông tin chung của tuần
    const yearElement = document.querySelector('#ctl00_mainContent_drpYear option:checked') as HTMLOptionElement;
    const year = yearElement ? parseInt(yearElement.innerText, 10) : new Date().getFullYear();
    
    const weekSelect = document.querySelector('#ctl00_mainContent_drpSelectWeek option:checked') as HTMLOptionElement;
    if (!weekSelect) {
        console.error("Không tìm thấy thông tin tuần.");
        return null;
    }
    const weekNumber = parseInt(weekSelect.value, 10);
    const weekLabel = weekSelect.innerText.trim();

    console.log("Year:", year, "Week:", weekNumber, "Label:", weekLabel);

    // 2. Lấy day names và dates từ ALL TH ELEMENTS (theo debug analysis)
    const allThs = document.querySelectorAll('th');
    console.log(`Total th elements found: ${allThs.length}`);
    
    // Tìm day names - là các th có text là Mon, Tue, Wed...
    let dayNames: string[] = [];
    let dayDates: string[] = [];
    
    allThs.forEach((th, i) => {
        const text = th.textContent?.trim() || '';
        console.log(`TH[${i}]: "${text}"`);
        
        // Day names
        if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].includes(text)) {
            dayNames.push(text);
        }
        
        // Day dates (format DD/MM)
        if (/^\d{2}\/\d{2}$/.test(text)) {
            dayDates.push(text);
        }
    });

    console.log("Found day names:", dayNames);
    console.log("Found day dates:", dayDates);

    if (dayNames.length === 0 || dayDates.length === 0) {
        console.error("CRITICAL ERROR: Không tìm thấy thông tin ngày/thứ trong tuần.");
        return null;
    }

    // Tạo cấu trúc ban đầu cho các ngày
    const dayNameMapping: { [key: string]: string } = { 
        "Mon": "Monday", 
        "Tue": "Tuesday", 
        "Wed": "Wednesday", 
        "Thu": "Thursday", 
        "Fri": "Friday", 
        "Sat": "Saturday", 
        "Sun": "Sunday" 
    };
    const days: DaySchedule[] = dayNames.map((dayName, index) => ({
        day: dayNameMapping[dayName] || dayName,
        date: dayDates[index] || '',
        activities: [],
    }));

    // 3. Tìm table chứa data - TABLE[2] theo debug có 10 rows
    const allTables = document.querySelectorAll('table');
    console.log(`Found ${allTables.length} tables`);
    
    let scheduleTable: HTMLTableElement | null = null;
    
    // Tìm table có nhiều rows nhất và chứa thead với th
    for (let i = 0; i < allTables.length; i++) {
        const table = allTables[i] as HTMLTableElement;
        const rows = table.querySelectorAll('tr');
        const hasTimeHeaders = table.innerHTML.includes('Mon') && table.innerHTML.includes('Tue');
        
        console.log(`Table[${i}]: ${rows.length} rows, hasTimeHeaders: ${hasTimeHeaders}`);
        
        if (rows.length >= 8 && hasTimeHeaders) { // Ít nhất 8 rows (header + 7 slots)
            scheduleTable = table;
            console.log(`Selected table[${i}] as schedule table`);
            break;
        }
    }

    if (!scheduleTable) {
        console.error("Không tìm thấy bảng lịch học.");
        return null;
    }

    // 4. Parse table rows
    const allRows = scheduleTable.querySelectorAll('tr');
    console.log(`Schedule table has ${allRows.length} rows`);
    
    // Bỏ qua 2 hàng đầu (header)
    const dataRows = Array.from(allRows).slice(2);
    console.log(`Processing ${dataRows.length} data rows`);
    
    dataRows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td');
        console.log(`Row ${rowIndex}: found ${cells.length} cells`);
        
        if (cells.length < 8) {
            console.log(`Row ${rowIndex}: skipping - not enough cells`);
            return;
        }

        // Cell đầu tiên chứa slot number
        const slotText = cells[0].textContent?.trim() || '';
        const slotMatch = slotText.match(/Slot\s+(\d+)/i);
        const slot = slotMatch ? parseInt(slotMatch[1], 10) : rowIndex + 1;
        
        console.log(`Processing row ${rowIndex}, slot ${slot}, slotText: "${slotText}"`);
        
        // 7 cells tiếp theo là 7 ngày trong tuần
        for (let i = 0; i < 7 && i < days.length; i++) {
            const cell = cells[i + 1] as HTMLElement;
            if (cell) {
                console.log(`Day ${i} (${days[i].day}) cell content:`, cell.innerHTML.substring(0, 100));
                const activity = parseActivityCell(cell, slot);
                if (activity) {
                    days[i].activities.push(activity);
                    console.log(`✓ Added activity to day ${i} (${days[i].day}):`, activity);
                }
            }
        }
    });

    // 5. Tạo đối tượng JSON cuối cùng
    const result: FinalScheduleOutput = {
        lastUpdated: new Date().toISOString(),
        schedule: [{
            year,
            weekNumber,
            weekLabel,
            days
        }]
    };

    console.log("Final schedule data:", result);
    return result;
}

// Chạy hàm với delay để đảm bảo trang đã load xong
setTimeout(() => {
    console.log("Starting schedule scraping...");
    const scheduleData = scrapeSchedule();
    if (scheduleData) {
        console.log("Schedule data successfully scraped, sending to background...");
        chrome.runtime.sendMessage({ action: 'scrapedScheduleData', data: scheduleData });
    } else {
        console.error("Failed to scrape schedule data");
    }
}, 2000); // Chờ 2 giây để trang load hoàn toàn 