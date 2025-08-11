// Hàm chính để cào dữ liệu từ trang lịch thi
function scrapeExamSchedule() {
    console.log("FAP Scraper: Bắt đầu cào Lịch thi.");
    
    const examData: any[] = [];
    
    // Tìm bảng chứa dữ liệu. Dựa vào HTML, bảng này không có id/class cụ thể
    // nên ta sẽ tìm nó dựa vào cấu trúc. 
    // Giả sử nó là bảng đầu tiên trong div có id `ctl00_mainContent_divContent`
    const table = document.querySelector("#ctl00_mainContent_divContent table");

    if (!table) {
        console.error("FAP Scraper: Không tìm thấy bảng lịch thi.");
        return [];
    }

    // Lấy tất cả các hàng trong thân bảng (tbody tr)
    // Bỏ qua hàng đầu tiên (là header) bằng slice(1)
    const rows = Array.from(table.querySelectorAll('tr')).slice(1);

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 8) { // Đảm bảo hàng có đủ cột
            const exam = {
                no: cells[0].textContent?.trim(),
                subjectCode: cells[1].textContent?.trim(),
                subjectName: cells[2].textContent?.trim(),
                date: cells[3].textContent?.trim(),
                room: cells[4].textContent?.trim(),
                time: cells[5].textContent?.trim(),
                examForm: cells[6].textContent?.trim(),
                examType: cells[7].textContent?.trim(),
                publicationDate: cells[8]?.textContent?.trim() || 'N/A'
            };
            examData.push(exam);
        }
    });
    
    console.log("FAP Scraper: Cào xong Lịch thi.", examData);
    return examData;
}

// Chạy hàm cào và gửi dữ liệu về background script
const data = scrapeExamSchedule();
chrome.runtime.sendMessage({ action: 'scrapedData', data: data });