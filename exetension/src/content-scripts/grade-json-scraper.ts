// Grade JSON Scraper for FAP Course Pages
// Cào dữ liệu điểm từ trang môn học và chuyển thành JSON (Phiên bản đã sửa lỗi và cải tiến)

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

function cleanText(text: string | null | undefined): string {
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
        // Cải tiến regex để xử lý các trường hợp tên môn phức tạp hơn
        const courseText = cleanText(courseElement.textContent);
        const match = courseText.match(/^(.*?)\(([^)]+)\)\s*\(.+\)$/);
        if (match) {
            subjectName = match[1].trim();
            subjectCode = match[2].trim();
        } else {
            // Fallback cho trường hợp regex không khớp
            const simpleMatch = courseText.match(/^(.*?)\s*\(([^)]+)\)$/);
            if (simpleMatch) {
                subjectName = simpleMatch[1].trim();
                subjectCode = simpleMatch[2].trim();
            } else {
                subjectName = courseText;
            }
        }
    }
    
    // Tìm bảng điểm
    const gradeTable = document.querySelector('#ctl00_mainContent_divGrade table');
    if (!gradeTable) {
        throw new Error('Không tìm thấy bảng điểm');
    }
    
    const courseData: CourseGrade = {
        subjectCode: subjectCode,
        subjectName: subjectName,
        average: null,
        status: null,
        gradeDetails: []
    };

    // Xử lý <tbody> để lấy các đầu điểm
    const tableBody = gradeTable.querySelector('tbody');
    if (tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        let currentCategory = '';

        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;

            const firstCell = cells[0];
            const secondCell = cells[1];

            // 1) Dòng category mới (có rowspan)
            if (firstCell.hasAttribute('rowspan')) {
                currentCategory = cleanText(firstCell.textContent);
                if (cells.length >= 4) {
                    const itemName = cleanText(cells[1].textContent);
                    const weightText = cleanText(cells[2].textContent).replace('%', '').trim();
                    const valueText = cleanText(cells[3].textContent);

                    courseData.gradeDetails.push({
                        category: currentCategory,
                        item: itemName,
                        weight: weightText ? parseFloat(weightText) : null,
                        value: valueText ? parseFloat(valueText) : null
                    });
                }
            }
            // 2) Dòng Bonus đặc biệt: ô đầu trống, ô thứ hai là 'Bonus'
            else if (cleanText(firstCell.textContent) === '' && cleanText(secondCell.textContent) === 'Bonus') {
                if (cells.length >= 4) {
                    const valueText = cleanText(cells[3].textContent);
                    courseData.gradeDetails.push({
                        category: 'Bonus',
                        item: 'Bonus',
                        weight: null,
                        value: valueText ? parseFloat(valueText) : null
                    });
                }
            }
            // 3) Dòng điểm thông thường
            else {
                const itemName = cleanText(firstCell.textContent);
                if (itemName.includes('Total')) {
                    continue; // Bỏ qua dòng Total của từng category
                }

                // Fallback: một số trang có thể để Average/Status trong tbody
                if (itemName.includes('Average')) {
                    const avgText = cleanText(cells[1]?.textContent);
                    courseData.average = avgText ? parseFloat(avgText) : null;
                    continue;
                }
                if (itemName.includes('Status')) {
                    const statusElement = cells[1]?.querySelector('font');
                    courseData.status = statusElement ? cleanText(statusElement.textContent) : cleanText(cells[1]?.textContent);
                    continue;
                }

                if (cells.length >= 3) {
                    const weightText = cleanText(cells[1].textContent).replace('%', '').trim();
                    const valueText = cleanText(cells[2].textContent);

                    courseData.gradeDetails.push({
                        category: currentCategory,
                        item: itemName,
                        weight: weightText ? parseFloat(weightText) : null,
                        value: valueText ? parseFloat(valueText) : null
                    });
                }
            }
        }
    }

    // Xử lý <tfoot> để lấy điểm tổng kết và trạng thái
    const tableFooter = gradeTable.querySelector('tfoot');
    if (tableFooter) {
        const rows = tableFooter.querySelectorAll('tr');
        for (const row of rows) {
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) continue;

            const label = cleanText(cells[0].textContent);
            const valueCell = cells[1];

            if (label.includes('Average')) {
                const averageText = cleanText(valueCell.textContent);
                courseData.average = averageText ? parseFloat(averageText) : null;
            } else if (label.includes('Status')) {
                const statusElement = valueCell.querySelector('font');
                courseData.status = statusElement ? cleanText(statusElement.textContent) : cleanText(valueCell.textContent);
            }
        }
    }

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
    const safeSubjectCode = scrapedData.semesters[0]?.courses[0]?.subjectCode.replace(/[^a-zA-Z0-9]/g, '') || 'unknown';
    const fileName = `fap-grade-${safeSubjectCode}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    
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