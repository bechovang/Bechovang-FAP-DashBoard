// Grade JSON Scraper for FAP Course Pages
// Cào dữ liệu điểm từ trang môn học và chuyển thành JSON

interface GradeDetail {
    category: string;
    item: string;
    weight: number | null;
    value: number | null;
}

interface CourseGrade {
    subjectCode: string;
    subjectName: string;
    average: number | null;
    status: string | null;
    gradeDetails: GradeDetail[];
}

interface SemesterGrade {
    term: string;
    courses: CourseGrade[];
}

interface GradeJSONResult {
    lastUpdated: string;
    semesters: SemesterGrade[];
}

function cleanText(text: string | null): string {
    return text ? text.trim() : "";
}

function parseGradeToJSON(): GradeJSONResult {
    const lastUpdated = new Date().toISOString();
    
    // Lấy thông tin kỳ học hiện tại
    const termElement = document.querySelector('#ctl00_mainContent_divTerm b');
    const currentTerm = termElement ? cleanText(termElement.textContent) : 'Unknown';
    
    // Lấy thông tin môn học hiện tại
    const courseElement = document.querySelector('#ctl00_mainContent_divCourse b');
    let subjectCode = '';
    let subjectName = '';
    
    if (courseElement) {
        const courseText = cleanText(courseElement.textContent);
        const match = courseText.match(/^(.*?)\s*\(([^)]+)\)$/);
        if (match) {
            subjectName = match[1].trim();
            subjectCode = match[2].trim();
        } else {
            subjectName = courseText;
        }
    }
    
    // Tìm bảng điểm
    const gradeTable = document.querySelector('#ctl00_mainContent_divGrade table');
    if (!gradeTable) {
        throw new Error('Không tìm thấy bảng điểm');
    }
    
    // Khởi tạo dữ liệu môn học
    const courseData: CourseGrade = {
        subjectCode: subjectCode,
        subjectName: subjectName,
        average: null,
        status: null,
        gradeDetails: []
    };
    
    // Lấy tất cả các hàng trong bảng điểm
    const rows = gradeTable.querySelectorAll('tr');
    let currentCategory = '';
    
    // Duyệt qua từng hàng (bỏ qua header)
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cells = row.querySelectorAll('td');
        
        if (cells.length === 0) continue;
        
        // Kiểm tra xem đây có phải là dòng category mới không
        const firstCell = cells[0];
        if (firstCell.hasAttribute('rowspan')) {
            // Đây là dòng category mới
            currentCategory = cleanText(firstCell.textContent);
            if (cells.length >= 4) {
                const itemName = cleanText(cells[1].textContent);
                const weightText = cleanText(cells[2].textContent).replace('%', '').trim();
                const valueText = cleanText(cells[3].textContent);
                
                const weight = weightText ? parseFloat(weightText) : null;
                const value = valueText ? parseFloat(valueText) : null;
                
                courseData.gradeDetails.push({
                    category: currentCategory,
                    item: itemName,
                    weight: weight,
                    value: value
                });
            }
        } else {
            // Đây là dòng điểm thuộc category cũ
            const itemName = cleanText(cells[0].textContent);
            
            // Xử lý các trường hợp đặc biệt
            if (itemName.includes('Total')) {
                continue; // Bỏ qua dòng Total
            }
            
            if (itemName.includes('Average')) {
                const averageText = cleanText(cells[1].textContent);
                courseData.average = averageText ? parseFloat(averageText) : null;
                continue;
            }
            
            if (itemName.includes('Status')) {
                const statusElement = cells[1].querySelector('font');
                courseData.status = statusElement ? cleanText(statusElement.textContent) : cleanText(cells[1].textContent);
                continue;
            }
            
            // Xử lý dòng điểm thông thường
            if (cells.length >= 3) {
                const weightText = cleanText(cells[1].textContent).replace('%', '').trim();
                const valueText = cleanText(cells[2].textContent);
                
                const weight = weightText ? parseFloat(weightText) : null;
                const value = valueText ? parseFloat(valueText) : null;
                
                courseData.gradeDetails.push({
                    category: currentCategory,
                    item: itemName,
                    weight: weight,
                    value: value
                });
            }
        }
    }
    
    // Tạo cấu trúc kết quả
    const semesterData: SemesterGrade = {
        term: currentTerm,
        courses: [courseData]
    };
    
    const result: GradeJSONResult = {
        lastUpdated: lastUpdated,
        semesters: [semesterData]
    };
    
    console.log('Grade JSON Scraper: Đã cào dữ liệu điểm thành công', result);
    return result;
}

// Chạy hàm cào và gửi dữ liệu về background script
try {
    const scrapedData = parseGradeToJSON();
    const fileName = `fap-grade-${scrapedData.semesters[0].courses[0].subjectCode}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
    // Gửi dữ liệu về background script để xử lý download
    chrome.runtime.sendMessage({
        action: 'scrapedGradeJSON',
        data: {
            content: JSON.stringify(scrapedData, null, 2),
            fileName: fileName,
            gradeData: scrapedData
        }
    });
} catch (error) {
    console.error('Grade JSON Scraper: Lỗi khi cào dữ liệu', error);
    chrome.runtime.sendMessage({
        action: 'gradeJSONScrapingError',
        error: error instanceof Error ? error.message : 'Unknown error'
    });
} 