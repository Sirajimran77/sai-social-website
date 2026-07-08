# SAI Social — "Fill The Room" website

A production build of the SAI Social lead-generation landing page (brutalist,
black + electric-blue), with a small Node.js backend that emails every booking
enquiry to **saimanagement77@gmail.com**.

- **Frontend** — static HTML/CSS/JS in [`public/`](public/). Home, About and
  Privacy views, the interactive growth-audit quiz, services accordion, case
  study, testimonials and the booking form. No build step.
- **Backend** — [`server.js`](server.js): serves the site and exposes
  `POST /api/booking`, which validates the enquiry and emails it to the inbox.

---

## 1. Run it locally

```bash
npm install
cp .env.example .env      # then edit .env (see below)
npm start                 # → http://localhost:3000
```

Without email credentials the site still runs — enquiries are printed to the
server console instead of emailed, so you can test the whole flow first.

## 2. Turn on email (required before go-live)

The form emails through SMTP. The simplest setup uses the Gmail account itself:

1. Sign in to **saimanagement77@gmail.com**.
2. Enable **2-Step Verification** → https://myaccount.google.com/security
3. Create an **App Password** → https://myaccount.google.com/apppasswords
   (choose "Mail"). You'll get a 16-character password.
4. In `.env`, set:
   ```
   SMTP_USER=saimanagement77@gmail.com
   SMTP_PASS=the16charapppassword     # no spaces
   TO_EMAIL=saimanagement77@gmail.com
   ```
5. Restart the server. On boot you should see
   `✓ SMTP transport ready`. Submit the form to confirm the email arrives.

> Prefer not to use Gmail? Any SMTP provider works (Zoho, Fastmail, Mailgun,
> SendGrid, etc.) — just set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`,
> `SMTP_USER`, `SMTP_PASS`. Use `SMTP_PORT=587` with `SMTP_SECURE=false` for
> STARTTLS providers.

## 3. Deploy (go live)

Any host that runs Node 18+ works — e.g. **Render**, **Railway**, **Fly.io**,
or a VPS. General steps:

1. Push this folder to a Git repo (the `.env` file is gitignored — do **not**
   commit it).
2. Create a new **Web Service** on your host, pointing at the repo.
3. Build command: `npm install` · Start command: `npm start`.
4. Add the environment variables from your `.env` in the host's dashboard
   (`SMTP_USER`, `SMTP_PASS`, `TO_EMAIL`, and any custom `SMTP_*`). The host
   sets `PORT` automatically.
5. Point your domain at the service and enable HTTPS (most hosts do this for
   you).

## Environment variables

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `TO_EMAIL` | – | `saimanagement77@gmail.com` | Inbox that receives enquiries |
| `SMTP_USER` | ✅ | – | SMTP username / sending account |
| `SMTP_PASS` | ✅ | – | SMTP password / app password |
| `SMTP_HOST` | – | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | – | `465` | `465` (SSL) or `587` (STARTTLS) |
| `SMTP_SECURE` | – | `true` | `true` for 465, `false` for 587 |
| `FROM_EMAIL` | – | `SMTP_USER` | "From" address on the email |
| `PORT` | – | `3000` | Port the server listens on |

## Notes & things to finish before launch

- **Privacy Policy** is placeholder (lorem ipsum). Replace the text in
  `public/app.js` (`privacySections`) and the intro/contact copy in
  `public/index.html` with your real policy.
- **Team / stats / testimonials / case study** copy lives as data arrays at the
  top of `public/app.js` — edit there.
- Fonts (Archivo / Space Grotesk / Space Mono) load from Google Fonts as
  licensed substitutes for the bespoke brand wordmark; swap in the real fonts
  when available.
- The form includes basic validation, a hidden honeypot for bots, and length
  caps. For high-traffic launches consider adding rate-limiting / a CAPTCHA.
