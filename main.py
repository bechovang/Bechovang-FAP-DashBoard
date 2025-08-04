# scraper.py

import json
import time
import configparser
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

# --- CÁC HẰNG SỐ VÀ URL ---

BASE_URL = "https://fap.fpt.edu.vn/"
LOGIN_URL = BASE_URL + "Default.aspx"
HOME_PAGE_URL = BASE_URL + "Student.aspx"
SCHEDULE_URL = BASE_URL + "Report/ScheduleOfWeek.aspx"
EXAM_SCHEDULE_URL = BASE_URL + "Exam/ScheduleExams.aspx"
MARK_REPORT_URL = BASE_URL + "Grade/StudentGrade.aspx"
ATTENDANCE_URL = BASE_URL + "Report/ViewAttendstudent.aspx"


# --- CÁC HÀM TIỆN ÍCH ---

def save_to_json(data, filename):
    """Lưu dữ liệu vào file JSON với định dạng đẹp."""
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"✅ Đã lưu dữ liệu thành công vào file: {filename}")
    except Exception as e:
        print(f"❌ Lỗi khi lưu file {filename}: {e}")

def get_config():
    """Đọc thông tin cấu hình từ file config.ini."""
    config = configparser.ConfigParser()
    config.read('config.ini')
    return config['FAP_CREDENTIALS']


# --- CÁC HÀM CÀO DỮ LIỆU ---

def login(driver, username, password, campus_name):
    """Thực hiện quá trình đăng nhập vào FAP."""
    print("🚀 Bắt đầu quá trình đăng nhập...")
    try:
        driver.get(LOGIN_URL)
        time.sleep(2)

        # Chọn campus
        campus_dropdown = Select(driver.find_element(By.ID, "ctl00_mainContent_ddlCampus"))
        campus_dropdown.select_by_visible_text(campus_name)
        time.sleep(1)

        # Nhấn nút Login with FeID
        driver.find_element(By.ID, "ctl00_mainContent_btnloginFeId").click()
        time.sleep(4) # Chờ trang SSO chuyển hướng

        # Điền thông tin đăng nhập trên trang SSO
        print("🔑 Đang ở trang SSO, tiến hành nhập thông tin...")
        driver.find_element(By.ID, "Username").send_keys(username)
        driver.find_element(By.ID, "Password").send_keys(password)
        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(5) # Chờ đăng nhập và chuyển hướng về trang chủ

        # Kiểm tra đăng nhập thành công
        if "Student.aspx" in driver.current_url:
            print("✅ Đăng nhập thành công!")
            return True
        else:
            print("❌ Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.")
            return False
    except Exception as e:
        print(f"❌ Lỗi trong quá trình đăng nhập: {e}")
        return False

def scrape_profile(driver):
    """Cào thông tin cơ bản của sinh viên."""
    print("👤 Đang cào thông tin cá nhân (profile)...")
    driver.get(HOME_PAGE_URL)
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, 'html.parser')

    profile_data = {
        "lastUpdated": datetime.now().isoformat()
    }
    try:
        # Lấy email và campus từ header
        email_span = soup.find("span", {"id": "ctl00_lblLogIn"})
        campus_span = soup.find("span", {"id": "ctl00_lblCampusName"})
        
        # Trích xuất và làm sạch dữ liệu
        email_full = email_span.get_text(strip=True) if email_span else "Không tìm thấy"
        # Tách tên và mã SV từ email
        profile_data['email'] = email_full
        if '(' in email_full and ')' in email_full:
            parts = email_full.split('(')
            profile_data['fullName'] = parts[0].strip()
            profile_data['studentId'] = parts[1].replace(')', '').strip()
        else: # Fallback nếu không có định dạng mong muốn
             profile_data['fullName'] = "Không tìm thấy"
             profile_data['studentId'] = "Không tìm thấy"

        profile_data['campus'] = campus_span.get_text(strip=True).replace('CAMPUS: ', '') if campus_span else "Không tìm thấy"

    except Exception as e:
        print(f"❌ Lỗi khi cào thông tin profile: {e}")

    return profile_data


def scrape_exam_schedule(driver):
    """Cào dữ liệu lịch thi."""
    print("📅 Đang cào lịch thi...")
    driver.get(EXAM_SCHEDULE_URL)
    time.sleep(2)
    soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    exam_data = {
        "lastUpdated": datetime.now().isoformat(),
        "exams": []
    }
    
    try:
        table = soup.find("div", {"id": "ctl00_mainContent_divContent"}).find("table")
        if not table:
            return exam_data

        rows = table.find_all("tr")[1:] # Bỏ qua hàng header
        for row in rows:
            cols = row.find_all("td")
            if len(cols) >= 9:
                exam = {
                    "subjectCode": cols[1].get_text(strip=True),
                    "subjectName": cols[2].get_text(strip=True),
                    "date": cols[3].get_text(strip=True),
                    "room": cols[4].get_text(strip=True) or None,
                    "time": cols[5].get_text(strip=True),
                    "type": cols[7].get_text(strip=True),
                    "format": cols[6].get_text(strip=True),
                    "publicationDate": cols[8].get_text(strip=True)
                }
                exam_data["exams"].append(exam)
    except Exception as e:
        print(f"❌ Lỗi khi cào lịch thi: {e}")

    return exam_data

