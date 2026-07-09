/* ==========================================================================
   SAI Social — "Fill The Room" — front-end logic
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- DATA */
  const services = [
    { n: '01', title: 'Meta Paid Ads', tag: 'FB · Instagram', blurb: "Geo-targeted ad systems that put your venue in front of the right locals at the exact moment they're deciding where to go tonight.", points: ['Hyper-local + lookalike targeting', 'Scroll-stopping video & story creative', 'Event, booking & guest-list campaigns', 'Retargeting for walk-ins and regulars'], outcome: 'More covers, lower cost per booking' },
    { n: '02', title: 'Google & Search Ads', tag: 'Search · PMax', blurb: 'Capture the people already searching "bars near me" and "book a table tonight" before your competitor does.', points: ['Intent-based search campaigns', 'Google Maps & local pack visibility', 'Call & reservation tracking', 'Performance Max for reach'], outcome: 'Own the moment of decision' },
    { n: '03', title: 'Reels & Short-Form', tag: 'Content', blurb: 'We shoot and edit content that sells the atmosphere — the room, the pour, the crowd — so people feel the night before they arrive.', points: ['On-site shoot days', 'Weekly Reels & Stories', 'Hooks engineered for reach', 'Trend-native editing'], outcome: 'Content that makes people show up' },
    { n: '04', title: 'TikTok Content', tag: 'FYP', blurb: 'Native TikTok content that rides local trends and lands your venue on the For You Page of everyone in a 10-mile radius.', points: ['Trend-jacking strategy', 'Creator-style native edits', 'Sound & hashtag targeting', 'Cadence that compounds'], outcome: 'From unknown to unmissable' },
    { n: '05', title: 'Promoter & Influencer', tag: 'Network', blurb: 'We plug your night into a network of local tastemakers and promoters who bring the right crowd through the door.', points: ['Vetted local creator matching', 'Guest-list & comp management', 'Content deliverables built in', 'Attribution on every seat'], outcome: 'Borrowed reach, real bodies' },
    { n: '06', title: 'Websites & Bookings', tag: 'Build', blurb: 'A fast, striking site with a booking and guest-list funnel that turns a tap into a table.', points: ['Custom brutalist venue site', 'Integrated bookings / waitlist', 'Event ticketing hooks', 'Tracking wired end-to-end'], outcome: 'Every click has somewhere to go' },
    { n: '07', title: 'Local SEO & Listings', tag: 'Organic', blurb: 'Own the map pack, the reviews and the searches that bring in walk-ins long after the ad budget stops.', points: ['Google Business optimisation', 'Review generation systems', 'Local citation cleanup', 'Content that ranks'], outcome: 'Compounding foot traffic' },
  ];

  const stats = [
    { v: '+240%', l: 'Avg. increase in bookings' },
    { v: '3.2M', l: 'Local impressions / month' },
    { v: '18', l: 'Sold-out nights delivered' },
    { v: '4.8×', l: 'Return on ad spend' },
  ];

  const steps = [
    { k: '01 / Scale', w: 'Scale', d: "We build the funnel — ads, content and a booking flow — and push it to every local who'd actually show up." },
    { k: '02 / Adapt', w: 'Adapt', d: 'We test creative and offers night to night, kill what flops, and pour budget into what packs the floor.' },
    { k: '03 / Improve', w: 'Improve', d: 'Every week compounds. Fuller rooms, lower cost per cover, more regulars — reported in plain numbers.' },
  ];

  const akbarTags = ['Meta Paid Ads', 'Google Ads', 'Marketing Strategy', 'Local SEO'];
  const akbarStats = [
    { v: '+62%', l: 'Weeknight covers' },
    { v: '3.1×', l: 'Return on ad spend' },
    { v: '−34%', l: 'Cost per booking' },
  ];
  const akbarDeepDive = [
    { k: 'The challenge', h: 'Full at weekends, quiet midweek', body: "Akbar's is a well-known Glasgow name with strong Friday and Saturday trade, but Monday-to-Thursday tables sat empty. They were relying on reputation and word of mouth, with no paid acquisition and no clear picture of what was actually driving bookings." },
    { k: 'The strategy', h: 'A local demand engine, not just ads', body: "We built a full marketing strategy around midweek demand: mapping the catchment, the competitor set and the moments locals decide where to eat. We positioned Akbar's around specific occasions — after-work dinners, family midweek meals and set-menu value — instead of generic \"come in\" messaging." },
    { k: 'The execution', h: 'Paid ads wired to real bookings', body: "We ran geo-targeted Meta and Google campaigns to a tight radius around the restaurant, with creative built from real food and room footage. Every campaign fed a tracked booking funnel, so we could see cost per cover night by night and shift budget toward the offers and audiences that filled tables." },
    { k: 'The result', h: '+62% midweek covers in 90 days', body: "Within three months weeknight covers were up 62%, return on ad spend held at 3.1×, and cost per booking dropped 34% as we optimised. Akbar's now has a repeatable, measurable channel filling the nights that used to sit quiet — without discounting the brand." },
  ];

  const testimonials = [
    { q: 'Our bottomless brunch now sells out every weekend — tables booked solid before noon.', a: 'Lena F.', r: 'Owner, Maison Field', i: 'LF' },
    { q: 'We went from half-empty Thursdays to a queue down the block. SAI just gets nightlife.', a: 'Marco V.', r: 'Owner, Neon Rooms', i: 'MV' },
    { q: "The room was full before we'd even announced the lineup. That's the whole game.", a: 'Priya S.', r: 'GM, Altitude Rooftop', i: 'PS' },
    { q: "Our launch weekend sold out in 48 hours. We've never seen numbers move like this.", a: 'Danny K.', r: 'Founder, Warehouse 9', i: 'DK' },
  ];

  const team = [
    { i: 'SI', n: 'Siraj Imran', r: 'Founder / Strategy', img: 'assets/team-siraj.jpg' },
    { i: 'JR', n: 'Jordan R.', r: 'Paid Media Lead' },
    { i: 'EK', n: 'Ethan K.', r: 'Content Director', img: 'assets/team-ethan.jpg' },
    { i: 'TL', n: 'Theo L.', r: 'Web & Funnels' },
  ];

  const auditData = [
    { n: '01', cat: 'Google Business Profile', q: 'How complete and active is your Google Business Profile?', opts: ["No profile, or it's unclaimed", 'Claimed but missing hours, photos, or menu/event links', 'Complete, but no posts in the last 30+ days', 'Complete, but photos are stale or low quality', 'Complete, active, high-quality photos, categories optimized'] },
    { n: '02', cat: 'Reviews & Reputation', q: 'What best describes your review rating and activity?', opts: ['Under 4.0 stars, or fewer than 20 reviews', '4.0–4.3 stars, new reviews come in slowly', '4.3–4.6 stars, we reply to some reviews', '4.6+ stars, steady new reviews, we reply consistently', '4.7+ stars with a clear system driving new reviews'] },
    { n: '03', cat: 'Website & Booking Flow', q: 'How easy is it for someone to book a table or buy a ticket on your site?', opts: ["No website, or it's broken/outdated", 'Website exists, but no clear booking/ticket CTA up top', 'CTA is there, but the booking flow is clunky or multi-step', 'Clean booking flow, but not great on mobile', 'Fast, mobile-first, one-click booking/ticket integration'] },
    { n: '04', cat: 'Social Content', q: 'How would you describe your Instagram/TikTok activity?', opts: ['Inactive — no post in 30+ days, or no account', 'Posting, but mostly phone-shot flyers', 'Decent photo content, but no Reels/video', 'Reels exist, but posting is inconsistent / low engagement', 'Consistent Reels/TikTok with real engagement and a clear system'] },
    { n: '05', cat: 'Paid Ads Presence', q: "What's your current paid advertising setup?", opts: ['No paid ads running anywhere', 'Only the occasional boosted post', 'Some Meta ads running, but no clear offer/targeting', 'Active Meta ads tied to events or offers', 'Multi-channel (Meta + Google Search/PMax) with retargeting'] },
  ];

  const privacySections = [
    { n: '01', h: 'Who we are', body: 'SAI Social ("we", "us", "our") is a UK-based marketing agency working with hospitality and events businesses. For the purposes of the UK GDPR and the Data Protection Act 2018, SAI Social is the "data controller" responsible for the personal information collected through this website. If you have any questions about this policy or how we handle your data, you can reach us using the contact details at the end of this page.' },
    { n: '02', h: 'Information we collect', body: 'When you submit an enquiry or booking request through this site, we collect the details you choose to provide — typically your name, email address, phone number, business or venue name, and any message or project details you send us. We also collect limited technical information automatically, such as your IP address, browser type, device information, and how you interact with the site, which is used to keep the site secure and working properly.' },
    { n: '03', h: 'How we use your information', body: 'We use your information to respond to your enquiry, arrange calls or meetings, prepare proposals, and provide our marketing services if you become a client. We rely on the following lawful bases under the UK GDPR: your consent (when you submit the enquiry form), the performance of a contract (to deliver services you have requested), and our legitimate interests (to run, secure, and improve our business). We only send marketing communications where you have agreed to receive them, and you can opt out at any time.' },
    { n: '04', h: 'Cookies & tracking', body: 'This site uses only the cookies and similar technologies necessary for it to function and to help us understand how visitors use it. We do not use intrusive tracking, and we will not set non-essential or advertising cookies without your consent. You can control or delete cookies through your browser settings; disabling essential cookies may affect how the site works.' },
    { n: '05', h: 'Sharing & third parties', body: 'We do not sell your personal information. We share it only where necessary with trusted service providers who help us operate — for example our email and hosting providers, which process enquiry submissions on our behalf. These providers act on our instructions under appropriate agreements. We may also disclose information where required to comply with the law or to protect our legal rights.' },
    { n: '06', h: 'International transfers', body: 'Some of our service providers may store or process data outside the UK. Where personal data is transferred internationally, we take steps to ensure it is protected by an adequate level of safeguards, such as UK adequacy regulations or the International Data Transfer Agreement / Addendum, in line with UK data protection law.' },
    { n: '07', h: 'Data retention', body: 'We keep enquiry and contact information only for as long as needed to respond to you and, where relevant, to manage our working relationship. If you do not become a client, we typically delete or anonymise enquiry data within a reasonable period. Where you become a client, we retain records for as long as necessary to meet legal, accounting, and tax obligations.' },
    { n: '08', h: 'Data security', body: 'We take appropriate technical and organisational measures to protect your personal information against loss, misuse, and unauthorised access, including encrypted connections and restricted access to enquiry data. While no method of transmission over the internet is completely secure, we work to safeguard your information and to respond promptly to any incident.' },
    { n: '09', h: 'Your rights', body: 'Under UK data protection law you have the right to access your personal data, to have inaccurate data corrected, to request erasure, to restrict or object to processing, and to data portability, as well as the right to withdraw consent at any time. To exercise any of these rights, contact us using the details below and we will respond within one month. If you are unhappy with how we handle your data, you have the right to complain to the Information Commissioner’s Office (ICO) at ico.org.uk.' },
  ];

  /* --------------------------------------------------------------- HELPERS */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------------------------------------------------------- ROUTING/VIEWS */
  const views = { home: $('#view-home'), about: $('#view-about'), privacy: $('#view-privacy') };

  function setView(v) {
    Object.keys(views).forEach((k) => { views[k].hidden = k !== v; });
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    runReveal();
    if (typeof updateCta === 'function') updateCta();
  }

  function scrollToId(id) {
    const go = () => {
      const el = document.getElementById(id);
      if (!el) return;
      const y = el.getBoundingClientRect().top + window.scrollY - 66;
      window.scrollTo({ top: y, behavior: 'smooth' });
    };
    if (views.home.hidden) { setView('home'); setTimeout(go, 90); }
    else { closeMenu(); go(); }
  }

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { e.preventDefault(); setView(nav.getAttribute('data-nav')); return; }
    const sc = e.target.closest('[data-scroll]');
    if (sc) { e.preventDefault(); scrollToId(sc.getAttribute('data-scroll')); }
  });

  /* ------------------------------------------------------------ MOBILE MENU */
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');
  function closeMenu() { mobileMenu.hidden = true; burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', () => {
    const open = mobileMenu.hidden;
    mobileMenu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
  });

  /* ---------------------------------------------------- MOBILE STICKY CTA */
  // Keeps a persistent "Book a strategy call" button on screen for mobile
  // users. Appears once they scroll past the hero, and tucks away while the
  // contact form itself is visible so it never covers the submit button.
  const mobileCta = $('#mobileCta');
  function updateCta() {
    if (!mobileCta) return;
    // Only relevant on the home view (the form lives here); hide elsewhere.
    if (!views.home || views.home.hidden) { mobileCta.classList.remove('show'); return; }
    const scrolledPastHero = window.scrollY > window.innerHeight * 0.6;
    const contact = document.getElementById('contact');
    let contactVisible = false;
    if (contact) {
      const r = contact.getBoundingClientRect();
      contactVisible = r.top < window.innerHeight * 0.85 && r.bottom > 0;
    }
    mobileCta.classList.toggle('show', scrolledPastHero && !contactVisible);
  }
  let ctaTick = false;
  window.addEventListener('scroll', () => {
    if (ctaTick) return;
    ctaTick = true;
    requestAnimationFrame(() => { updateCta(); ctaTick = false; });
  }, { passive: true });
  window.addEventListener('resize', updateCta, { passive: true });

  /* ------------------------------------------------------------------ RENDER */
  // Stats
  $('#statsGrid').innerHTML = stats.map((s) =>
    `<div class="stat"><span class="stat-v">${esc(s.v)}</span><span class="stat-l">${esc(s.l)}</span></div>`).join('');

  // Steps (home + about)
  const stepHtml = steps.map((s) =>
    `<div class="step"><span class="step-k">${esc(s.k)}</span><p class="step-d">${esc(s.d)}</p><span class="step-w">${esc(s.w)}</span></div>`).join('');
  $('#stepsGrid').innerHTML = stepHtml;
  $('#stepsGridAbout').innerHTML = stepHtml;

  // Services accordion
  $('#servicesAccordion').innerHTML = services.map((s, i) => `
    <div class="acc-item${i === 0 ? ' open' : ''}" data-idx="${i}">
      <button class="acc-head" aria-expanded="${i === 0}">
        <span class="acc-n">${esc(s.n)}</span>
        <span class="acc-title">${esc(s.title)}</span>
        <span class="acc-tag">${esc(s.tag)}</span>
        <span class="acc-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.4"><path d="M12 5v14M5 12h14"></path></svg></span>
      </button>
      <div class="acc-panel">
        <div class="acc-panel-inner">
          <div>
            <p class="acc-blurb">${esc(s.blurb)}</p>
            <div class="acc-outcome">→ ${esc(s.outcome)}</div>
          </div>
          <ul class="acc-points">${s.points.map((p) => `<li><span class="check">✓</span>${esc(p)}</li>`).join('')}</ul>
        </div>
      </div>
    </div>`).join('');
  $('#servicesAccordion').addEventListener('click', (e) => {
    const head = e.target.closest('.acc-head');
    if (!head) return;
    const item = head.parentElement;
    const isOpen = item.classList.contains('open');
    $$('.acc-item', $('#servicesAccordion')).forEach((it) => {
      it.classList.remove('open');
      $('.acc-head', it).setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) { item.classList.add('open'); head.setAttribute('aria-expanded', 'true'); }
  });

  // Case study
  $('#caseTags').innerHTML = akbarTags.map((t) => `<span class="case-tag">${esc(t)}</span>`).join('');
  $('#caseStats').innerHTML = akbarStats.map((s) =>
    `<div class="case-stat"><div class="case-stat-v">${esc(s.v)}</div><div class="case-stat-l">${esc(s.l)}</div></div>`).join('');
  $('#caseDeep').innerHTML = akbarDeepDive.map((d) =>
    `<div class="case-deep-item"><div class="case-deep-k">${esc(d.k)}</div><div class="case-deep-h">${esc(d.h)}</div><p>${esc(d.body)}</p></div>`).join('');
  const caseToggle = $('#caseToggle');
  const caseWrap = $('#caseDeepWrap');
  caseToggle.addEventListener('click', () => {
    const open = !caseWrap.classList.contains('open');
    caseWrap.classList.toggle('open', open);
    caseWrap.style.maxHeight = open ? caseWrap.querySelector('.case-deep-inner').scrollHeight + 20 + 'px' : '0';
    caseToggle.setAttribute('aria-expanded', String(open));
    $('#caseToggleLabel').textContent = open ? 'Hide the full breakdown' : 'Read the full breakdown';
  });

  // Testimonials
  $('#testiScroll').innerHTML = testimonials.map((t) => `
    <figure class="testi">
      <blockquote>"${esc(t.q)}"</blockquote>
      <figcaption>
        <span class="testi-avatar">${esc(t.i)}</span>
        <span><span class="testi-name">${esc(t.a)}</span><span class="testi-role">${esc(t.r)}</span></span>
      </figcaption>
    </figure>`).join('');

  // Team
  $('#teamGrid').innerHTML = team.map((m) => `
    <div class="team-card">
      ${m.img ? `<img class="team-img" src="${esc(m.img)}" alt="${esc(m.n)}">` : `<span class="team-badge">${esc(m.i)}</span>`}
      <div class="team-n">${esc(m.n)}</div>
      <div class="team-r">${esc(m.r)}</div>
    </div>`).join('');

  // Privacy
  $('#privacySections').innerHTML = privacySections.map((s) =>
    `<div class="privacy-sec"><h2><span class="n">${esc(s.n)}</span>${esc(s.h)}</h2><p>${esc(s.body)}</p></div>`).join('');

  /* -------------------------------------------------------------- AUDIT QUIZ */
  const answers = [-1, -1, -1, -1, -1];
  let step = 0;
  let auditTimer = null;

  function tierFor(score) {
    if (score <= 8) return { name: 'Foundation', price: '$1,000–1,500 / mo', blurb: 'The fundamentals are leaking bookings. We lock down your Google profile, reviews and booking flow first — the fastest wins to stop losing covers you should already be getting.' };
    if (score <= 14) return { name: 'Growth', price: '$2,000–2,500 / mo', blurb: 'Your basics are solid — now we scale. Consistent content plus targeted paid ads tied to real offers turn steady traffic into a reliably fuller room, week after week.' };
    return { name: 'Full Stack', price: '$3,000–3,500 / mo', blurb: "You're already doing a lot right. We run the complete engine — multi-channel ads, content and funnels — to compound your advantage and own your local market." };
  }

  function renderAudit() {
    const score = answers.reduce((t, a) => t + (a >= 0 ? a : 0), 0);
    const answered = answers.filter((a) => a >= 0).length;
    const allDone = answered === 5;

    $('#auditScore').textContent = score;
    const box = $('#audit-box');
    const resultWrap = $('#audit-result');

    if (allDone) {
      box.hidden = true;
      resultWrap.hidden = false;
      const tier = tierFor(score);
      $('#tierName').textContent = tier.name;
      $('#tierPrice').textContent = tier.price;
      $('#tierBlurb').textContent = tier.blurb;
      $('#resultScore').textContent = score;
      $('.audit-result', resultWrap).classList.add('in');
      return;
    }

    box.hidden = false;
    resultWrap.hidden = true;
    const qd = auditData[step];
    $('#auditStepLabel').textContent = (step + 1) + ' / 5';
    $('#auditBarFill').style.width = ((step + (answers[step] >= 0 ? 1 : 0)) / 5 * 100) + '%';
    $('#auditBack').hidden = step === 0;

    const q = $('#auditQuestion');
    q.classList.remove('audit-q'); void q.offsetWidth; q.classList.add('audit-q'); // re-trigger fade
    q.innerHTML = `
      <div class="audit-cat">${esc(qd.cat)}</div>
      <div class="audit-qtext">${esc(qd.q)}</div>
      <div class="audit-opts">
        ${qd.opts.map((label, oi) => {
          const sel = answers[step] === oi;
          return `<button class="audit-opt${sel ? ' sel' : ''}" data-oi="${oi}">
            <span class="audit-badge">${oi}</span>
            <span class="audit-opt-label">${esc(label)}</span>
            <span class="audit-check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"></path></svg></span>
          </button>`;
        }).join('')}
      </div>`;
  }

  $('#auditQuestion').addEventListener('click', (e) => {
    const opt = e.target.closest('.audit-opt');
    if (!opt) return;
    const oi = parseInt(opt.getAttribute('data-oi'), 10);
    answers[step] = oi;
    renderAudit();
    if (step < 4) {
      clearTimeout(auditTimer);
      auditTimer = setTimeout(() => { step = Math.min(step + 1, 4); renderAudit(); }, 260);
    } else {
      clearTimeout(auditTimer);
      auditTimer = setTimeout(renderAudit, 260);
    }
  });
  $('#auditBack').addEventListener('click', () => { step = Math.max(step - 1, 0); renderAudit(); });
  $('#auditReset').addEventListener('click', () => {
    answers.fill(-1); step = 0; renderAudit();
    scrollToId('audit');
  });
  renderAudit();

  /* ------------------------------------------------------------ BG VIDEO */
  const bgVideo = $('#bgVideo');
  if (bgVideo) {
    bgVideo.muted = true;
    try {
      const io = new IntersectionObserver((ents) => {
        ents.forEach((en) => { if (en.isIntersecting) bgVideo.play().catch(() => {}); else bgVideo.pause(); });
      }, { threshold: 0.2 });
      io.observe(bgVideo);
    } catch (e) { bgVideo.play().catch(() => {}); }
  }

  /* -------------------------------------------------------- REVEAL ON SCROLL */
  let revealObserver;
  function runReveal() {
    const items = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('in')); return; }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver((ents, obs) => {
        ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); obs.unobserve(en.target); } });
      }, { threshold: 0.12 });
    }
    items.forEach((el) => revealObserver.observe(el));
  }
  runReveal();

  /* ------------------------------------------------------------ BOOKING FORM */
  const form = $('#bookingForm');
  const submitBtn = $('#formSubmit');
  const errorBox = $('#formError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.venue || !data.email) {
      showError('Please fill in your name, venue and email.');
      return;
    }

    submitBtn.disabled = true;
    const originalHtml = submitBtn.innerHTML;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || 'Request failed');
      form.hidden = true;
      $('#formSuccess').hidden = false;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;
      showError("Something went wrong sending your details. Please try again, or email us directly.");
    }
  });

  $('#formReset').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    $('#formSuccess').hidden = true;
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Get my free teardown <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H8M17 7V16"></path></svg>';
  });

  function showError(msg) { errorBox.textContent = msg; errorBox.hidden = false; }

  // Set the sticky CTA to its correct initial state on load.
  updateCta();
})();
