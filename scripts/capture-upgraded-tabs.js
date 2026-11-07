const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.resolve(__dirname, '../artifacts/living-erp-experience/screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function capture() {
  console.log('Capturing upgraded views...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });

  // 1. Dashboard with Quick Operations
  console.log('1. Dashboard with Quick Operations...');
  await page.goto('http://127.0.0.1:5173/demo?tab=dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '20_dashboard_quick_operations_10_10.png') });

  // 2. Weekly Timetable
  console.log('2. Weekly Timetable...');
  await page.goto('http://127.0.0.1:5173/demo?tab=timetable', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '21_weekly_timetable_10_10.png') });

  // 3. Faculty Staff Directory
  console.log('3. Faculty Staff Directory...');
  await page.goto('http://127.0.0.1:5173/demo?tab=staff', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '22_faculty_staff_directory_10_10.png') });

  // 4. Students SIS Directory
  console.log('4. Students SIS Directory...');
  await page.goto('http://127.0.0.1:5173/demo?tab=students', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUT_DIR, '23_students_sis_directory_10_10.png') });

  console.log('All 4 upgraded tab screenshots successfully captured!');
  await browser.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});

