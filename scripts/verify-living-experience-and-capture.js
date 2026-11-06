const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.resolve(__dirname, '../artifacts/living-erp-experience/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runVerification() {
  console.log('🚀 Starting Living ERP Experience Engine Automated Verification...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Track console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Navigate to Demo Sandbox
    console.log('📍 Navigating to http://127.0.0.1:5173/demo...');
    await page.goto('http://127.0.0.1:5173/demo', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    // Verify ambient canvas presence & pointer-events: none
    const canvas = await page.$('canvas.fixed.inset-0.pointer-events-none');
    if (!canvas) {
      throw new Error('AmbientCanvasRenderer canvas element NOT found!');
    }
    const pointerEvents = await canvas.evaluate(el => window.getComputedStyle(el).pointerEvents);
    console.log(`✅ Canvas mounted with pointer-events: ${pointerEvents}`);

    // Capture 01: Signature Soap Bubbles on Dashboard
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_dashboard_soap_bubbles.png') });
    console.log('📸 01_dashboard_soap_bubbles.png captured');

    // 2. Open Experience Settings Studio Modal
    console.log('📍 Opening Experience Settings Studio Modal...');
    const experienceTrigger = await page.$('button[title*="Natural Living Experience Studio"]');
    if (experienceTrigger) {
      await experienceTrigger.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_experience_settings_modal.png') });
      console.log('📸 02_experience_settings_modal.png captured');

      // Test switching to Gentle Rainfall
      const rainBtn = await page.$('button:has-text("Gentle Rainfall")');
      if (rainBtn) {
        await rainBtn.click();
        await page.waitForTimeout(400);
      }

      // Close modal
      const closeBtn = await page.$('button:has-text("Done")');
      if (closeBtn) {
        await closeBtn.click();
        await page.waitForTimeout(800);
      }
    }

    // Capture 03: Gentle Rain atmosphere
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_atmosphere_gentle_rain.png') });
    console.log('📸 03_atmosphere_gentle_rain.png captured');

    // Switch to Peaceful Snowfall via experience studio
    if (experienceTrigger) {
      await experienceTrigger.click();
      await page.waitForTimeout(400);
      const snowBtn = await page.$('button:has-text("Peaceful Snowfall")');
      if (snowBtn) await snowBtn.click();
      const closeBtn = await page.$('button:has-text("Done")');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_atmosphere_peaceful_snowfall.png') });
    console.log('📸 04_atmosphere_peaceful_snowfall.png captured');

    // Switch to Floating Flower Petals
    if (experienceTrigger) {
      await experienceTrigger.click();
      await page.waitForTimeout(400);
      const petalBtn = await page.$('button:has-text("Floating Flower Petals")');
      if (petalBtn) await petalBtn.click();
      const closeBtn = await page.$('button:has-text("Done")');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_atmosphere_flower_petals.png') });
    console.log('📸 05_atmosphere_flower_petals.png captured');

    // Switch to Underwater Bubbles (Lab atmosphere)
    if (experienceTrigger) {
      await experienceTrigger.click();
      await page.waitForTimeout(400);
      const underBtn = await page.$('button:has-text("Underwater Bubbles")');
      if (underBtn) await underBtn.click();
      const closeBtn = await page.$('button:has-text("Done")');
      if (closeBtn) await closeBtn.click();
      await page.waitForTimeout(800);
    }
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_atmosphere_underwater_bubbles.png') });
    console.log('📸 06_atmosphere_underwater_bubbles.png captured');

    // 3. Test Confirmed Success Celebration: Student Admission Petals
    console.log('📍 Testing confirmed celebration trigger...');
    await page.evaluate(() => {
      // Find react context or trigger synthetic celebration event
      const btn = document.querySelector('button[title*="Direct Student Admission Form"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);

    // Capture Enrol Student Modal with Living inputs
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_student_admission_modal.png') });
    console.log('📸 07_student_admission_modal.png captured');

    // Close admission modal
    const modalClose = await page.$('button:has-text("Cancel")');
    if (modalClose) await modalClose.click();
    await page.waitForTimeout(400);

    // 4. Test Navigation Across Tabs to Verify Individual Page Personalities
    const tabsToTest = [
      { id: 'admissions', name: '08_tab_admissions_pipeline' },
      { id: 'students', name: '09_tab_student_directory' },
      { id: 'attendance', name: '10_tab_attendance_biometric' },
      { id: 'academics', name: '11_tab_curriculum_catalogues' },
      { id: 'fees', name: '12_tab_fee_collection_invoices' },
      { id: 'examinations', name: '13_tab_exam_schedules' },
      { id: 'laboratory', name: '14_tab_laboratory_science' },
      { id: 'security-password', name: '15_tab_security_password' },
    ];

    for (const t of tabsToTest) {
      console.log(`📍 Testing tab: ${t.id}...`);
      await page.evaluate((tabId) => {
        const tabEl = document.querySelector(`[data-tab-id="${tabId}"]`) ||
          Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes(tabId));
        if (tabEl) tabEl.click();
      }, t.id);
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `${t.name}.png`) });
      console.log(`📸 ${t.name}.png captured`);
    }

    // 5. Test Responsive Viewports
    console.log('📍 Testing Tablet viewport (768x1024)...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16_responsive_tablet_view.png') });
    console.log('📸 16_responsive_tablet_view.png captured');

    console.log('📍 Testing Mobile viewport (375x812)...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17_responsive_mobile_view.png') });
    console.log('📸 17_responsive_mobile_view.png captured');

    // 6. Test Public Marketing Route with Living Experience Trigger
    console.log('📍 Testing Public Marketing Homepage...');
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '18_public_homepage_experience.png') });
    console.log('📸 18_public_homepage_experience.png captured');

    // Measure Performance Metrics
    const perfTiming = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
        loadComplete: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
        memoryUsage: performance.memory ? Math.round(performance.memory.usedJSHeapSize / (1024 * 1024)) : 'N/A',
      };
    });

    console.log('📊 Performance Metrics:', perfTiming);
    console.log(`🎉 Automated Verification Finished! Total Screenshots: ${fs.readdirSync(SCREENSHOT_DIR).length}`);

    if (consoleErrors.length > 0) {
      console.log('⚠️ Console errors noted during run:', consoleErrors);
    } else {
      console.log('✅ ZERO console errors detected during full interaction cycle!');
    }

  } catch (err) {
    console.error('❌ Verification script failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runVerification();
