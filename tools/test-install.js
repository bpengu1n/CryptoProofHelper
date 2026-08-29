/* Install-path tests: the two things that decide whether this actually lands
 * on someone's phone.
 *
 *   1. iOS Safari gets the add-to-home-screen nudge, and only iOS Safari.
 *   2. Everything still works from a GitHub Pages subpath (/<repo>/), which
 *      is where relative-path PWAs usually break.
 *
 * Needs playwright:  npm i playwright && node tools/test-install.js
 * Set CHROMIUM to a browser binary if playwright cannot find its own.
 */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = path.join(__dirname, '..');
const TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css',
               '.png':'image/png','.webmanifest':'application/manifest+json'};
const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) ' +
  'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

/** Static server, optionally rooted at a base path like GitHub Pages uses. */
function serve(port, base) {
  base = base || '';
  const server = http.createServer((req, res) => {
    let p = decodeURIComponent(req.url.split('?')[0]);
    if (base) {
      if (!p.startsWith(base)) { res.writeHead(404); return res.end('outside base'); }
      p = p.slice(base.length) || '/';
    }
    if (p === '/') p = '/index.html';
    const f = path.join(ROOT, p);
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
      res.writeHead(404); return res.end('not found');
    }
    res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream'});
    res.end(fs.readFileSync(f));
  });
  return new Promise(r => server.listen(port, () => r(server)));
}

let failures = 0;
function check(label, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log((ok ? '  ok   ' : '  FAIL ') + label +
              (ok ? '' : '  (got ' + JSON.stringify(actual) +
                         ', want ' + JSON.stringify(expected) + ')'));
}

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const iphone = () => browser.newContext({ viewport: { width: 390, height: 844 },
    userAgent: IPHONE_UA, isMobile: true, hasTouch: true });

  // ---------------------------------------------------------------- iOS nudge
  console.log('iOS add-to-home-screen nudge');
  {
    const server = await serve(8097);
    const URL0 = 'http://localhost:8097/';

    const ctx = await iphone();
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });

    await page.goto(URL0);
    await page.waitForSelector('#installbar', { timeout: 5000 });
    check('banner appears in iOS Safari', await page.isVisible('#installbar'), true);
    check('home offers the install card', await page.isVisible('a[href="#/install"].card'), true);

    await page.goto(URL0 + '#/install');
    await page.waitForTimeout(400);
    check('install page leads with iOS', (await page.textContent('.eyebrow')).includes('iPhone'), true);
    check('banner suppressed on the install page', !(await page.$('#installbar')), true);

    await page.goto(URL0);
    await page.waitForSelector('#installbar');
    await page.click('.ib-x');
    await page.reload();
    await page.waitForTimeout(1800);
    check('dismissal persists', !(await page.$('#installbar')), true);

    // Already installed: no nudge, and the page says so.
    const ctx2 = await iphone();
    const p2 = await ctx2.newPage();
    await p2.addInitScript(() =>
      Object.defineProperty(navigator, 'standalone', { get: () => true }));
    await p2.goto(URL0);
    await p2.waitForTimeout(1800);
    check('no banner when standalone', !(await p2.$('#installbar')), true);
    await p2.goto(URL0 + '#/install');
    await p2.waitForTimeout(300);
    check('standalone install page confirms', (await p2.textContent('main h3')).trim(), 'Installed \u2713');

    // Desktop must not see an iOS instruction.
    const ctx3 = await browser.newContext({ viewport: { width: 1100, height: 800 } });
    const p3 = await ctx3.newPage();
    await p3.goto(URL0);
    await p3.waitForTimeout(1800);
    check('no iOS banner on desktop', !(await p3.$('#installbar')), true);

    check('no console errors', errs, []);
    await new Promise(r => server.close(r));
    await ctx.close(); await ctx2.close(); await ctx3.close();
  }

  // ------------------------------------------------------- GitHub Pages subpath
  console.log('GitHub Pages subpath + offline');
  {
    const BASE = '/CryptoProofHelper';
    const server = await serve(8096, BASE);
    const URL0 = 'http://localhost:8096' + BASE + '/';

    const ctx = await iphone();
    const page = await ctx.newPage();
    const bad = [];
    page.on('requestfailed', r => bad.push(r.url()));
    page.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });

    await page.goto(URL0);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, { timeout: 15000 });
    check('service worker scoped to the subpath',
          await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).scope),
          URL0);

    const mani = await page.evaluate(async () => {
      const href = document.querySelector('link[rel=manifest]').href;
      const m = await (await fetch(href)).json();
      return { start: new URL(m.start_url, href).href,
               scope: new URL(m.scope, href).href,
               iconOk: await fetch(new URL(m.icons[0].src, href).href).then(r => r.ok) };
    });
    check('manifest start_url resolves under the subpath', mani.start, URL0 + 'index.html');
    check('manifest scope resolves under the subpath', mani.scope, URL0);
    check('manifest icon resolves', mani.iconOk, true);
    check('apple-touch-icon resolves',
          await page.evaluate(() => fetch(document.querySelector('link[rel="apple-touch-icon"]').href)
            .then(r => r.status)), 200);

    // Kill the origin and pull the plug: this is the whole point of the app.
    await new Promise(r => server.close(r));
    await ctx.setOffline(true);
    await page.goto(URL0 + '#/proofs/elgamal');
    await page.waitForTimeout(600);
    check('offline deep link renders', (await page.$$('.step')).length > 0, true);
    await page.reload();
    await page.waitForTimeout(600);
    check('offline survives a reload', (await page.textContent('#title')).length > 0, true);
    check('no failed requests', bad, []);
    await ctx.close();
  }

  await browser.close();
  console.log(failures ? failures + ' check(s) failed' : 'all install checks passed');
  process.exit(failures ? 1 : 0);
})();
