/* ==========================================================================
   SAI Social — web server
   - Serves the static landing page from /public
   - POST /api/booking  →  emails the enquiry to the SAI Social inbox
   ========================================================================== */
'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Where booking enquiries are delivered.
const TO_EMAIL = process.env.TO_EMAIL || 'saimanagement77@gmail.com';

// Absolute origin used for canonical / Open Graph URLs and the sitemap.
// Override with SITE_ORIGIN once the real domain is live.
const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://www.saisocial.co.uk').replace(/\/$/, '');

app.use(express.json({ limit: '32kb' }));

// Baseline security headers.
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Static assets (cache aggressively). index:false so we own "/" and can
// inject per-route SEO meta below instead of serving the raw template.
app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

/* ---------------------------------------------------------- SEO / ROUTING */
// The HTML shell, read once at startup. index.html carries home-page defaults
// between the SEO:HEAD markers; we swap them per route and strip the FAQ
// structured data on routes where the FAQ isn't the visible content.
const TEMPLATE = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

const ROUTES = {
  '/': {
    title: 'Marketing Agency for Bars, Clubs & Restaurants | SAI Social',
    desc: 'SAI Social is a UK marketing agency for bars, clubs, restaurants and events. We run paid ads, content and booking funnels that fill your venue — bodies through the door.',
    faq: true,
  },
  '/about': {
    title: 'About SAI Social | Marketing Built for Hospitality & Nightlife',
    desc: 'Meet SAI Social — a UK performance-marketing team for bars, clubs, restaurants and events. Built on the floor, not in a boardroom. We fill rooms, not feeds.',
    faq: false,
  },
  '/privacy': {
    title: 'Privacy Policy | SAI Social',
    desc: 'How SAI Social collects, uses and protects your personal data under UK GDPR and the Data Protection Act 2018.',
    faq: false,
  },
};

const encAttr = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderPage(routePath) {
  const r = ROUTES[routePath];
  const url = SITE_ORIGIN + (routePath === '/' ? '/' : routePath);
  const t = encAttr(r.title);
  const d = encAttr(r.desc);
  const head = [
    `<title>${t}</title>`,
    `<meta name="description" content="${d}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${t}">`,
    `<meta property="og:description" content="${d}">`,
    `<meta name="twitter:title" content="${t}">`,
    `<meta name="twitter:description" content="${d}">`,
  ].join('\n');

  let html = TEMPLATE.replace(
    /<!-- SEO:HEAD:START -->[\s\S]*?<!-- SEO:HEAD:END -->/,
    `<!-- SEO:HEAD:START -->\n${head}\n<!-- SEO:HEAD:END -->`
  );
  if (!r.faq) {
    html = html.replace(/<!-- SEO:FAQ-LD:START -->[\s\S]*?<!-- SEO:FAQ-LD:END -->/, '');
  }
  return html;
}

Object.keys(ROUTES).forEach((routePath) => {
  app.get(routePath, (_req, res) => {
    res.type('html').send(renderPage(routePath));
  });
});

// robots.txt — allow everyone, explicitly welcome AI answer-engine crawlers so
// we're eligible to be cited, and point to the sitemap. Served dynamically so
// the Sitemap URL always matches SITE_ORIGIN.
app.get('/robots.txt', (_req, res) => {
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'PerplexityBot', 'ClaudeBot', 'anthropic-ai', 'Google-Extended'];
  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    '# AI answer engines — allowed so SAI Social can be cited in AI results',
    ...aiBots.flatMap((b) => [`User-agent: ${b}`, 'Allow: /', '']),
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');
  res.type('text/plain').send(body);
});

// XML sitemap — the three real, indexable URLs.
const BUILD_DATE = new Date().toISOString().slice(0, 10);
app.get('/sitemap.xml', (_req, res) => {
  const urls = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${SITE_ORIGIN}${u.loc}</loc>
    <lastmod>${BUILD_DATE}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  res.type('application/xml').send(body);
});

