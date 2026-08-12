# Going live — IONOS VPS (Ubuntu 24.04) + saisocial.co.uk

Runbook for putting this site on a fresh IONOS VPS behind nginx with a free
Let's Encrypt certificate. Start to finish is about 45 minutes, most of it
waiting for DNS.

**Canonical host is `www.saisocial.co.uk`.** The apex redirects to it. That
choice is baked into `SITE_ORIGIN`, the canonical tags, the sitemap and the
nginx config — if you'd rather run the apex as canonical, change all of them
together.

---

## Step 0 — before you touch the server

Commit and push everything. The server deploys by `git pull`, so anything
sitting uncommitted on your laptop will not be on the live site.

```bash
git status                      # should be clean
git push origin main
```

`.env`, `content/`, `prospects/`, `docs/` and `CLAUDE.md` are gitignored and
will **not** reach the server. That's deliberate — the GitHub repo is public.
The `.env` gets created by hand on the VPS in step 5.

---

## Step 1 — point the domain at the VPS

Get the VPS's public IPv4 (and IPv6, if IONOS gave you one) from the IONOS
console.

In **names.co.uk → Domain Management → saisocial.co.uk → DNS**, set:

| Type | Host / Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` (or blank) | `YOUR.VPS.IP.HERE` | 3600 |
| A | `www` | `YOUR.VPS.IP.HERE` | 3600 |
| AAAA | `@` | your IPv6, if you have one | 3600 |
| AAAA | `www` | your IPv6, if you have one | 3600 |

Delete any parking/redirect records names.co.uk added by default — a leftover
"web forwarding" record silently overrides the A record and you'll spend an
hour wondering why certbot fails.

Leave the nameservers as names.co.uk's. You don't need to move DNS to IONOS.

Check it from your laptop (can take 15 min to a few hours):

```bash
nslookup www.saisocial.co.uk
```

Don't run certbot until this returns your VPS IP.

## Step 2 — open the firewall in the IONOS console

IONOS VPSs sit behind a **cloud firewall policy** that is separate from the
server's own firewall. In **IONOS Cloud Panel → Network → Firewall Policies**,
make sure inbound TCP **22, 80 and 443** are allowed. This trips almost
everyone up: nginx works fine locally, and the outside world sees nothing.

## Step 3 — base server setup

SSH in as root (IONOS emails you the credentials), then:

```bash
# Patch everything first
apt update && apt upgrade -y

# A non-root user to own and run the site
adduser --disabled-password --gecos "" sai
usermod -aG sudo sai

# Copy your SSH key over so you can log in as sai
rsync --archive --chown=sai:sai ~/.ssh /home/sai/

# Host firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# Automatic security patches — this box will be unattended
apt install -y unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
```

Then harden SSH (`/etc/ssh/sshd_config`): set `PermitRootLogin no` and
`PasswordAuthentication no`, then `systemctl restart ssh`. **Confirm you can
still log in as `sai` in a second terminal before closing the root session.**

## Step 4 — install Node 22 and nginx

Ubuntu 24.04's apt Node is 18 and ageing. Use NodeSource:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx git
node -v          # → v22.x
```

## Step 5 — deploy the code

```bash
sudo mkdir -p /srv/sai-social
sudo chown sai:sai /srv/sai-social
sudo -u sai git clone https://github.com/Sirajimran77/sai-social-website.git /srv/sai-social

cd /srv/sai-social
npm ci --omit=dev
```

Create the environment file — this is the only secret on the box:

```bash
nano /srv/sai-social/.env
```

```env
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
SITE_ORIGIN=https://www.saisocial.co.uk

TO_EMAIL=saimanagement77@gmail.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=saimanagement77@gmail.com
SMTP_PASS=your16charapppassword
FROM_EMAIL="SAI Social Website <saimanagement77@gmail.com>"
```

