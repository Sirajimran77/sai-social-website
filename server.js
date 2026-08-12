/* ==========================================================================
   SAI Social — web server
   - Serves the static landing page from /public
   - POST /api/booking  →  emails the enquiry to the SAI Social inbox
   ========================================================================== */
'use strict';

const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
// On a VPS the app sits behind nginx, so it should only ever be reachable on
// loopback — binding 0.0.0.0 there leaves port 3000 open to the internet and
// lets anyone bypass nginx (and therefore TLS, and the real client IP the rate
// limiter keys on). Set HOST=127.0.0.1 in production .env; default stays open
// so local/dev and PaaS hosts that probe the container keep working.
const HOST = process.env.HOST || '0.0.0.0';
const IS_PROD = process.env.NODE_ENV === 'production';

// Behind a reverse proxy (Cloudflare, nginx, Render, Fly...) req.ip is the
// proxy unless we trust one hop of X-Forwarded-For. Rate limiting is only as
// good as the IP it keys on, so this matters. Kept at exactly 1 hop: trusting
// the whole chain lets a client forge X-Forwarded-For and dodge the limiter.
if (IS_PROD) app.set('trust proxy', 1);

// Don't advertise the framework and version to scanners.
app.disable('x-powered-by');

// Where booking enquiries are delivered.
const TO_EMAIL = process.env.TO_EMAIL || 'saimanagement77@gmail.com';

// Absolute origin used for canonical / Open Graph URLs and the sitemap.
// Override with SITE_ORIGIN once the real domain is live.
const SITE_ORIGIN = (process.env.SITE_ORIGIN || 'https://www.saisocial.co.uk').replace(/\/$/, '');

/* ------------------------------------------------------ security headers */
// Content-Security-Policy is the real prize here: it is what stops an injected
// <script> from executing even if something ever does get through. Tuned to
// what this site actually loads, so keep it in step with the markup:
//   script-src 'self'  - app.js is the only script. The two JSON-LD blocks are
//                        data, not executable, so they need no allowance. If
//                        you ever add an inline <script>, hash it rather than
//                        reaching for 'unsafe-inline'.
//   style-src           - 'unsafe-inline' is unavoidable: the markup is full of
//                        style="animation-delay:…" attributes and there is no
//                        build step to hash them. Style injection is a far
//                        smaller problem than script injection.
//   font/style hosts    - Google Fonts, loaded from the <head>.
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: false,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'img-src': ["'self'", 'data:'],
      'media-src': ["'self'"],
      'connect-src': ["'self'"],
      'form-action': ["'self'"],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'object-src': ["'none'"],
      ...(IS_PROD ? { 'upgrade-insecure-requests': [] } : {}),
    },
  },
  // HSTS is meaningless (and a footgun) on plain-HTTP localhost: a browser
  // that caches it will refuse to load http://localhost:3000 afterwards.
  strictTransportSecurity: IS_PROD
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  crossOriginEmbedderPolicy: false, // would block the Google Fonts stylesheet
}));

app.use((_req, res, next) => {
  // Nothing on this site needs any of these, so switch them off site-wide.
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()');
  next();
});

// Global ceiling. Generous enough that a real visitor loading the page, its
// CSS, JS, nine wall stills and the showreel never notices, low enough that a
// scraper hammering the box gets cut off.
app.use(rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { ok: false, error: 'Too many requests. Please slow down.' },
}));

app.use(express.json({ limit: '32kb' }));

// express.json throws on malformed JSON; without this the client gets an HTML
// error page (with a stack trace when NODE_ENV isn't production) instead of the
// JSON shape it is parsing.
app.use((err, _req, res, next) => {
  if (err && (err.type === 'entity.parse.failed' || err.type === 'entity.too.large')) {
    return res.status(400).json({ ok: false, error: 'Malformed request.' });
  }
  return next(err);
});

