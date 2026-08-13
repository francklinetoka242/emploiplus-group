const puppeteer = require('puppeteer');

(async () => {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASS;

  if (!email || !password) {
    console.error('Missing TEST_EMAIL or TEST_PASS env vars.');
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  const errors = [];

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' || /React|Maximum update depth exceeded|Warning:|Error:/.test(text)) {
      errors.push({ kind: 'console', type: msg.type(), text });
      console.log('CONSOLE:' + JSON.stringify({ type: msg.type(), text }));
    }
  });

  page.on('pageerror', (err) => {
    const stack = err && err.stack ? err.stack : String(err);
    errors.push({ kind: 'pageerror', message: String(err), stack });
    console.log('PAGEERROR:' + String(err));
    if (stack) {
      console.log('STACK:\n' + stack);
    }
  });

  page.on('requestfailed', (req) => {
    const fail = req.failure();
    console.log('REQUESTFAILED:' + req.url() + ' :: ' + (fail ? fail.errorText : 'unknown'));
  });

  console.log('STEP 1: Load login page');
  await page.goto('http://localhost:4174/candidate/login', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);
  console.log('URL1=' + page.url());

  console.log('STEP 2: Submit login');
  await page.type('#email', email);
  await page.type('#password', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(9000);
  console.log('URL2=' + page.url());

  console.log('STEP 3: Open dashboard');
  await page.goto('http://localhost:4174/candidate/dashboard', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  console.log('URL3=' + page.url());

  console.log('STEP 4: Reload dashboard');
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(6000);
  console.log('URL4=' + page.url());

  console.log('ERROR_COUNT=' + errors.length);
  console.log('ERROR_SUMMARY=' + JSON.stringify(errors.slice(-20), null, 2));

  await browser.close();
})();
