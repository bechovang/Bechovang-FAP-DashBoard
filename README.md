## Bechovang FAP Dashboard — Web App & Browser Extension

A monorepo containing:
- Web application (Next.js) for visualizing FAP data
- Browser extension (Vite + TypeScript) for scraping data from the FPT Academic Portal (FAP)

---

## Contents
- Project Structure
- Requirements
- Quick Start (Windows PowerShell)
- Web App (Next.js)
- Browser Extension (Vite)
- Workflow: Scrape with Extension → Import into Web App
- Troubleshooting
- Notes

---

## Project Structure
```
Bechovang-FAP-DashBoard/
  exetension/            # Browser extension source (Vite + TS)
  webapp/                # Next.js 15 web app (React 19 + Tailwind 4)
  docs/                  # Planning docs
```

---

## Requirements
- Node.js 20 LTS (recommended) or >= 18.18
- npm 9+ (or your preferred package manager)
- Google Chrome or Microsoft Edge for loading the extension

---

## Quick Start (Windows PowerShell)
- Install and run Web App (dev):
  ```powershell
  cd "webapp"
  npm install
  npm run dev
  # Open http://localhost:3000
  ```
- Build and load Extension:
  ```powershell
  cd "exetension"
  npm install
  npm run build
  # In Chrome/Edge: chrome://extensions → Enable Developer mode → Load unpacked → select exetension/dist
  ```

---

## Web App (Next.js)
- Framework: Next.js 15, React 19, Tailwind CSS 4
- Location: `webapp/`
- Scripts:
  - `npm run dev` — start development server
  - `npm run build` — production build
  - `npm run start` — start production server after build
  - `npm run lint` — lint (disabled during build in config)
- Config highlights:
  - `next.config.mjs`: ignores TypeScript and ESLint errors during build; images unoptimized
- Key routes/pages (app router):
  - `/` Dashboard
  - `/schedule` Weekly schedule
  - `/grades` Grades
  - `/attendance` Attendance
  - `/curriculum` Curriculum
  - `/exams` Exams
  - `/analytics` Analytics
  - `/settings` Settings
  - `/upload` Upload JSON data
  - `/guide` Guide

### Importing Data
- From the extension, you will get JSON files for schedule/grades/attendance/curriculum/…
- Two ways to load data into the app:
  1) Use the in-app uploader: go to `/upload` and drop your JSON files
  2) Place files into `webapp/public/data/` and adjust components to load from there if needed

---

## Browser Extension (Vite)
- Tech: Vite 7 + TypeScript
- Location: `exetension/`
- Scripts:
  - `npm run build` — build extension to `exetension/dist`
  - `npm run dev` — rebuild on file changes (watch)
- Build config: `exetension/vite.config.ts` (copies `manifest.json`, icons, and popup)
- Entry points include content scripts like:
  - `content-scripts/fap-scraper.ts`
  - `content-scripts/fap-curriculum-scraper.ts`
  - `content-scripts/fap-profile-scraper.ts`
  - `content-scripts/html-scraper.ts`
  - `content-scripts/fap-schedule-scraper.ts`
  - `content-scripts/schedule-json-scraper.ts`
  - `content-scripts/grade-json-scraper.ts` (handles Bonus rows)
  - `content-scripts/attendance-json-scraper.ts`

### Load the Extension
1) Build: `npm run build` in `exetension`
2) Chrome/Edge → `chrome://extensions/`
3) Enable Developer mode
4) Load unpacked → choose `exetension/dist`

### Using the Extension
- Log in to `https://fap.fpt.edu.vn`
- Open the extension popup
- Choose scraping tasks (profile, exams, curriculum, schedule, grades, attendance) or universal HTML scrape
- Data is downloaded as JSON files with smart filenames

---

## Workflow: Scrape with Extension → Import into Web App
1) Use the extension to scrape data from FAP
2) Download JSON files (e.g., schedule, grades, attendance, curriculum)
3) Open the web app at `http://localhost:3000`
4) Navigate to `/upload` and drop the JSON files
5) Explore dashboards: `/grades`, `/schedule`, `/attendance`, `/analytics`, etc.

