/**
 * Enhanced Diagnostic: Capture React errors and full event flow
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EMAIL = 'melinaetoka@gmail.com';
const PASSWORD = 'melinaetoka@gmail.com';
const BASE_URL = 'http://localhost:4174';
const LOGIN_URL = `${BASE_URL}/candidate/login`;
const DASHBOARD_URL = `${BASE_URL}/candidate/dashboard`;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${colors.reset}`);
}

async function enhanced_diagnostic() {
  log(colors.bright + colors.cyan, '\n========== ENHANCED DIAGNOSTIC FLOW ==========\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--disable-blink-features=AutomationControlled'],
  });

  const page = await browser.newPage();

  // Collect all console messages
  const allLogs = [];
  const reactErrors = [];
  const diags = [];

  page.on('console', msg => {
    const text = msg.text();
    allLogs.push(text);
    
    if (text.includes('[DIAG]')) {
      diags.push(text);
      log(colors.magenta, `[DIAG] ${text}`);
    } else if (text.includes('React')) {
      log(colors.red, `[REACT] ${text}`);
      reactErrors.push(text);
    } else if (text.includes('[Dashboard]') || text.includes('[Login]') || text.includes('ERROR')) {
      log(colors.blue, `[MSG] ${text}`);
    }
  });

  page.on('error', err => {
    log(colors.red, `[PAGE ERROR] ${err.message}`);
  });

  try {
    // PHASE 1: LOGIN
    log(colors.bright + colors.green, '\n--- PHASE 1: LOGIN FLOW ---\n');

    log(colors.green, 'Navigate to login page');
    await page.goto(LOGIN_URL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));

    log(colors.green, 'Fill login form');
    await page.evaluate((email, pass) => {
      const emailInput = document.querySelector('input[type="email"]') || document.querySelector('input[inputmode="email"]');
      const passInput = document.querySelector('input[type="password"]');
      if (emailInput) emailInput.value = email;
      if (passInput) passInput.value = pass;
    }, EMAIL, PASSWORD);

    log(colors.green, 'Submit login form');
    await page.click('button[type="submit"]');

    log(colors.green, 'Wait for navigation and dashboard load');
    let loginAttempts = 0;
    const maxAttempts = 20;
    while (loginAttempts < maxAttempts) {
      await page.evaluate(() => new Promise(r => setTimeout(r, 500)));
      const url = page.url();
      
      if (url.includes('/candidate/dashboard')) {
        log(colors.green, `✅ Successfully navigated to dashboard`);
        break;
      }
      if (!url.includes('/candidate/login')) {
        log(colors.yellow, `⚠️  Navigated to: ${url}`);
        break;
      }
      loginAttempts++;
    }

    log(colors.green, 'Wait for dashboard to fully render');
    await page.evaluate(() => new Promise(r => setTimeout(r, 3000)));

    // Get auth state and profile
    const authState_A = await page.evaluate(() => {
      try {
        return {
          url: window.location.pathname,
          sessionPresent: window.__diagnosticLogger?.events?.some(e => e.type === 'LOGIN_SUCCESS') || false,
          totalDiagEvents: window.__diagnosticLogger?.events?.length || 0,
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    log(colors.yellow, 'After LOGIN - Auth State:', JSON.stringify(authState_A, null, 2));

    // PHASE 2: RELOAD
    log(colors.bright + colors.green, '\n--- PHASE 2: RELOAD FLOW ---\n');

    log(colors.green, 'Reload page (staying in same browser context)');
    allLogs.length = 0;
    diags.length = 0;
    reactErrors.length = 0;
    
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 1000)));

    log(colors.green, 'Wait for dashboard to fully render after reload');
    await page.evaluate(() => new Promise(r => setTimeout(r, 3000)));

    const authState_B = await page.evaluate(() => {
      try {
        return {
          url: window.location.pathname,
          sessionPresent: window.__diagnosticLogger?.events?.some(e => e.type === 'SESSION_RESTORED') || false,
          totalDiagEvents: window.__diagnosticLogger?.events?.length || 0,
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    log(colors.yellow, 'After RELOAD - Auth State:', JSON.stringify(authState_B, null, 2));

    // COMPARISON
    log(colors.bright + colors.cyan, '\n========== FINAL COMPARISON ==========\n');
    log(colors.yellow, `LOGIN: ${allLogs.length} console logs captured`);
    log(colors.yellow, `React errors in LOGIN: ${reactErrors.length}`);
    log(colors.yellow, `Diagnostic events in LOGIN: ${diags.length}`);

    log(colors.yellow, `RELOAD: check current state`);
    
    // Save full logs
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportDir = path.join(process.cwd(), 'diagnostic-reports');
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    fs.writeFileSync(
      path.join(reportDir, `enhanced-${timestamp}.json`),
      JSON.stringify({
        phase1_authState: authState_A,
        phase2_authState: authState_B,
        totalLogsPhase1: allLogs.length,
        reactErrorsPhase1: reactErrors,
        diags: diags,
      }, null, 2)
    );

    log(colors.green, '\n✅ Diagnostic complete\n');

    await browser.close();

  } catch (err) {
    log(colors.red, `Fatal error: ${err.message}\n${err.stack}`);
    await browser.close();
  }
}

enhanced_diagnostic().catch(console.error);
