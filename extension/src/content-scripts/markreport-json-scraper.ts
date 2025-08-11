// Mark Report JSON Scraper (Simplified)
// Extract minimal structure to integrate with combined workflow

interface MarkReportItem {
  category: string;
  item: string;
  weight: number | null;
  value: number | null;
}

interface MarkReportCourse {
  subjectCode: string;
  subjectName: string;
  items: MarkReportItem[];
}

interface MarkReportSemester {
  term: string;
  courses: MarkReportCourse[];
}

interface MarkReportJSON {
  lastUpdated: string;
  semesters: MarkReportSemester[];
}

function txt(n: Node | null): string { return (n?.textContent || '').trim(); }

function scrapeMarkReport(): MarkReportJSON {
  const lastUpdated = new Date().toISOString();
  const term = txt(document.querySelector('#ctl00_mainContent_divTerm b')) || 'Unknown';

  // Course info e.g. Name(Code)
  const courseB = document.querySelector('#ctl00_mainContent_divCourse b');
  let subjectName = '', subjectCode = '';
  if (courseB) {
    const t = txt(courseB);
    const m = t.match(/(.+?)\((.+?)\)/);
    if (m) { subjectName = m[1].trim(); subjectCode = m[2].trim(); } else { subjectName = t; }
  }

  // Try to find a table with mark items (heuristic)
  const table = document.querySelector('#ctl00_mainContent_divContent table, .table.table-bordered');
  const items: MarkReportItem[] = [];
  if (table) {
    const rows = table.querySelectorAll('tr');
    let currentCategory = '';
    rows.forEach((row, idx) => {
      const cells = row.querySelectorAll('td,th');
      if (cells.length >= 3) {
        const c0 = txt(cells[0]);
        const c1 = txt(cells[1]);
        const c2 = txt(cells[2]);
        const c3 = txt(cells[3] || null);
        // If header-like row define category
        if (cells[0].tagName.toLowerCase() === 'th' || /group|category|component/i.test(c0)) {
          currentCategory = c0 || currentCategory;
        } else {
          // Parse weight/value heuristically
          let weight: number | null = null;
          let value: number | null = null;
          const weightTxt = (c2.includes('%') ? c2 : c1).replace('%', '').trim();
          const valTxt = c3 || c2;
          if (/^\d+(\.\d+)?$/.test(weightTxt)) weight = parseFloat(weightTxt);
          if (/^\d+(\.\d+)?$/.test(valTxt)) value = parseFloat(valTxt);
          items.push({ category: currentCategory || 'General', item: c0 || c1, weight, value });
        }
      }
    });
  }

  const result: MarkReportJSON = {
    lastUpdated,
    semesters: [{ term, courses: [{ subjectCode, subjectName, items }] }]
  };
  return result;
}

try {
  const data = scrapeMarkReport();
  const fileName = `fap-markreport-${data.semesters[0].courses[0].subjectCode}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  chrome.runtime.sendMessage({
    action: 'scrapedMarkReportJSON',
    data: {
      content: JSON.stringify(data, null, 2),
      fileName,
      markReportData: data
    }
  });
} catch (e) {
  chrome.runtime.sendMessage({ action: 'attendanceJSONScrapingError', error: (e as Error).message });
} 