// Static assets. index:false so we own "/" and can inject per-route SEO meta
// below instead of serving the raw template.
//
// Images/video/fonts cache hard for a week — their filenames change when the
// content does. styles.css and app.js do NOT have fingerprinted filenames, so
// caching them for a week ships a stale stylesheet against fresh HTML after
// every deploy. They get `no-cache`, which still allows a cheap 304 via ETag
// but forces revalidation. If these ever get content-hashed filenames, move
// them back under the long max-age.
app.use(express.static(path.join(__dirname, 'public'), {
  index: false,
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    if (/\.(html|css|js|txt|xml|webmanifest)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

/* ---------------------------------------------------------- SEO / ROUTING */
// The HTML shell, read once at startup. index.html carries home-page defaults
// between the SEO:HEAD markers; we swap them per route and strip the FAQ
// structured data on routes where the FAQ isn't the visible content.
const TEMPLATE = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');

const ROUTES = {
  '/': {
    title: 'Social, Web & Paid Ads Agency | SAI Social',
    desc: 'SAI Social is a UK marketing agency for restaurants, bars, takeaways, salons, e-commerce and brands. Short-form video, websites, SEO and paid ads from £800/month. More customers, not more followers.',
    // The FAQ moved to its own page, so the FAQPage schema goes with it —
    // it must sit on the page whose visible content it describes.
    faq: false,
  },
  '/about': {
    title: 'About SAI Social | Social, Web & Paid Ads',
    desc: 'Meet SAI Social, a UK performance-marketing team running social, web and paid ads for local businesses and brands. We baseline your numbers first and report in plain figures.',
    faq: false,
  },
  '/faq': {
    title: 'FAQ | Pricing, Guarantee & How We Work | SAI Social',
    desc: "Straight answers on what SAI Social costs, who we work with, the Baseline Guarantee, contracts, and whether a £300/month social media freelancer is worth it.",
    faq: true,
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

// Example audit — a standalone sample page (copy of the Akbar's audit artifact)
// linked from the "See an example" button on the free-audit offer band.
app.get('/example-audit', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'example-audit.html'));
});

// robots.txt — allow everyone, explicitly welcome AI answer-engine crawlers so
// we're eligible to be cited, and point to the sitemap. Served dynamically so
// the Sitemap URL always matches SITE_ORIGIN.
app.get('/robots.txt', (_req, res) => {
  // Search-and-cite bots. Blocking any of these means that engine literally
  // cannot cite us, so they all stay allowed. CCBot (training-only, no
  // citation benefit) is deliberately the one we don't invite.
  const aiBots = [
    'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',   // OpenAI / ChatGPT
    'PerplexityBot', 'Perplexity-User',           // Perplexity
    'ClaudeBot', 'anthropic-ai', 'Claude-User',   // Anthropic / Claude
    'Google-Extended',                            // Gemini + AI Overviews
    'Bingbot',                                    // Microsoft Copilot
    'Applebot-Extended',                          // Apple Intelligence
    'meta-externalagent',                         // Meta AI
  ];
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

// Machine-readable pricing for AI agents comparing providers on a buyer's
// behalf. Plain markdown on purpose: no JS, no gate, trivially parseable.
// MUST stay in sync with the tier prices in public/app.js and index.html.
app.get(['/pricing.md', '/pricing.txt'], (_req, res) => {
  res.type('text/markdown').sendFile(path.join(__dirname, 'public', 'pricing.md'));
});

// XML sitemap — the real, indexable URLs.
const BUILD_DATE = new Date().toISOString().slice(0, 10);
app.get('/sitemap.xml', (_req, res) => {
  const urls = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/faq', changefreq: 'monthly', priority: '0.8' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/example-audit', changefreq: 'monthly', priority: '0.6' },
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
// There is no database anywhere in this project, so there is no SQL to inject.
// The injection surface that DOES exist is the outbound email: every field
// below lands in a mail header or body, and a CR/LF inside a header value is
// how an attacker appends their own headers (Bcc: everyone) and turns this
// form into an open relay. Strip control characters on the way in, once, so no
// individual call site has to remember to.
// Normalise line endings, then drop every control character EXCEPT newline
// and tab. Newlines have to survive here: the message body is a body, not a
// header, and stripping them turns a paragraph into one unreadable run-on line.
const stripControl = (v) => String(v)
  .replace(/\r\n?/g, '\n')
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ' ');

const clean = (v, max = 2000) => (typeof v === 'string' ? stripControl(v).trim().slice(0, max) : '');

// Anything destined for a mail HEADER goes through this instead: it collapses
// every run of whitespace, newlines included, into a single space. That is what
// actually closes the header-injection hole, because a header value physically
// cannot contain a line break once it has been through here.
const cleanLine = (v, max) => clean(v, max).replace(/\s+/g, ' ').trim();

const isEmail = (v) => typeof v === 'string'
  && v.length <= 254
  && /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/.test(v);

// Booking submissions are the expensive path: each one sends real mail through
// a Gmail account with a daily send quota. Without this, one script can empty
// that quota, bury genuine enquiries and get the sending account flagged.
const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Bots that trip the honeypot get a fake success, so they don't learn to
  // retry; they still count against the limit.
  message: { ok: false, error: 'Too many enquiries from this connection. Please try again shortly, or email us directly.' },
});

// Cross-origin form posts. A browser can't send application/json cross-origin
// without a CORS preflight we never answer, so classic CSRF is already off the
// table; this is belt and braces against a non-browser client replaying the
// endpoint with a forged Origin, and it costs nothing.
const ALLOWED_ORIGINS = new Set(
  [SITE_ORIGIN, `http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`]
    .concat((process.env.EXTRA_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean))
);

/* -------------------------------------------------------------- endpoint */
app.post('/api/booking', bookingLimiter, async (req, res) => {
  // Origin is absent on same-origin non-CORS posts in some clients, so only
  // reject when it is present AND unrecognised.
  const origin = req.get('origin');
  if (origin && !ALLOWED_ORIGINS.has(origin.replace(/\/$/, ''))) {
    return res.status(403).json({ ok: false, error: 'Forbidden.' });
  }

  const b = req.body || {};
  const name = cleanLine(b.name, 120);
  const venue = cleanLine(b.venue, 160);
  const email = cleanLine(b.email, 254);
  const phone = cleanLine(b.phone, 60);
  const venueType = cleanLine(b.venueType, 60);
  const budget = cleanLine(b.budget, 60);
  const message = clean(b.message, 4000); // newlines are wanted here

  // Honeypot: a field hidden from humans by CSS. Anything that fills it is a
  // form-filling bot. Answer 200 so it records a success and doesn't retry or
  // go looking for whatever tripped it.
  if (clean(b.company, 200)) return res.json({ ok: true });

  // Time trap: the client stamps when the form was rendered. Humans do not
  // read this page and complete six fields in under three seconds.
  const elapsed = Date.now() - Number(b.t || 0);
  if (Number.isFinite(elapsed) && b.t && elapsed < 3000) return res.json({ ok: true });

  if (!name || !venue || !isEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Please check your name, business name and email address.' });
  }

  // Link-stuffed message bodies are the signature of spam-cannon traffic.
  if ((message.match(/https?:\/\//gi) || []).length > 4) {
    return res.json({ ok: true });
  }

  const subject = `New booking enquiry: ${venue} (${name})`;
  const lines = [
    `Name:        ${name}`,
    `Venue:       ${venue}`,
    `Email:       ${email}`,
    `Phone:       ${phone || 'not given'}`,
    `Venue type:  ${venueType || 'not given'}`,
    `Ad budget:   ${budget || 'not given'}`,
    '',
    'What they want to fill:',
    message || 'not given',
    '',
    `Received: ${new Date().toISOString()}`,
  ];
  const text = lines.join('\n');
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111;line-height:1.6">
      <h2 style="margin:0 0 16px">New booking enquiry</h2>
      <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
        ${row('Name', name)}${row('Venue', venue)}${row('Email', email)}
        ${row('Phone', phone || 'not given')}${row('Venue type', venueType || 'not given')}${row('Ad budget', budget || 'not given')}
      </table>
      <p style="margin:18px 0 6px;font-weight:bold">What they want to fill</p>
      <p style="margin:0;white-space:pre-wrap">${escapeHtml(message || 'not given')}</p>
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
      // Object form, never a hand-built `"${name}" <${email}>` string: that
      // interpolation is the classic header-injection hole, because a name
      // containing a quote closes the display name and everything after it is
      // parsed as address list. Nodemailer encodes each part properly here.
      replyTo: { name, address: email },
      subject,
      text,
      html,
    });
    return res.json({ ok: true });
  } catch (err) {
    // Log server-side only. The client gets a generic message: SMTP errors
    // leak the provider, the account and sometimes the credentials state.
    console.error('Failed to send booking email:', err.message);
    return res.status(502).json({ ok: false, error: "We couldn't send that just now. Please try again, or email us directly." });
  }
});

function row(label, value) {
  return `<tr><td style="padding:4px 16px 4px 0;color:#777">${label}</td><td style="padding:4px 0;font-weight:bold">${escapeHtml(value)}</td></tr>`;
}
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Liveness probe for systemd/nginx/uptime monitoring. Deliberately cheap and
// noindex'd — it exists so a watchdog can tell "process up" from "port open".
app.get('/healthz', (_req, res) => {
  res.type('text/plain').set('Cache-Control', 'no-store').send('ok');
});

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

const server = app.listen(PORT, HOST, () =>
  console.log(`SAI Social site running on http://${HOST}:${PORT}`));

// systemd sends SIGTERM on `systemctl restart/stop`. Without this the process
// is killed mid-request (and mid-SMTP-send) after a 90s timeout; with it,
// in-flight enquiries finish and the restart is instant.
['SIGTERM', 'SIGINT'].forEach((sig) => {
  process.on(sig, () => {
    console.log(`${sig} received — shutting down.`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
});