def scrape_grades_and_attendance(driver):
    """Cào điểm và điểm danh của tất cả các kỳ."""
    print("📊 Đang cào điểm và điểm danh...")
    
    # --- Cào điểm ---
    driver.get(MARK_REPORT_URL)
    time.sleep(2)
    grades_soup = BeautifulSoup(driver.page_source, 'html.parser')
    
    grades_data = {"semesters": []}
    
    try:
        term_links = grades_soup.select("#ctl00_mainContent_divTerm a")
        for term_link in term_links:
            term_name = term_link.get_text(strip=True)
            term_url = BASE_URL + "Grade/" + term_link['href']
            print(f"  -> Đang xử lý kỳ: {term_name}")
            
            semester_obj = {"term": term_name, "courses": []}
            
            driver.get(term_url)
            time.sleep(2)
            term_soup = BeautifulSoup(driver.page_source, 'html.parser')
            
            course_links = term_soup.select("#ctl00_mainContent_divCourse a")
            for course_link in course_links:
                course_name_full = course_link.get_text(strip=True)
                course_url = BASE_URL + "Grade/" + course_link['href']
                
                # Trích xuất mã môn
                subject_code = course_name_full.split('(')[1].split(')')[0]
                
                driver.get(course_url)
                time.sleep(2)
                course_soup = BeautifulSoup(driver.page_source, 'html.parser')
                
                course_obj = {
                    "subjectCode": subject_code,
                    "subjectName": course_name_full.split('(')[0].strip(),
                    "gradeDetails": []
                }
                
                grade_table = course_soup.select_one("#ctl00_mainContent_divGrade table")
                if grade_table:
                    rows = grade_table.find_all("tr")[1:] # Bỏ header
                    current_category = ""
                    for row in rows:
                        cols = row.find_all("td")
                        # Xác định category
                        if cols[0].has_attr('rowspan'):
                            current_category = cols[0].get_text(strip=True)
                            item_col_index = 1
                        else:
                            item_col_index = 0

                        # Xử lý các dòng tổng kết và trạng thái
                        if "Course total" in current_category:
                            if "Average" in cols[item_col_index].get_text(strip=True):
                                course_obj["average"] = float(cols[item_col_index + 2].get_text(strip=True))
                            elif "Status" in cols[item_col_index].get_text(strip=True):
                                course_obj["status"] = cols[item_col_index + 2].get_text(strip=True)
                            continue

                        # Xử lý các dòng điểm thành phần
                        if len(cols) > (item_col_index + 2):
                             # Chuyển đổi weight và value thành số, xử lý lỗi
                            try:
                                weight_val = float(cols[item_col_index + 1].get_text(strip=True).replace('%', ''))
                            except (ValueError, IndexError):
                                weight_val = None
                            
                            try:
                                value_val = float(cols[item_col_index + 2].get_text(strip=True))
                            except (ValueError, IndexError):
                                value_val = None

                            grade_item = {
                                "category": current_category,
                                "item": cols[item_col_index].get_text(strip=True),
                                "weight": weight_val,
                                "value": value_val
                            }
                            course_obj["gradeDetails"].append(grade_item)

                semester_obj["courses"].append(course_obj)
            grades_data["semesters"].append(semester_obj)

    except Exception as e:
        print(f"❌ Lỗi khi cào điểm: {e}")
    
    # --- Cào điểm danh ---
    # (Bạn có thể tích hợp logic cào điểm danh tương tự vào vòng lặp ở trên
    # để tránh lặp lại việc duyệt qua các kỳ và môn học)
    # Vì mục đích minh họa, phần này được tách riêng
    print("📋 Hiện tại, script này tập trung cào điểm. Phần điểm danh có thể được thêm vào sau.")

    return grades_data

# --- HÀM CHÍNH ---

def main():
    """Hàm chính điều khiển toàn bộ quá trình."""
    config = get_config()
    username = config.get('USERNAME')
    password = config.get('PASSWORD')
    campus_name = config.get('CAMPUS')

    if "your_feid_username_here" in username:
        print("❌ Vui lòng cập nhật thông tin đăng nhập trong file `config.ini` trước khi chạy.")
        return

    # Khởi tạo Selenium WebDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service)
    driver.implicitly_wait(10) # Chờ tối đa 10s để tìm element

    if login(driver, username, password, campus_name):
        # Tạo một dictionary để lưu tất cả dữ liệu
        all_data = {}
        
        # Cào dữ liệu
        all_data['profile'] = scrape_profile(driver)
        all_data['exam_schedule'] = scrape_exam_schedule(driver)
        # Hàm scrape_grades_and_attendance đã phức tạp, sẽ chạy riêng
        grades_data = scrape_grades_and_attendance(driver)

        # Lưu file JSON
        save_to_json(all_data['profile'], 'profile.json')
        save_to_json(all_data['exam_schedule'], 'exam_schedule.json')
        save_to_json(grades_data, 'grades.json')
        
        # Các hàm cào dữ liệu khác có thể được gọi ở đây
        # save_to_json(scrape_schedule(driver), 'schedule.json')
        # ...
        
        print("\n🎉 Hoàn thành! Tất cả các file JSON đã được tạo.")
    else:
        print("Không thể tiếp tục vì đăng nhập không thành công.")
        
    driver.quit()

if __name__ == "__main__":
    main()