/* -------------------------------------------------------------- mail setup */
// Build a Nodemailer transport from environment variables.
// Defaults target Gmail SMTP (see .env.example / README for setup).
function buildTransport() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || 'true') === 'true', // true for 465, false for 587
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

const transporter = buildTransport();
if (transporter) {
  transporter.verify()
    .then(() => console.log('✓ SMTP transport ready — enquiries will be emailed to', TO_EMAIL))
    .catch((err) => console.error('⚠ SMTP verify failed:', err.message));
} else {
  console.warn('⚠ SMTP not configured (missing SMTP_USER / SMTP_PASS). ' +
    'Booking enquiries will be logged to the console instead of emailed. See README.md.');
}

/* ------------------------------------------------------------- validation */
const isEmail = (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const clean = (v, max = 2000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/* -------------------------------------------------------------- endpoint */
app.post('/api/booking', async (req, res) => {
  const b = req.body || {};
  const name = clean(b.name, 120);
  const venue = clean(b.venue, 160);
  const email = clean(b.email, 160);
  const phone = clean(b.phone, 60);
  const venueType = clean(b.venueType, 60);
  const budget = clean(b.budget, 60);
  const message = clean(b.message, 4000);

  // Honeypot (optional) + required-field validation.
  if (b.company) return res.json({ ok: true }); // silently drop bots
  if (!name || !venue || !isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Missing or invalid required fields.' });
  }

  const subject = `New booking enquiry — ${venue} (${name})`;
  const lines = [
    `Name:        ${name}`,
    `Venue:       ${venue}`,
    `Email:       ${email}`,
    `Phone:       ${phone || '—'}`,
    `Venue type:  ${venueType || '—'}`,
    `Ad budget:   ${budget || '—'}`,
    '',
    'What they want to fill:',
    message || '—',
    '',
    `Received: ${new Date().toISOString()}`,
  ];
  const text = lines.join('\n');
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111;line-height:1.6">
      <h2 style="margin:0 0 16px">New booking enquiry</h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        ${row('Name', name)}${row('Venue', venue)}${row('Email', email)}
        ${row('Phone', phone || '—')}${row('Venue type', venueType || '—')}${row('Ad budget', budget || '—')}
      </table>
      <p style="margin:18px 0 6px;font-weight:bold">What they want to fill</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(message || '—')}</p>
      <p style="margin:22px 0 0;color:#777;font-size:12px">Received ${new Date().toUTCString()}</p>
    </div>`;

  if (!transporter) {
    console.log('\n──── BOOKING ENQUIRY (email not configured) ────\n' + text + '\n────────────────────────────────────────────────\n');
    return res.json({ ok: true });
  }

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL || `"SAI Social Website" <${process.env.SMTP_USER}>`,
      to: TO_EMAIL,
      replyTo: `"${name}" <${email}>`,
      subject,
      text,
      html,
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Failed to send booking email:', err.message);
    return res.status(502).json({ ok: false, error: 'Email delivery failed.' });
  }
});

function row(label, value) {
  return `<tr><td style="padding:4px 16px 4px 0;color:#777">${label}</td><td style="padding:4px 0;font-weight:bold">${escapeHtml(value)}</td></tr>`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Real 404 for unknown paths (previously every path returned the homepage,
// creating soft-404s that waste crawl budget and confuse indexing).
app.use((req, res) => {
  res.status(404).type('html').send(`<!DOCTYPE html>
<html lang="en-GB"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Page not found | SAI Social</title>
<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;background:#000;color:#fff;font-family:system-ui,-apple-system,Segoe UI,sans-serif;text-align:center;padding:24px}h1{font-size:clamp(2rem,8vw,4rem);margin:0}a{color:#0F3DFF;font-weight:700;text-decoration:none}</style>
</head><body>
<h1>404</h1>
<p>That room doesn't exist. Let's get you back to a full one.</p>
<a href="/">← Back to SAI Social</a>
</body></html>`);
});

app.listen(PORT, () => console.log(`SAI Social site running on http://localhost:${PORT}`));
