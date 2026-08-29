/* Browser smoke test: every route renders, no console errors, builder and
 * search work.  Needs playwright:  npm i playwright && node tools/smoke.js
 * Screenshots land in $SHOTS (default: a temp dir).
 */
const { chromium } = require('playwright');
const http = require('http'), fs = require('fs'), path = require('path');

const ROOT = require('path').join(__dirname, '..');
const TYPES = {'.html':'text/html','.js':'text/javascript','.css':'text/css',
               '.png':'image/png','.webmanifest':'application/manifest+json'};
const SHOTS = process.env.SHOTS || require('os').tmpdir() + '/cph-shots';
fs.mkdirSync(SHOTS, { recursive: true });

const server = http.createServer((req,res)=>{
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end('nf'); }
  res.writeHead(200, {'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream'});
  res.end(fs.readFileSync(f));
});

(async () => {
  await new Promise(r => server.listen(8099, r));
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
  const ctx = await b.newContext({ viewport:{width:390,height:844}, deviceScaleFactor:2,
                                   colorScheme:'dark', isMobile:true, hasTouch:true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type()==='error') errs.push('console: '+m.text()); });
  page.on('pageerror', e => errs.push('pageerror: '+e.message));

  const shot = async (hash, name) => {
    await page.goto('http://localhost:8099/#' + hash);
    await page.waitForTimeout(280);
    await page.screenshot({ path: SHOTS + '/' + name + '.png' });
  };

  await page.goto('http://localhost:8099/');
  await page.waitForTimeout(400);
  await shot('/', '01-home');
  await shot('/learn', '02-learn');
  await shot('/learn/gamehop', '03-tech');
  await shot('/proofs', '04-proofs');
  await shot('/proofs/prf-ctr', '05-proof');
  await shot('/basics/negligible', '06-concept');
  await shot('/build/gamehop', '07-build');
  await shot('/drill', '08-drill');
  await shot('/checklist', '09-checklist');

  // interactions
  await page.goto('http://localhost:8099/#/drill'); await page.waitForTimeout(250);
  await page.click('.opt'); await page.waitForTimeout(250);
  await page.screenshot({ path: SHOTS + '/10-drill-answered.png' });

  await page.goto('http://localhost:8099/#/build/reduction'); await page.waitForTimeout(250);
  await page.fill('[name=scheme]', 'ElGamal over G');
  await page.fill('[name=assum]', 'DDH in G');
  await page.click('#gen'); await page.waitForTimeout(200);
  const out = await page.textContent('#out');
  console.log('BUILDER OK:', out.includes('\\begin{theorem}') && out.includes('DDH in G'));
  await page.screenshot({ path: SHOTS + '/11-build-generated.png' });

  await page.goto('http://localhost:8099/#/search/hybrid'); await page.waitForTimeout(350);
  const hits = await page.$$eval('#res .card', n => n.length);
  console.log('SEARCH HITS:', hits);
  await page.screenshot({ path: SHOTS + '/12-search.png' });

  // step collapse toggle
  await page.goto('http://localhost:8099/#/proofs/elgamal'); await page.waitForTimeout(250);
  await page.locator('.step .sh').nth(1).click();
  const visible = await page.$$eval('.sbody:not([hidden])', n => n.length);
  console.log('STEPS EXPANDED:', visible);

  // light mode render
  const lp = await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,colorScheme:'light'})).newPage();
  await lp.goto('http://localhost:8099/#/proofs/prf-ctr'); await lp.waitForTimeout(300);
  await lp.screenshot({ path: SHOTS + '/13-light.png' });

  console.log('ERRORS:', errs.length ? errs : 'none');
  await b.close(); server.close();
})();