---

## Troubleshooting
- Extension not loading: ensure you selected `exetension/dist` (not `exetension` root)
- Build errors:
  - Use Node 20+ LTS
  - Delete `node_modules` and lockfiles, then reinstall: `npm ci` or `npm install`
- Web app blank UI:
  - Check console errors
  - Ensure JSON structure matches what components expect
  - Try uploading via `/upload`
- Grades Bonus rows:
  - Extension script `grade-json-scraper.ts` handles Bonus rows and separates `<tbody>`/`<tfoot>` parsing

---

## Notes
- No environment variables are required by default
- Data may contain personal information; store and share responsibly
- This repository includes planning docs under `docs/`

---

## Phiên bản Tiếng Việt

### Tổng quan
Monorepo gồm:
- Ứng dụng web (Next.js) để hiển thị dữ liệu FAP
- Tiện ích trình duyệt (Vite + TypeScript) để cào dữ liệu từ FAP

### Cấu trúc
```
Bechovang-FAP-DashBoard/
  exetension/            # Extension trình duyệt
  webapp/                # Ứng dụng web Next.js 15 (React 19 + Tailwind 4)
  docs/                  # Tài liệu kế hoạch
```

### Yêu cầu
- Node.js 20 LTS (khuyến nghị) hoặc >= 18.18
- npm 9+
- Chrome/Edge để nạp extension

### Bắt đầu nhanh (Windows PowerShell)
- Ứng dụng web (dev):
  ```powershell
  cd "webapp"
  npm install
  npm run dev
  # Mở http://localhost:3000
  ```
- Extension:
  ```powershell
  cd "exetension"
  npm install
  npm run build
  # Chrome/Edge: chrome://extensions → Bật Developer mode → Load unpacked → chọn exetension/dist
  ```

### Ứng dụng web (Next.js)
- Thư mục: `webapp/`
- Lệnh:
  - `npm run dev` — chạy dev server
  - `npm run build` — build production
  - `npm run start` — chạy server production sau khi build
- Trang chính:
  - `/` Bảng điều khiển
  - `/schedule`, `/grades`, `/attendance`, `/curriculum`, `/exams`, `/analytics`, `/settings`, `/upload`, `/guide`

#### Nhập dữ liệu
- Sử dụng extension để tải về các file JSON
- Tải lên tại `/upload` hoặc đặt file vào `webapp/public/data/` nếu cần tùy biến

### Extension (Vite)
- Thư mục: `exetension/`
- Lệnh:
  - `npm run build` — build ra `exetension/dist`
  - `npm run dev` — build watch
- Cách nạp extension:
  1) Build
  2) Mở `chrome://extensions/`
  3) Bật Developer mode
  4) Load unpacked → chọn `exetension/dist`
- Sử dụng:
  - Đăng nhập `https://fap.fpt.edu.vn`
  - Mở popup → chọn chức năng cào JSON/HTML
  - Tự động tải về file JSON

### Quy trình làm việc
1) Cào dữ liệu bằng extension
2) Tải JSON về máy
3) Mở web app tại `http://localhost:3000`
4) Vào `/upload` để tải JSON lên
5) Xem dữ liệu ở các trang `/grades`, `/schedule`, `/attendance`, `/analytics`, …

### Khắc phục sự cố
- Không nạp được extension: chắc chắn đã chọn đúng thư mục `exetension/dist`
- Lỗi build: dùng Node 20+, xoá `node_modules` + file lock rồi cài lại
- Web app trắng: kiểm tra console, đảm bảo cấu trúc JSON đúng, thử tải lên qua `/upload`
- Điểm Bonus: script `grade-json-scraper.ts` đã xử lý Bonus và tách parse `<tbody>`/`<tfoot>`

### Lưu ý
- Không yêu cầu biến môi trường mặc định
- Cẩn trọng với dữ liệu cá nhân
- Tài liệu trong thư mục `docs/` 