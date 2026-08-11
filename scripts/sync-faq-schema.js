#!/usr/bin/env node
/**
 * Regenerates the FAQPage JSON-LD in public/index.html from the `faqs` array
 * in public/app.js, so the two can never drift.
 *
 * This is a maintenance utility, NOT a build step — the site still ships as
 * plain static files. Run it by hand after editing the FAQ copy:
 *
 *     node scripts/sync-faq-schema.js
 *
 * It rewrites only the block between the SEO:FAQ-LD markers.
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const appPath = path.join(root, 'public', 'app.js');
const htmlPath = path.join(root, 'public', 'index.html');

const app = fs.readFileSync(appPath, 'utf8');

// Pull the `const faqs = [...]` literal out and evaluate it in isolation.
const start = app.indexOf('const faqs = [');
if (start === -1) throw new Error('Could not find `const faqs = [` in app.js');
let i = app.indexOf('[', start);
let depth = 0, end = -1;
for (let j = i; j < app.length; j++) {
  if (app[j] === '[') depth++;
  else if (app[j] === ']') { depth--; if (depth === 0) { end = j + 1; break; } }
}
if (end === -1) throw new Error('Unbalanced brackets in the faqs array');
const faqs = vm.runInNewContext('(' + app.slice(i, end) + ')');

const ld = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const block =
  '<!-- SEO:FAQ-LD:START -->\n' +
  '<script type="application/ld+json">\n' +
  JSON.stringify(ld, null, 2) + '\n' +
  '</script>\n' +
  '<!-- SEO:FAQ-LD:END -->';

const html = fs.readFileSync(htmlPath, 'utf8');
const re = /<!-- SEO:FAQ-LD:START -->[\s\S]*?<!-- SEO:FAQ-LD:END -->/;
if (!re.test(html)) throw new Error('FAQ-LD markers not found in index.html');
fs.writeFileSync(htmlPath, html.replace(re, block));

console.log(`Synced ${faqs.length} FAQs into the FAQPage JSON-LD.`);
