// File: src/content-scripts/fap-curriculum-scraper.ts

interface Subject {
    termNo: number;
    subjectCode: string;
    subjectName: string;
}

interface CurriculumData {
    lastUpdated: string;
    programCode: string;
    subjects: Subject[];
}

// Hàm chính để cào dữ liệu từ trang chương trình học
function scrapeCurriculumData(): CurriculumData {
    console.log("FAP Curriculum Scraper: Bắt đầu cào dữ liệu chương trình học.");
    
    // Lấy mã chương trình học từ text hiển thị trên trang
    // Tìm text chứa pattern như "Student Nguyễn Ngọc Phúc(SE203055) - BIT_SE_20B"
    let programCode = 'UNKNOWN';
    const pageText = document.body.innerText;
    const programCodeMatch = pageText.match(/Student\s+[^-]+-\s*([A-Z0-9_]+)/);
    if (programCodeMatch) {
        programCode = programCodeMatch[1];
    }
    
    console.log("Mã chương trình học:", programCode);

    const subjectsList: Subject[] = [];
    
    // Tìm tất cả các table rows trên trang
    const rows = document.querySelectorAll('tr');
    console.log("Tổng số hàng tr tìm thấy:", rows.length);

    rows.forEach((row, index) => {
        const cols = row.querySelectorAll('td');
        
        // Debug: in ra nội dung của từng hàng có đủ 4 cột
        if (cols.length === 4) {
            const col0 = cols[0].innerText.trim();
            const col1 = cols[1].innerText.trim(); 
            const col2 = cols[2].innerText.trim();
            const col3 = cols[3].innerText.trim();
            
            console.log(`Hàng ${index}: [${col0}] [${col1}] [${col2}] [${col3}]`);
            
            // Kiểm tra xem đây có phải là hàng dữ liệu môn học không
            // Cột 0: STT (phải là số)
            // Cột 1: Mã môn (pattern như PRF192, MAE101, etc.)
            // Cột 2: Tên môn
            // Cột 3: Học kỳ (số hoặc -1)
            
            const sttNum = parseInt(col0, 10);
            const isValidSTT = !isNaN(sttNum) && sttNum > 0;
            const isValidSubjectCode = /^[A-Z]{2,4}\d{3}[a-z]?$/.test(col1); // Pattern như PRF192, CEA201, SSL101c
            const isValidTermNo = /^-?\d+$/.test(col3); // Số nguyên (có thể âm)
            
            if (isValidSTT && isValidSubjectCode && col2.length > 0 && isValidTermNo) {
                const termNo = parseInt(col3, 10);
                
                const subject: Subject = {
                    termNo: termNo,
                    subjectCode: col1,
                    subjectName: col2,
                };
                
                subjectsList.push(subject);
                console.log(`✓ Môn học hợp lệ ${subjectsList.length}: ${subject.subjectCode} - ${subject.subjectName} (Kỳ ${subject.termNo})`);
            } else {
                console.log(`✗ Bỏ qua hàng: STT=${isValidSTT}, Code=${isValidSubjectCode}, Term=${isValidTermNo}`);
            }
        }
    });

    const finalData: CurriculumData = {
        lastUpdated: new Date().toISOString(),
        programCode,
        subjects: subjectsList,
    };
    
    console.log(`FAP Curriculum Scraper: Cào xong ${subjectsList.length} môn học.`, finalData);
    return finalData;
}

// Chạy hàm cào và gửi dữ liệu về background script
const curriculumData = scrapeCurriculumData();
chrome.runtime.sendMessage({ action: 'scrapedCurriculumData', data: curriculumData }); 