/* Content lint: catches the markup mistakes that render as literal noise.
 * No dependencies:  node tools/lint-content.js
 */
global.window = {};
require(require('path').join(__dirname, '..', 'vendor', 'puzzlepieces', 'js', 'math-renderer', 'math-renderer.js'));
['primer','concepts','techniques','examples','drills','templates'].forEach(f =>
  require(require('path').join(__dirname, '..', 'js', 'data', f + '.js')));
const M = window.MathRenderer;

/** Prose chunks of a string: everything outside $...$ / $$...$$. */
function prose(s) {
  const out = []; let i = 0;
  while (i < s.length) {
    const d = s.indexOf('$', i);
    if (d < 0) { out.push(s.slice(i)); break; }
    out.push(s.slice(i, d));
    const disp = s[d + 1] === '$', open = d + (disp ? 2 : 1);
    const close = s.indexOf(disp ? '$$' : '$', open);
    if (close < 0) break;
    i = close + (disp ? 2 : 1);
  }
  return out;
}

const issues = [];
function walk(v, path) {
  if (typeof v === 'string') {
    if ((v.match(/\$/g) || []).length % 2) issues.push(['unbalanced $', path, v.slice(0, 80)]);
    // Bold markers must pair up across the whole string.
    const stars = prose(v).join(' ').match(/\*\*/g);
    if (stars && stars.length % 2) issues.push(['odd ** count', path, v.slice(0, 80)]);
    // A lone * left after removing **bold** and *italic* is unrendered markup.
    const left = prose(v).map(c => c.replace(/\*\*/g, '')
      .replace(/(^|[\s(\[])\*([^*\s][^*]*?)\*(?=$|[\s.,;:!?)\]])/g, '$1$2')).join('');
    if (/\*/.test(left)) issues.push(['stray *', path, v.slice(0, 80)]);
    // Rendered output must not leak raw markup.
    if (/\*\*/.test(M.text(v))) issues.push(['** in output', path, v.slice(0, 80)]);
  } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, path + '[' + i + ']'));
  else if (v && typeof v === 'object')
    Object.keys(v).forEach(k => { if (typeof v[k] !== 'function') walk(v[k], path + '.' + k); });
}
['CP_PRIMER','CP_TRACKS','CP_GLOSSARY','CP_PATH','CP_CONCEPTS','CP_TECHNIQUES',
 'CP_EXAMPLES','CP_DRILLS','CP_TRIAGE','CP_CHECKLIST']
  .forEach(k => walk(window[k], k));

if (!issues.length) console.log('content lint: clean');
else { issues.forEach(i => console.log(i[0].padEnd(14), i[1], '|', i[2])); process.exit(1); }

