import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
const page = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto('http://localhost:3100', { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(500);
const stops = { '30-hero': 0, '31-p1': 2.3, '32-skills': 6.2, '33-contacts': 16.1 };
for (const [name, s] of Object.entries(stops)) {
  await page.evaluate((y) => window.scrollTo(0, y * 1080), s);
  await page.waitForTimeout(1300);
  await page.screenshot({ path: `/home/claude/work/shots/${name}.png` });
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
await page.locator('.workItem').nth(3).hover();
await page.waitForTimeout(600);
await page.screenshot({ path: '/home/claude/work/shots/34-hover.png' });
await b.close();
console.log('ok');
