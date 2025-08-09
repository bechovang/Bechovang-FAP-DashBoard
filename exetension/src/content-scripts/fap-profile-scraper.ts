// File: src/content-scripts/fap-profile-scraper.ts

interface StudentProfile {
    studentId: string;
    fullName: string;
    email: string;
    campus: string;
    curriculumCode: string;
    lastUpdated: string;
}

// Hàm chính để cào dữ liệu từ trang profile
function scrapeProfileData(): StudentProfile {
    console.log("FAP Profile Scraper: Bắt đầu cào dữ liệu profile.");
    
    // Hàm helper để lấy text từ element bằng ID
    function getTextById(id: string): string {
        const element = document.querySelector(`#${id}`);
        if (element) {
            // Xử lý trường hợp email có protection
            const emailProtected = element.querySelector('.cf_email, .__cf_email__');
            if (emailProtected) {
                // Thử decode email nếu có thể
                const dataEmail = emailProtected.getAttribute('data-cfemail');
                if (dataEmail) {
                    return decodeCloudflareEmail(dataEmail);
                }
            }
            return element.textContent?.trim() || '';
        }
        return '';
    }
    
    // Hàm decode email từ Cloudflare protection
    function decodeCloudflareEmail(encodedString: string): string {
        try {
            let email = '';
            const key = parseInt(encodedString.substr(0, 2), 16);
            for (let i = 2; i < encodedString.length; i += 2) {
                const charCode = parseInt(encodedString.substr(i, 2), 16) ^ key;
                email += String.fromCharCode(charCode);
            }
            return email;
        } catch (e) {
            console.log("Không thể decode email:", e);
            return '';
        }
    }
    
    // Lấy thông tin cơ bản
    const fullName = getTextById('ctl00_mainContent_lblFullname');
    const rollNumber = getTextById('ctl00_mainContent_lblRollNumber');
    const email = getTextById('ctl00_mainContent_lblEmail');
    const major = getTextById('ctl00_mainContent_lblMajor');
    
    // Lấy campus từ text trên trang (có thể ở header hoặc footer)
    let campus = 'FPTU-Unknown';
    const pageText = document.body.innerText;
    const campusMatch = pageText.match(/CAMPUS:\s*([^|\n]+)/i) || pageText.match(/FPTU[^|\n]*/i);
    if (campusMatch) {
        campus = campusMatch[1]?.trim() || campusMatch[0]?.trim() || campus;
    }
    
    // Tạo curriculum code từ major và pattern
    let curriculumCode = 'UNKNOWN';
    if (major) {
        // Thử tìm pattern curriculum trong text trang
        const curriculumMatch = pageText.match(new RegExp(`${major}_[A-Z0-9_]+`, 'i'));
        if (curriculumMatch) {
            curriculumCode = curriculumMatch[0];
        } else {
            // Fallback: tạo từ major + _SE_20B (hoặc pattern phổ biến)
            curriculumCode = `${major}_SE_20B`;
        }
    }
    
    // Tạo object profile chỉ với các thông tin cần thiết
    const profile: StudentProfile = {
        studentId: rollNumber || 'UNKNOWN',
        fullName: fullName || 'Unknown Student',
        email: email || `${rollNumber}@fpt.edu.vn`, // Fallback email
        campus: campus,
        curriculumCode: curriculumCode,
        lastUpdated: new Date().toISOString()
    };
    
    console.log("FAP Profile Scraper: Cào xong dữ liệu profile.", profile);
    return profile;
}

// Chạy hàm cào và gửi dữ liệu về background script
const profileData = scrapeProfileData();
chrome.runtime.sendMessage({ action: 'scrapedProfileData', data: profileData }); 