`SMTP_PASS` is a Gmail **App Password**, not the account password — see
[README.md](../README.md#2-turn-on-email-required-before-go-live). Lock the
file down so only the service user can read it:

```bash
chmod 600 /srv/sai-social/.env
```

Smoke-test before wiring up systemd:

```bash
cd /srv/sai-social && node server.js
# another terminal:  curl http://127.0.0.1:3000/healthz   → ok
```

You should see `✓ SMTP transport ready`. If not, fix the SMTP credentials now —
a live site with a dead booking form is worse than no site.

## Step 6 — run it as a service

```bash
sudo cp /srv/sai-social/deploy/sai-social.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now sai-social
sudo systemctl status sai-social        # → active (running)
curl http://127.0.0.1:3000/healthz      # → ok
```

Logs live in the journal: `journalctl -u sai-social -f`.

## Step 7 — nginx

```bash
sudo cp /srv/sai-social/deploy/nginx-saisocial.conf /etc/nginx/sites-available/saisocial
sudo ln -s /etc/nginx/sites-available/saisocial /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Visit `http://www.saisocial.co.uk` — the site should load over plain HTTP. If
it doesn't, the problem is DNS (step 1) or the IONOS firewall (step 2), not
nginx.

## Step 8 — HTTPS

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d saisocial.co.uk -d www.saisocial.co.uk \
  --agree-tos -m saimanagement77@gmail.com --redirect
```

Certbot edits the nginx config in place, adds the certificates and the
HTTP→HTTPS redirect, and installs a renewal timer. Verify the timer:

```bash
systemctl list-timers | grep certbot
sudo certbot renew --dry-run
```

**Only now is HSTS live.** `NODE_ENV=production` sends
`Strict-Transport-Security` with a one-year max-age — browsers that see it will
refuse plain HTTP for this domain for a year. That's correct once the
certificate works, and painful if you set it before. Don't enable production
mode until step 8 passes.

## Step 9 — verify the whole thing

```bash
curl -I https://www.saisocial.co.uk/                 # 200, HSTS header present
curl -I https://saisocial.co.uk/                     # 308 → www
curl -I http://www.saisocial.co.uk/                  # 301 → https
curl -s https://www.saisocial.co.uk/robots.txt       # Sitemap: https://www.saisocial.co.uk/sitemap.xml
curl -s https://www.saisocial.co.uk/sitemap.xml      # real URLs, not localhost
curl -s https://www.saisocial.co.uk/pricing.md       # Bronze/Silver/Gold
curl -I https://www.saisocial.co.uk/nope             # 404, not 200
```

Then in a browser:

- **Submit the booking form** and confirm the email lands in
  saimanagement77@gmail.com. This is the one test that actually matters — it's
  the only conversion path on the site.
- Open the quiz, the FAQ page, `/about`, `/privacy`, `/example-audit`.
- Check it on a phone — the mobile menu, the process carousel and the sticky
  booking CTA.
- Confirm the page loader clears (no black overlay) and no CSP errors in the
  browser console.

## Step 10 — after launch

1. **Google Search Console** — add `https://www.saisocial.co.uk`, verify by DNS
   TXT record at names.co.uk, submit `/sitemap.xml`.
2. **Bing Webmaster Tools** — import from Search Console, one click. Bing feeds
   Copilot, so this is part of the AI-visibility play.
3. **Google Business Profile** — the highest-leverage item on this list for a
   local Newcastle service business, and a heavily-weighted source for AI
   answers. Do it the same week.
4. **Uptime monitoring** — point a free UptimeRobot check at
   `https://www.saisocial.co.uk/healthz`, 5-minute interval, alerting to your
   phone. A dead site you don't know about costs more than the VPS does.
5. **Analytics** — nothing is currently installed, so nothing is being
   measured. If you add any (Plausible, Fathom, GA4), the CSP in `server.js`
   will block it until you add the script and connect hosts to `script-src`
   and `connect-src`.

---

## Deploying updates later

```bash
ssh sai@YOUR.VPS.IP
cd /srv/sai-social && ./deploy/update.sh
```

That pulls, reinstalls production dependencies, restarts the service and fails
loudly if the site doesn't come back.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Site unreachable, nginx running | IONOS cloud firewall (step 2) — separate from ufw |
| certbot: "challenge failed" | DNS hasn't propagated, or a names.co.uk web-forwarding record is overriding the A record |
| 502 Bad Gateway | The Node service is down — `journalctl -u sai-social -n 50` |
| Booking form returns 403 | `SITE_ORIGIN` doesn't match the URL in the browser (e.g. apex vs www) |
| Form succeeds, no email arrives | SMTP not configured; enquiries are being logged instead — check the journal |
| Everything 404s except `/` | nginx `sites-enabled/default` still linked, shadowing this config |
| Browser refuses HTTP after a mistake | HSTS is cached — clear it at `chrome://net-internals/#hsts` |
