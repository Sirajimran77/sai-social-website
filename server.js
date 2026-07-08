/* ==========================================================================
   SAI Social — web server
   - Serves the static landing page from /public
   - POST /api/booking  →  emails the enquiry to the SAI Social inbox
   ========================================================================== */
'use strict';

const path = require('path');
const express = require('express');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Where booking enquiries are delivered.
const TO_EMAIL = process.env.TO_EMAIL || 'saimanagement77@gmail.com';

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, 'public')));

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

// SPA-style fallback (views are toggled client-side).
app.get('*', (_req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.listen(PORT, () => console.log(`SAI Social site running on http://localhost:${PORT}`));
