/* ==========================================================================
   SAI Social. "More customers, not more followers". Front-end logic
   ========================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- DATA */
  // Three pillars. Replaces the old seven-service accordion. See
  // docs/superpowers/specs/2026-08-05-horizontal-repositioning-design.md
  const services = [
    {
      n: '01', title: 'Social', tag: 'Content · Community',
      blurb: 'Short-form video that stops the scroll, plus the profile and community work that turns a viewer into a customer instead of a follower.',
      points: ['20+ short-form videos per month', 'Profile optimisation across every platform', 'Community management: comments, DMs, replies', 'Strategy and research built on your market', 'Performance review in plain numbers'],
      outcome: 'Content that brings people in, not just eyes',
    },
    {
      n: '02', title: 'Web', tag: 'Build · SEO · Tracking',
      blurb: 'The place every click has to land. A fast, striking site wired to search, email and a dashboard that shows you what actually happened.',
      points: ['Full website design and build', 'SEO that compounds long after the ads stop', 'Google Business Profile setup and optimisation', 'Email marketing that reactivates old customers', 'Client dashboard and tracking, wired end to end'],
      outcome: 'Every click has somewhere to go, and gets counted',
    },
    {
      n: '03', title: 'Paid Ads', tag: 'Meta · Google · TikTok',
      blurb: 'Budget pointed at people who are ready to buy. We write the strategy, film the ads ourselves, and cut whatever stops working.',
      points: ['Ad strategy tied to a real offer', 'Ads filmed in-house, never outsourced', 'Google Search & Performance Max for buying intent', 'Meta and TikTok for demand you have to create', 'Performance review every month, no jargon'],
      outcome: 'Spend that comes back, tracked to the sale',
    },
  ];

  // What we report back, in plain language. These are our reporting commitments, not
  // performance claims. We have no aggregate client results to publish yet. The
  // invented figures that used to sit here are parked in content/parked-social-proof.md.
  const stats = [
    { n: '01', v: 'Customers', l: 'Bookings, orders and enquiries. Counted, not estimated.' },
    { n: '02', v: 'Cost per customer', l: 'What each one actually cost you to win, channel by channel.' },
    { n: '03', v: 'Return on ad spend', l: 'Revenue back for every pound that went out.' },
    { n: '04', v: 'Against your baseline', l: 'Every number sits next to the one we wrote down on day one.' },
  ];

  const steps = [
    { k: '01', w: 'Baseline', d: "Before we touch anything, we record what you're doing now: bookings, orders, enquiries, revenue, where traffic comes from. Agreed in writing. This is the number the guarantee is measured against." },
    { k: '02', w: 'Audit', d: 'A full channel-by-channel teardown of your business: social, content, website, SEO and paid, walked through live on a call. We show you exactly where customers are leaking out.' },
    { k: '03', w: 'Infrastructure', d: 'We build the plumbing most businesses are missing: a site that converts, booking or ordering that works on a phone, tracking wired end to end, and a dashboard you can actually read.' },
    { k: '04', w: 'Build', d: 'Content goes into production and ads go live. We film, edit and publish. Short-form built for your market, not recycled templates.' },
    { k: '05', w: 'Automate', d: 'Email flows, review requests, follow-ups and re-engagement run in the background. On Gold we design and build the app or custom tooling your business needs to own its customers directly.' },
    { k: '06', w: 'Improve', d: 'Every week compounds. We test, kill what flops, and pour budget into whatever is actually winning customers. Everything is reported in plain numbers against that day-one baseline.' },
  ];

  // Cost of buying each piece separately vs one retainer. Figures are LOW-END typical
  // UK freelance and SaaS rates as of Aug 2026. Deliberately conservative so the
  // comparison is defensible. They are estimates and the page says so. Do not inflate
  // them: an owner who has actually hired a videographer will know if we have.
  const buildCosts = [
    { n: 'Videographer', d: 'One shoot day a month', v: 400 },
    { n: 'Video editor', d: '20 short-form edits a month', v: 600 },
    { n: 'Social media manager', d: 'Freelance, part-time', v: 900 },
    { n: 'Website build', d: '£3,000 build, spread over a year', v: 250 },
    { n: 'SEO specialist', d: 'Local search and on-page', v: 500 },
    { n: 'Paid ads manager', d: 'Meta, Google and TikTok', v: 500 },
    { n: 'Email platform + setup', d: 'Klaviyo or Mailchimp', v: 70 },
    { n: 'Analytics & reporting', d: 'Dashboards and tracking tools', v: 120 },
    { n: 'Design & editing software', d: 'Adobe, Canva Pro, CapCut Pro', v: 60 },
  ];

  // The "I already pay someone £300 a month" objection. Deliberately framed
  // around what cheap social buys you, NOT around where the person lives.
  // The argument is stronger on outcomes and it keeps the page defensible.
  // Deliberately terse: every cell is one short line so the whole comparison
  // scans in seconds. Length here is the enemy of the argument.
  const cheapRows = [
    { l: 'What you get', a: 'Posts. Something goes up most days.', b: 'Customers, tracked to the booking or the order.' },
    { l: 'Who makes it', a: 'Someone who has never seen your business.', b: 'We film on site, in your room, with your staff.' },
    { l: 'The strategy', a: 'Whatever is trending, applied to any account.', b: 'Built on your market, your offer, your competitors.' },
    { l: 'Paid ads', a: 'A boosted post now and again, if at all.', b: 'Meta, Google and TikTok behind a real offer.' },
    { l: 'Your website', a: 'Not their problem.', b: 'Built, wired to search, pointed at a checkout.' },
    { l: 'Reporting', a: 'Views, likes and follower count.', b: 'Customers, cost per customer, revenue.' },
    { l: 'If it does not work', a: 'You keep paying £300 a month.', b: 'Month four is free. That is the Baseline Guarantee.' },
  ];

  // PRICING. This is one of FOUR places tier prices live. The others are
  // tierFor() below, the FAQ copy below, and the FAQPage JSON-LD in index.html.
  // Change one, change all four.
  //
  // The feature lists are deliberately itemised rather than summarised. A buyer
  // comparing three quotes cannot value work they can't see, and "community
  // management" hides about six separate jobs. Two hard rules when editing:
  //   1. Every line must be something we actually do. The moment one is
  //      aspirational the whole list becomes padding, and being the honest
  //      quote is the entire position.
  //   2. Nothing paid-ads-shaped may appear on Bronze. Bronze runs no ads, and
  //      the `excludes` list below says so on purpose. Naming the gap out loud
  //      is what makes the rest of the list credible.
  const tiers = [
    {
      k: 'bronze', name: 'Bronze', price: '£800', per: '/ month', featured: false,
      blurb: 'Get the content engine running and find out what your audience actually responds to.',
      groups: [
        { h: 'Content', items: [
          '8 short-form videos a month, filmed and edited by us',
          'We come to you: on-site shoot day, no stock footage',
          'Cut for Reels, TikTok and Shorts from one shoot',
          'Captions burned in as standard',
          'Licensed trending audio, so nothing gets muted or struck',
          'Cover frame designed for every video',
          'Hooks written and tested, not guessed',
          'You approve everything before it goes live',
        ] },
        { h: 'Profile & community', items: [
          'Bio, links and highlights rebuilt to convert',
          'Grid kept visually consistent',
          'Comments, DMs and replies handled daily',
          'Review responses drafted for you',
        ] },
        { h: 'Strategy & reporting', items: [
          'Competitor and market research before we shoot',
          'Content calendar planned a month ahead',
          'Posting timed to when your audience is actually awake',
          'Monthly performance report in plain numbers',
          'Your baseline recorded in writing before we start',
          'The Baseline Guarantee',
          'A direct line to the people doing the work',
          'No setup fee, no minimum term',
        ] },
      ],
      excludes: ['Paid ad management', 'Website build and SEO'],
      cta: 'Start with Bronze',
    },
    {
      k: 'silver', name: 'Silver', price: '£1,500', per: '/ month', featured: true,
      blurb: 'The full engine. Content, a site that converts, and the dashboard that proves what it did.',
      inherits: 'Everything in Bronze, plus:',
      groups: [
        { h: 'Content', items: [
          '20+ short-form videos a month',
          'Multiple shoot days, scheduled around your trading hours',
          'Stills from the same shoot, yours to keep and use anywhere',
          'Ad creative filmed in-house, never outsourced',
        ] },
        { h: 'Website & search', items: [
          'Full website design and build',
          'Mobile-first and built to load fast',
          'Booking, ordering or checkout wired in and tested',
          'Every page written for you, not filled with placeholder copy',
          'On-page SEO and technical setup',
          'Google Business Profile claimed, filled and optimised',
          'Local search and map-pack targeting',
          'Structured data so AI search engines can read and cite you',
          'Hosting, SSL and ongoing technical upkeep',
        ] },
        { h: 'Paid ads', items: [
          'Meta and TikTok campaigns',
          'Google Search and Performance Max for buying intent',
          'Retargeting for people who looked and did not book',
          'Creative built for the ad, not a recycled organic post',
          'Budget paced weekly, and the media spend stays in your account',
        ] },
        { h: 'Tracking & reporting', items: [
          'Live client dashboard, open to you 24/7',
          'Conversion tracking wired end to end',
          'Form, call and booking attribution',
          'Weekly strategy call',
          'Monthly deep-dive against your day-one baseline',
        ] },
      ],
      cta: 'Start with Silver',
    },
    {
      k: 'gold', name: 'Gold', price: 'Custom', per: '/ bespoke', featured: false,
      blurb: 'Built around you. Unlimited content, the whole brand, automation, and first call on our time.',
      inherits: 'Everything in Silver, plus:',
      groups: [
        { h: 'Content & brand', items: [
          'Unlimited tailored video',
          'Complete brand identity: logo, palette, type, guidelines',
          'Personal brand build for the owner or founder',
          'Design for print, menus and signage',
        ] },
        { h: 'Automation', items: [
          'Email marketing: campaigns, flows and list growth',
          'Automated review requests after every visit or order',
          'Follow-up and re-engagement flows for lapsed customers',
          'Abandoned booking and basket recovery',
        ] },
        { h: 'Product', items: [
          'App design and build',
          'Custom booking, ordering or loyalty tooling that you own outright',
          'Integrations with your till, booking system or store',
        ] },
        { h: 'Service', items: [
          'Priority client: you go to the front of the queue',
          'Replies the same working day',
          'Direct access to the founder',
        ] },
      ],
      cta: 'Talk to us',
    },
  ];

  /* ------------------------------------------------------ CONTACT CHANNELS */
  // Powers BOTH the desktop floating dock and the mobile burger-menu links, so
  // the two can never drift apart.
  //
  // >>> FILL THESE IN <<<
  // `whatsapp` wants the full international number, digits only, no + or
  // spaces: a UK mobile 07700 900123 becomes '447700900123'.
  // `instagram` wants the handle without the @.
  //
  // Any channel left as an empty string is SKIPPED, and if none are set the
  // dock hides itself entirely. That is deliberate: a placeholder number would
  // send real enquiries to a stranger, so it is safer to ship nothing than to
  // ship a guess.
  const CONTACT = {
    whatsapp: '447305920773', // +44 7305 920773
    instagram: 'Sirajimran.sai',
    email: 'saimanagement77@gmail.com',
  };

  // Prefilled so the conversation opens with context rather than a blank box.
  const WA_MESSAGE = 'Hi SAI Social, I found you through your website and I would like to ask about growing my business.';

  const ICONS = {
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.87 1.21 3.07.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.12-.27-.2-.57-.34M12.05 21.8h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26C2.16 6.46 6.6 2.02 12.05 2.02c2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.69 1.45c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41Z"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2.5" y="2.5" width="19" height="19" rx="5.5"></rect><circle cx="12" cy="12" r="4.2"></circle><circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none"></circle></svg>',
    email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="2"></rect><path d="M3 6l9 6.5L21 6"></path></svg>',
  };

  // Built once, consumed by the dock and the mobile menu.
  const contactChannels = [
    CONTACT.whatsapp && {
      k: 'whatsapp', label: 'WhatsApp', sub: 'Fastest reply',
      href: `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(WA_MESSAGE)}`,
      ext: true,
    },
    CONTACT.instagram && {
      k: 'instagram', label: 'Instagram', sub: `@${CONTACT.instagram.replace(/^@/, '')}`,
      href: `https://instagram.com/${CONTACT.instagram.replace(/^@/, '')}`,
      ext: true,
    },
    CONTACT.email && {
      k: 'email', label: 'Email', sub: CONTACT.email,
      href: `mailto:${CONTACT.email}`, ext: false,
    },
  ].filter(Boolean);

  // Case study + testimonials removed until there are real client results to publish.
  // Restore instructions and the original markup: content/parked-social-proof.md

  // The three people a client actually deals with — named, pictured, contactable.
  // `w` is what they own week to week. Everyone else works behind them (see `crew`).
  const team = [
    { i: 'SI', n: 'Siraj Imran', r: 'Founder / Strategy', img: 'assets/team-siraj.jpg',
      w: 'Your first call, your strategy and your numbers. Runs the audit and the monthly review.',
      gold: true },
    { i: 'TI', n: 'Tayyab I.', r: 'Content Director',
      w: 'Runs your shoot days and signs off every video before it goes near your account.' },
    { i: 'EK', n: 'Ethan K.', r: 'Paid Media Lead', img: 'assets/team-ethan.jpg',
      w: 'Owns your ad spend across Meta, TikTok and Google. Reports what each customer cost.' },
  ];

  // The bench. Deliberately unnamed — clients never have to chase them, and the three
  // above stay the only contacts. Roles only, no invented headcounts.
  const crew = [
    { r: 'Video editors',        d: 'Turning shoot days into 20+ finished cuts a month' },
    { r: 'Videographers',        d: 'Second camera and overflow shoots when a launch needs it' },
    { r: 'Design & motion',      d: 'Titles, captions, thumbnails, ad creative and brand assets' },
    { r: 'Web & development',    d: 'Builds, landing pages, tracking and the client dashboard' },
    { r: 'SEO & copy',           d: 'Local search, Google Business Profile, page and ad copy' },
  ];

  const auditData = [
    { n: '01', cat: 'Google Business Profile', q: 'How complete and active is your Google Business Profile?', opts: ["No profile, or it's unclaimed", 'Claimed but missing hours, photos or links', 'Complete, but no posts in the last 30+ days', 'Complete, but photos are stale or low quality', 'Complete, active, high-quality photos, categories optimised'] },
    { n: '02', cat: 'Reviews & Reputation', q: 'What best describes your review rating and activity?', opts: ['Under 4.0 stars, or fewer than 20 reviews', '4.0–4.3 stars, new reviews come in slowly', '4.3–4.6 stars, we reply to some reviews', '4.6+ stars, steady new reviews, we reply consistently', '4.7+ stars with a clear system driving new reviews'] },
    { n: '03', cat: 'Website & Conversion', q: 'How easy is it to book, order or buy from you online?', opts: ["No website, or it's broken/outdated", 'Website exists, but no clear call to action up top', 'CTA is there, but the flow is clunky or multi-step', 'Clean flow, but not great on mobile', 'Fast, mobile-first, one-tap booking or checkout'] },
    { n: '04', cat: 'Social Content', q: 'How would you describe your Instagram/TikTok activity?', opts: ['Inactive: no post in 30+ days, or no account', 'Posting, but mostly stills and flyers', 'Decent photo content, but no Reels/video', 'Reels exist, but posting is inconsistent / low engagement', 'Consistent Reels/TikTok with real engagement and a clear system'] },
    { n: '05', cat: 'Paid Ads Presence', q: "What's your current paid advertising setup?", opts: ['No paid ads running anywhere', 'Only the occasional boosted post', 'Some Meta ads running, but no clear offer/targeting', 'Active Meta or TikTok ads tied to real offers', 'Multi-channel (Meta + Google Search/PMax) with retargeting'] },
  ];

  const privacySections = [
    { n: '01', h: 'Who we are', body: 'SAI Social ("we", "us", "our") is a UK-based marketing agency working with hospitality and events businesses. For the purposes of the UK GDPR and the Data Protection Act 2018, SAI Social is the "data controller" responsible for the personal information collected through this website. If you have any questions about this policy or how we handle your data, you can reach us using the contact details at the end of this page.' },
    { n: '02', h: 'Information we collect', body: 'When you submit an enquiry or booking request through this site, we collect the details you choose to provide: typically your name, email address, phone number, business or venue name, and any message or project details you send us. We also collect limited technical information automatically, such as your IP address, browser type, device information, and how you interact with the site, which is used to keep the site secure and working properly.' },
    { n: '03', h: 'How we use your information', body: 'We use your information to respond to your enquiry, arrange calls or meetings, prepare proposals, and provide our marketing services if you become a client. We rely on the following lawful bases under the UK GDPR: your consent (when you submit the enquiry form), the performance of a contract (to deliver services you have requested), and our legitimate interests (to run, secure, and improve our business). We only send marketing communications where you have agreed to receive them, and you can opt out at any time.' },
    { n: '04', h: 'Cookies & tracking', body: 'This site uses only the cookies and similar technologies necessary for it to function and to help us understand how visitors use it. We do not use intrusive tracking, and we will not set non-essential or advertising cookies without your consent. You can control or delete cookies through your browser settings; disabling essential cookies may affect how the site works.' },
    { n: '05', h: 'Sharing & third parties', body: 'We do not sell your personal information. We share it only where necessary with trusted service providers who help us operate, for example our email and hosting providers, which process enquiry submissions on our behalf. These providers act on our instructions under appropriate agreements. We may also disclose information where required to comply with the law or to protect our legal rights.' },
    { n: '06', h: 'International transfers', body: 'Some of our service providers may store or process data outside the UK. Where personal data is transferred internationally, we take steps to ensure it is protected by an adequate level of safeguards, such as UK adequacy regulations or the International Data Transfer Agreement / Addendum, in line with UK data protection law.' },
    { n: '07', h: 'Data retention', body: 'We keep enquiry and contact information only for as long as needed to respond to you and, where relevant, to manage our working relationship. If you do not become a client, we typically delete or anonymise enquiry data within a reasonable period. Where you become a client, we retain records for as long as necessary to meet legal, accounting, and tax obligations.' },
    { n: '08', h: 'Data security', body: 'We take appropriate technical and organisational measures to protect your personal information against loss, misuse, and unauthorised access, including encrypted connections and restricted access to enquiry data. While no method of transmission over the internet is completely secure, we work to safeguard your information and to respond promptly to any incident.' },
    { n: '09', h: 'Your rights', body: 'Under UK data protection law you have the right to access your personal data, to have inaccurate data corrected, to request erasure, to restrict or object to processing, and to data portability, as well as the right to withdraw consent at any time. To exercise any of these rights, contact us using the details below and we will respond within one month. If you are unhappy with how we handle your data, you have the right to complain to the Information Commissioner’s Office (ICO) at ico.org.uk.' },
  ];

  // FAQ copy MUST stay in sync with the FAQPage JSON-LD in index.html <head>.
  // Prices here are one of FOUR places tier pricing lives (see `tiers` above).
  const faqs = [
    { q: 'How does SAI Social actually get me more customers?', a: 'We run three things together: short-form social content that gets you seen, a website and search presence that turns interest into a booking or an order, and paid ads pointed at people who are ready to buy. Every campaign is judged on customers and revenue we can attribute. Not impressions.' },
    { q: 'Who does SAI Social work with?', a: "Most of our work is with restaurants, bars, clubs, takeaways, salons, barbershops, e-commerce businesses, brands, personal brands and agencies. That said, we're open to any business that needs more customers. If you can tell us what a customer is worth to you, we can help." },
    { q: 'How much does SAI Social cost?', a: 'Three monthly tiers. Bronze is £800/mo: 8 short-form videos a month, a performance report, growth strategy and community management. Silver is £1,500/mo: everything in Bronze plus 20+ videos a month, a full website and SEO, a client dashboard and a weekly strategy call. Gold is custom: everything in Silver plus unlimited tailored video, email marketing and automation, app design and build, a complete brand identity and personal brand build, and priority turnaround.' },
    { q: "What's the Baseline Guarantee?", a: "We write your real numbers down before we touch anything. If in 90 days they haven't moved, month four is free. Other agencies guarantee impressions. Anyone can double impressions, you can buy them for pennies. Nobody can fake a booking." },
    { q: 'Do you offer a free audit?', a: "Yes. Take the free 2-minute growth quiz on our site to score your business out of 20 and see which tier fits, with no email required. Book a call and we'll walk you through a full channel-by-channel audit of your business live on the call." },
    { q: 'Do I need to spend on ads as well?', a: "Not on Bronze. That's content, strategy and community management only. From Silver up we're running paid campaigns, and the media budget is yours and sits separately from the retainer. We'll tell you honestly what it needs to be before you commit." },
    { q: 'How quickly will I see results?', a: 'Paid campaigns can start driving enquiries within the first few weeks. Content and SEO compound more slowly and keep paying after the ad spend stops. Our model is Scale, Adapt, Improve. We test week to week, then pour budget into whatever is actually winning customers.' },
    { q: "I already pay someone £300 a month for social media. Why would I pay more?", a: "Because £300 a month usually buys posting, not customers. It typically means a few reels cut from photos you sent, by someone who has never been inside your business, with no offer behind them, no ad spend, and no tracking to tell you whether any of it worked. If yours is bringing you bookings, keep it. If you can't name a single customer it won, that's £3,600 a year buying activity rather than revenue. We film on site, run the ads, build the site the traffic lands on, and report customers and cost per customer against a baseline we record before we start." },
    { q: 'How much does a social media agency cost in the UK?', a: 'For a small UK business, freelance social media management typically runs £300–£1,200 a month, a full-service agency retainer usually starts around £1,000–£2,500 a month, and a full-time in-house social media manager costs roughly £30,000 a year, or about £3,000 a month once employer’s National Insurance and pension are included. SAI Social charges £800 a month for Bronze and £1,500 for Silver, with media budget paid separately by the client. Buying the same stack piece by piece (videographer, editor, social manager, web developer, SEO, ads manager and software) costs roughly £3,400 a month at low-end UK rates.' },
    { q: 'Do you guarantee results?', a: "We guarantee the Baseline Guarantee: we record your real numbers in writing before any work starts, and if they haven't moved in 90 days, month four is free. We do not guarantee impressions, views or follower counts. Those are the easiest numbers in marketing to move and the least connected to revenue. Any agency guaranteeing a view count is guaranteeing the thing that costs them least to deliver." },
    { q: 'Is there a contract or minimum term?', a: 'No minimum term and no setup fee. Bronze and Silver are billed monthly. Gold is quoted on scope. The only thing we ask for up front is agreement on the baseline numbers, because the guarantee is measured against them.' },
  ];

  /* --------------------------------------------------------------- HELPERS */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ------------------------------------------------------------- LOADER */
  // Spinning logo shown on first paint and on client-side route changes.
  // Kept deliberately brief. It exists to cover the swap, not to make people
  // wait. The CSS carries a 3s failsafe in case anything below throws.
  const loader = $('#loader');
  let loaderTimer = null;

  function hideLoader() {
    if (!loader) return;
    loader.classList.add('is-out');
  }
  function showLoader(ms) {
    if (!loader) return;
    clearTimeout(loaderTimer);
    loader.classList.remove('is-out');
    loaderTimer = setTimeout(hideLoader, ms);
  }

  if (loader) {
    // First load: hold until the window has loaded, with a floor so it doesn't
    // flash on a warm cache and a ceiling so a slow asset can't strand it.
    const FIRST_LOAD_MIN = 550;
    const started = Date.now();
    const finish = () => setTimeout(hideLoader, Math.max(0, FIRST_LOAD_MIN - (Date.now() - started)));
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    setTimeout(hideLoader, 2500); // ceiling
  }

  /* ---------------------------------------------------------- ROUTING/VIEWS */
  const views = { home: $('#view-home'), about: $('#view-about'), faq: $('#view-faq'), privacy: $('#view-privacy') };

  // Real, crawlable URLs per view. The server (server.js) renders matching
  // <title>/description/canonical on first load; we keep them in sync during
  // client-side navigation so the rendered DOM and tab title stay correct.
  const routeMeta = {
    home:    { path: '/',        title: 'Social, Web & Paid Ads Agency | SAI Social', desc: 'SAI Social is a UK marketing agency for restaurants, bars, takeaways, salons, e-commerce and brands. Short-form video, websites, SEO and paid ads from £800/month. More customers, not more followers.' },
    about:   { path: '/about',   title: 'About SAI Social | Social, Web & Paid Ads', desc: 'Meet SAI Social, a UK performance-marketing team running social, web and paid ads for local businesses and brands. We baseline your numbers first and report in plain figures.' },
    faq:     { path: '/faq',     title: 'FAQ | Pricing, Guarantee & How We Work | SAI Social', desc: "Straight answers on what SAI Social costs, who we work with, the Baseline Guarantee, contracts, and whether a £300/month social media freelancer is worth it." },
    privacy: { path: '/privacy', title: 'Privacy Policy | SAI Social', desc: 'How SAI Social collects, uses and protects your personal data under UK GDPR and the Data Protection Act 2018.' },
  };
  const pathToView = { '/': 'home', '/about': 'about', '/faq': 'faq', '/privacy': 'privacy' };

  function applyRouteMeta(v) {
    const m = routeMeta[v]; if (!m) return;
    const url = location.origin + m.path;
    document.title = m.title;
    const set = (sel, attr, val) => { const el = document.querySelector(sel); if (el) el.setAttribute(attr, val); };
    set('meta[name="description"]', 'content', m.desc);
    set('link[rel="canonical"]', 'href', url);
    set('meta[property="og:url"]', 'content', url);
    set('meta[property="og:title"]', 'content', m.title);
    set('meta[property="og:description"]', 'content', m.desc);
    set('meta[name="twitter:title"]', 'content', m.title);
    set('meta[name="twitter:description"]', 'content', m.desc);
  }

  function setView(v, opts) {
    if (!views[v]) v = 'home';
    // Brief loader on route changes, but not on the initial render (the
    // first-load handler above already owns that one).
    const initial = opts && opts.instant;
    const changingView = views[v].hidden; // target is currently hidden => real switch
    if (!initial && changingView) showLoader(420);
    Object.keys(views).forEach((k) => { views[k].hidden = k !== v; });
    applyRouteMeta(v);
    const push = !opts || opts.push !== false;
    if (push && routeMeta[v] && location.pathname !== routeMeta[v].path) {
      history.pushState({ view: v }, '', routeMeta[v].path);
    }
    closeMenu();
    window.scrollTo({ top: 0, behavior: (opts && opts.instant) ? 'auto' : 'smooth' });
    runReveal();
    if (typeof updateCta === 'function') updateCta();
  }

  // Back/forward buttons.
  window.addEventListener('popstate', () => {
    setView(pathToView[location.pathname] || 'home', { push: false, instant: true });
  });

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
  // The menu overlays the page (position:fixed) instead of pushing it down.
  // A backdrop element is created on open so taps outside close it.
  const burger = $('#burger');
  const mobileMenu = $('#mobileMenu');
  let menuBackdrop = null;

  function closeMenu() {
    if (mobileMenu.hidden) return;
    mobileMenu.hidden = true;
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (menuBackdrop) { menuBackdrop.remove(); menuBackdrop = null; }
  }
  function openMenu() {
    mobileMenu.hidden = false;
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    menuBackdrop = document.createElement('div');
    menuBackdrop.className = 'menu-backdrop';
    menuBackdrop.addEventListener('click', closeMenu);
    document.body.appendChild(menuBackdrop);
  }
  burger.addEventListener('click', () => {
    if (mobileMenu.hidden) openMenu(); else closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });

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
  // Stats: reporting commitments. Label-led, not giant display numbers: these are
  // words, and the old huge-numeral treatment broke them out of their boxes.
  $('#statsGrid').innerHTML = stats.map((s) =>
    `<div class="stat">
       <span class="stat-n">${esc(s.n)}</span>
       <span class="stat-v">${esc(s.v)}</span>
       <span class="stat-l">${esc(s.l)}</span>
     </div>`).join('');

  // Steps (home + about): horizontal carousel on narrow screens, grid above.
  const stepHtml = steps.map((s) =>
    `<div class="step"><span class="step-k">${esc(s.k)}</span><span class="step-w">${esc(s.w)}</span><p class="step-d">${esc(s.d)}</p></div>`).join('');
  $('#stepsGrid').innerHTML = stepHtml;
  $('#stepsGridAbout').innerHTML = stepHtml;

  // "£300 a month" comparison table
  const cheapTable = $('#cheapTable');
  if (cheapTable) {
    // One column header on desktop; the per-cell tags below take over once the
    // grid collapses to a single column and the header would lose its meaning.
    const head = `
      <div class="cheap-row cheap-head" aria-hidden="true">
        <div class="cheap-label"></div>
        <div class="cheap-a">£300 a month</div>
        <div class="cheap-b">SAI Social</div>
      </div>`;
    cheapTable.innerHTML = head + cheapRows.map((r) => `
      <div class="cheap-row">
        <div class="cheap-label">${esc(r.l)}</div>
        <div class="cheap-a"><span class="cheap-tag">£300/mo</span>${esc(r.a)}</div>
        <div class="cheap-b"><span class="cheap-tag cheap-tag-us">SAI Social</span>${esc(r.b)}</div>
      </div>`).join('');
  }

  // Cost comparison: what the same stack costs bought piece by piece.
  const costList = $('#costList');
  if (costList) {
    const fmt = (n) => '£' + n.toLocaleString('en-GB');
    const total = buildCosts.reduce((t, c) => t + c.v, 0);
    costList.innerHTML = buildCosts.map((c) => `
      <div class="cost-row">
        <div class="cost-row-main">
          <span class="cost-n">${esc(c.n)}</span>
          <span class="cost-d">${esc(c.d)}</span>
        </div>
        <span class="cost-v">${fmt(c.v)}<span class="cost-pm">/mo</span></span>
      </div>`).join('');
    const totalEl = $('#costTotal');
    if (totalEl) totalEl.textContent = fmt(total);
    const saveEl = $('#costSaving');
    if (saveEl) saveEl.textContent = fmt(total - 1500);
  }

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

  // FAQ accordion (reuses the .acc-* styling from the services accordion)
  const faqAcc = $('#faqAccordion');
  if (faqAcc) {
    faqAcc.innerHTML = faqs.map((f, i) => `
      <div class="acc-item" data-idx="${i}">
        <button class="acc-head" aria-expanded="false">
          <span class="acc-title" style="font-size:clamp(1.05rem,2.4vw,1.5rem)">${esc(f.q)}</span>
          <span class="acc-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.4"><path d="M12 5v14M5 12h14"></path></svg></span>
        </button>
        <div class="acc-panel">
          <div class="acc-panel-inner" style="grid-template-columns:1fr">
            <p class="acc-blurb" style="max-width:70ch;margin:0">${esc(f.a)}</p>
          </div>
        </div>
      </div>`).join('');
    faqAcc.addEventListener('click', (e) => {
      const head = e.target.closest('.acc-head');
      if (!head) return;
      const item = head.parentElement;
      const isOpen = item.classList.contains('open');
      $$('.acc-item', faqAcc).forEach((it) => {
        it.classList.remove('open');
        $('.acc-head', it).setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) { item.classList.add('open'); head.setAttribute('aria-expanded', 'true'); }
    });
  }

  // Work wall: examples of the kind of content we shoot, carrying NO metrics.
  // We have no client results; nothing here is presented as one. Deliberately
  // photographic/documentary rather than stylised. See CLAUDE.md before
  // regenerating.
  const wallImgs = [
    { f: 'barber-cut', a: 'A barber working on a fade in an independent barbershop' },
    { f: 'cocktail-pour', a: 'A bartender straining a cocktail into a glass' },
    { f: 'takeaway-hands', a: 'A takeaway order handed across the counter to a customer' },
    { f: 'salon-blowdry', a: 'A stylist finishing a blow-dry in a hair salon' },
    { f: 'product-pack', a: 'Hands packing an online order into a mailer' },
    { f: 'gym-lift', a: 'Someone mid-set on a barbell in an independent gym' },
    { f: 'cafe-latte', a: 'A barista pouring latte art in a coffee shop' },
    { f: 'retail-rail', a: 'A customer browsing a rail in an independent boutique' },
    { f: 'creator-phone', a: 'A business owner filming a piece to camera on a phone' },
  ];
  const wallRow = $('#wallRowA');
  if (wallRow) {
    // Rendered twice so the marquee can loop seamlessly at -50%.
    const cell = (im) =>
      `<figure class="wall-cell"><img src="assets/wall/${esc(im.f)}.jpg" alt="${esc(im.a)}" width="520" height="920" loading="lazy" decoding="async"></figure>`;
    wallRow.innerHTML = wallImgs.map(cell).join('') + wallImgs.map(cell).join('');
  }

  // Pricing tiers
  const tierGrid = $('#tierGrid');
  if (tierGrid) {
    // Grouped feature lists. The subheads are what stop a 20-item list reading
    // as padding: they let someone scan for the thing they care about (the
    // website, the ads) instead of wading through one undifferentiated column.
    const groupHtml = (g) => `
      <li class="tier-group">
        <span class="tier-group-h">${esc(g.h)}</span>
        <ul class="tier-sub">${g.items.map((p) =>
          `<li><span class="check">✓</span>${esc(p)}</li>`).join('')}</ul>
      </li>`;

    // Stated exclusions, not omissions. Bronze runs no ads and saying so is
    // more persuasive than quietly leaving it off the list.
    const excludeHtml = (t) => (t.excludes && t.excludes.length ? `
      <li class="tier-group tier-group-neg">
        <span class="tier-group-h">Not on this tier</span>
        <ul class="tier-sub">${t.excludes.map((p) =>
          `<li><span class="cross" aria-hidden="true">✕</span>${esc(p)}</li>`).join('')}</ul>
      </li>` : '');

    // The first group stays visible; the rest sit in a <details>. On desktop
    // that element is rendered open so the full list reads as one column, which
    // is the whole point of itemising it. On phones the cards live in a
    // horizontal swipe track, and a 1,600px card two screens tall hides the
    // swipe affordance entirely, so there it collapses. Rendered open by
    // default so a JS failure leaves everything readable rather than hidden.
    tierGrid.innerHTML = tiers.map((t) => {
      const [first, ...rest] = t.groups;
      const restHtml = rest.map(groupHtml).join('') + excludeHtml(t);
      const count = t.groups.reduce((n, g) => n + g.items.length, 0)
        + (t.excludes ? t.excludes.length : 0);
      return `
      <div class="tier${t.featured ? ' tier-featured' : ''}">
        ${t.featured ? '<span class="tier-badge">Most popular</span>' : ''}
        <div class="tier-name tier-name-${esc(t.k)}">${esc(t.name)}</div>
        <div class="tier-price"><span class="tier-price-v">${esc(t.price)}</span><span class="tier-price-p">${esc(t.per)}</span></div>
        <p class="tier-blurb">${esc(t.blurb)}</p>
        ${t.inherits ? `<p class="tier-inherits">${esc(t.inherits)}</p>` : ''}
        <ul class="tier-points">${groupHtml(first)}</ul>
        <details class="tier-more" open>
          <summary class="tier-more-s"><span>See all ${count} things included</span></summary>
          <ul class="tier-points tier-points-rest">${restHtml}</ul>
        </details>
        <a class="btn ${t.featured ? 'btn-accent' : 'btn-ghost-dark'} btn-block" data-scroll="contact">${esc(t.cta)}</a>
      </div>`;
    }).join('');

    // Collapse only where the carousel makes a tall card a problem.
    const narrow = window.matchMedia('(max-width:760px)');
    const details = $$('.tier-more', tierGrid);
    const syncTierDetails = () => {
      details.forEach((d) => { d.open = !narrow.matches; });
    };
    syncTierDetails();
    if (narrow.addEventListener) narrow.addEventListener('change', syncTierDetails);

    // Open and close all three together. The cards are equal-height siblings,
    // so expanding one on its own stretched the other two to match and left
    // them full of empty space: the tier you opened grew, the ones you were
    // trying to compare it against just got taller. `guard` stops the toggle
    // events we fire here from re-entering this handler.
    let guard = false;
    details.forEach((d) => {
      d.addEventListener('toggle', () => {
        if (guard) return;
        guard = true;
        details.forEach((other) => { if (other !== d) other.open = d.open; });
        guard = false;
      });
    });
  }

  /* --------------------------------------------------- CONTACT DOCK / MENU */
  (function contactDock() {
    if (!contactChannels.length) return; // nothing configured yet, ship nothing

    const linkHtml = (c, cls) =>
      `<a class="${cls} ${cls}-${c.k}" href="${esc(c.href)}"${c.ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>
         <span class="${cls}-i" aria-hidden="true">${ICONS[c.k]}</span>
         <span class="${cls}-t"><span class="${cls}-l">${esc(c.label)}</span><span class="${cls}-s">${esc(c.sub)}</span></span>
       </a>`;

    // Mobile: the same channels live in the burger menu.
    const mmSocial = $('#mmSocial');
    if (mmSocial) mmSocial.innerHTML = contactChannels.map((c) => linkHtml(c, 'mms')).join('');

    // Desktop: the floating dock.
    const dock = $('#contactDock');
    const panel = $('#dockPanel');
    const toggle = $('#dockToggle');
    if (!dock || !panel || !toggle) return;

    panel.innerHTML = contactChannels.map((c) => linkHtml(c, 'dockl')).join('');
    dock.hidden = false;

    const setOpen = (open) => {
      panel.hidden = !open;
      dock.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      $('.dock-label', toggle).textContent = open ? 'Close' : 'Chat';
    };

    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      setOpen(panel.hidden);
    });

    // Clicking a channel closes the dock behind it, so returning to the tab
    // doesn't land on a panel left hanging open.
    panel.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });

    document.addEventListener('click', (e) => {
      if (!panel.hidden && !dock.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); toggle.focus(); }
    });
  })();

  /* --------------------------------------------------- AMBIENT DECOR PARALLAX */
  // Drifts the background globes and orbit rings against the scroll so the
  // sections feel like they have depth rather than a flat watermark.
  //
  // Cheap on purpose. Three guards keep it that way:
  //   - an IntersectionObserver means only decor currently on screen is touched
  //   - one passive scroll listener, coalesced into a single rAF
  //   - transform only, so it never triggers layout or paint
  // Skipped entirely for reduced-motion users and on narrow screens, where the
  // effect is barely visible and the GPU budget is tighter.
  (function decorParallax() {
    const items = $$('.deco-item');
    if (!items.length) return;

    const motionOK = !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const wideOK = window.matchMedia && window.matchMedia('(min-width:761px)').matches;
    if (!motionOK || !wideOK) return;

    // Document-space anchor per item, measured once. Reading it on every frame
    // via getBoundingClientRect would force a layout each time; from a cached
    // anchor the scroll handler does pure arithmetic and touches no geometry.
    const MAX = 60; // px. Unclamped drift reached ~120px and pulled the decor
                    // visibly out of position on long sections.
    const tracked = items.map((el) => ({
      el,
      // Alternating strengths so they don't all move as one flat sheet.
      depth: (el.classList.contains('deco-globe-process') || el.classList.contains('deco-globe-contact')) ? 0.12 : 0.07,
      base: 0,
    }));

    const measure = () => {
      const y = window.scrollY || window.pageYOffset;
      tracked.forEach((t) => {
        // Neutralise any parallax already applied before measuring, or the
        // offset compounds every time we re-measure.
        t.el.style.setProperty('--par', '0px');
      });
      tracked.forEach((t) => {
        const r = t.el.getBoundingClientRect();
        t.base = r.top + y + r.height / 2;
      });
    };

    let queued = false;
    const apply = () => {
      queued = false;
      const centre = (window.scrollY || window.pageYOffset) + window.innerHeight / 2;
      for (const t of tracked) {
        let offset = (centre - t.base) * t.depth;
        if (offset > MAX) offset = MAX;
        else if (offset < -MAX) offset = -MAX;
        // A custom property rather than `transform`: it composes with the float
        // keyframes, where writing transform directly would cancel them.
        t.el.style.setProperty('--par', `${offset.toFixed(1)}px`);
      }
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => { measure(); onScroll(); }, { passive: true });
    measure();
    apply();
  })();

  /* ------------------------------------------------------- HERO ROTATOR */
  // Cycles the highlighted business type in the H1. Pauses for users who
  // have asked for reduced motion. The first word just stays put.
  const rotator = $('#heroRotator');
  if (rotator) {
    const words = ['Salon', 'Restaurant', 'Bar', 'Club', 'Takeaway', 'Barbershop', 'Store', 'Brand', 'Business'];
    rotator.innerHTML = words.map((w, i) =>
      `<span class="rot-w${i === 0 ? ' on' : ''}">${esc(w)}</span>`).join('');
    // Reserve the width of the longest word so the line never reflows.
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      const items = $$('.rot-w', rotator);
      const ROTATE_MS = 2200;
      // Short hand-off: long enough that two long words don't sit on top of
      // each other mid-crossfade, short enough that it reads as one motion
      // rather than the word blinking out and back.
      const HANDOFF_MS = 170;

      let ri = 0;
      let tickTimer = null;
      let handoffTimer = null;

      // Enforce the invariant this thing lives or dies by: exactly one word
      // carries `on`, and nothing is left `out`. Written as a toggle over every
      // item rather than an add on one of them, so the state is recomputed from
      // `ri` each time instead of accumulated. That is what makes a mis-step
      // self-correcting rather than permanent.
      //
      // It has to be airtight because `.rot-w.on` switches to position:relative:
      // two words with `on` both take up flow and render side by side, which is
      // how this surfaced ("RestaurantBrand" in the headline).
      const settle = (index) => {
        items.forEach((el, i) => {
          el.classList.toggle('on', i === index);
          el.classList.remove('out');
        });
      };

      // A strictly sequential chain, NOT setInterval. setInterval keeps its own
      // schedule, so a throttled or backgrounded tab could fire a second tick
      // inside the 170ms hand-off window. `ri` was advanced by the first tick
      // but `on` had not been applied yet, so the second tick's remove('on') hit
      // a word that did not have it, the pending hand-off then added `on` to
      // that same word, and nothing ever removed it again. Here the next tick is
      // only scheduled once the hand-off has finished, so the two can never
      // interleave and there is at most one pending timer at any moment.
      const tick = () => {
        tickTimer = null;
        const prev = items[ri];
        const nextIndex = (ri + 1) % items.length;
        prev.classList.remove('on');
        prev.classList.add('out');
        handoffTimer = setTimeout(() => {
          handoffTimer = null;
          ri = nextIndex;
          settle(ri);
          tickTimer = setTimeout(tick, ROTATE_MS - HANDOFF_MS);
        }, HANDOFF_MS);
      };

      const stop = () => {
        clearTimeout(tickTimer);
        clearTimeout(handoffTimer);
        tickTimer = handoffTimer = null;
      };
      const start = () => {
        if (!tickTimer && !handoffTimer) tickTimer = setTimeout(tick, ROTATE_MS - HANDOFF_MS);
      };

      // Don't run in a hidden tab. This removes the throttling that triggered
      // the race in the first place, and re-settling on the way back repairs
      // the half-finished hand-off we may have cut short on the way out.
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          stop();
        } else {
          settle(ri);
          start();
        }
      });

      settle(ri);
      start();
    }
  }

  // Team — the three named contacts, then the unnamed bench behind them.
  $('#teamGrid').innerHTML = team.map((m) => `
    <div class="team-card">
      ${m.img ? `<img class="team-img" src="${esc(m.img)}" alt="${esc(m.n)}, SAI Social" loading="lazy" decoding="async">` : `<span class="team-badge">${esc(m.i)}</span>`}
      <div class="team-n">${esc(m.n)}</div>
      <div class="team-r">${esc(m.r)}</div>
      <p class="team-w">${esc(m.w)}</p>
      <span class="team-tag${m.gold ? ' team-tag-gold' : ''}">Your contact</span>
    </div>`).join('');

  $('#crewList').innerHTML = crew.map((c) => `
    <li class="crew-item">
      <span class="crew-r">${esc(c.r)}</span>
      <span class="crew-d">${esc(c.d)}</span>
    </li>`).join('');

  // Privacy
  $('#privacySections').innerHTML = privacySections.map((s) =>
    `<div class="privacy-sec"><h2><span class="n">${esc(s.n)}</span>${esc(s.h)}</h2><p>${esc(s.body)}</p></div>`).join('');

  /* -------------------------------------------------------------- GROWTH QUIZ */
  const answers = [-1, -1, -1, -1, -1];
  let step = 0;
  let auditTimer = null;

  // Tier prices here MUST match the `tiers` array, the FAQ copy, and the
  // FAQPage JSON-LD in index.html. Four places. Change one, change all four.
  function tierFor(score) {
    if (score <= 8) return { name: 'Bronze', price: '£800 / month', blurb: "The fundamentals are leaking customers. We get the content engine running and the basics fixed first: 8 videos a month, a growth strategy and community management, so we can see what your audience actually responds to." };
    if (score <= 14) return { name: 'Silver', price: '£1,500 / month', blurb: "Your basics are solid. Now we scale. 20+ videos a month, a full website and SEO, a client dashboard and a weekly strategy call turn steady interest into customers you can count." };
    return { name: 'Gold', price: 'Custom', blurb: "You're already doing a lot right. Gold is built around you: unlimited tailored video, email marketing, a complete brand identity and priority turnaround, all of it aimed at compounding your advantage and owning your market." };
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
  });
  renderAudit();

  /* --------------------------------------------------------- QUIZ MODAL */
  // The quiz is now a dismissible popup rather than a page section. It opens
  // itself once per browser for first-time visitors, and any [data-quiz]
  // control opens it on demand after that.
  const quizModal = $('#quizModal');
  if (quizModal) {
    const SEEN_KEY = 'sai_quiz_seen';
    let lastFocus = null;

    const seen = () => {
      try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return false; }
    };
    const markSeen = () => {
      try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* private mode, fine */ }
    };

    function openQuiz() {
      if (!quizModal.hidden) return;
      lastFocus = document.activeElement;
      quizModal.hidden = false;
      document.body.classList.add('modal-open');
      markSeen();
      const close = $('.modal-close', quizModal);
      if (close) close.focus();
    }
    function closeQuiz() {
      if (quizModal.hidden) return;
      quizModal.hidden = true;
      document.body.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.addEventListener('click', (e) => {
      if (e.target.closest('[data-quiz]')) { e.preventDefault(); closeMenu(); openQuiz(); return; }
      if (e.target.closest('[data-quiz-close]')) { e.preventDefault(); closeQuiz(); }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeQuiz();
    });
    // Keep tab focus inside the dialog while it's open.
    quizModal.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const f = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', quizModal)
        .filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // First-time visitors: offer it once they've shown a little intent.
    // whichever comes first, 15s or a third of the way down the page.
    if (!seen()) {
      let fired = false;
      const auto = () => {
        if (fired || seen()) return;
        fired = true;
        window.removeEventListener('scroll', onScroll);
        openQuiz();
      };
      const onScroll = () => {
        const depth = (window.scrollY + window.innerHeight) / document.body.scrollHeight;
        if (depth > 0.33) auto();
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      setTimeout(auto, 15000);
    }
  }

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

  // Stamped when the page loads and sent with the submission. The server
  // treats a sub-3-second completion as a bot. See /api/booking in server.js.
  const formLoadedAt = Date.now();

  // Same shape as the server's check, so an obvious typo is caught here rather
  // than costing a round trip. The server still validates: this is UX, not
  // security, and anything client-side can be bypassed.
  const looksLikeEmail = (v) => /^[^\s@,;<>"]+@[^\s@,;<>"]+\.[^\s@,;<>"]{2,}$/.test(v);

  const INBOX = 'saimanagement77@gmail.com';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.hidden = true;

    const data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.venue || !data.email) {
      showError('Please fill in your name, business and email.');
      return;
    }
    if (!looksLikeEmail(data.email.trim())) {
      showError("That email address doesn't look right. Please check it and try again.");
      return;
    }
    data.t = formLoadedAt;

    submitBtn.disabled = true;
    const originalHtml = submitBtn.innerHTML;
    submitBtn.textContent = 'Sending…';

    try {
      // Don't hang forever on a dead network: fail with a usable message and
      // give them the inbox address instead.
      const ctl = new AbortController();
      const timeout = setTimeout(() => ctl.abort(), 15000);
      let res;
      try {
        res = await fetch('/api/booking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          signal: ctl.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        // Surface the server's own wording where it has some (bad email,
        // rate limited). A generic "something went wrong" for a rate limit
        // just makes people submit again and dig deeper into the limit.
        throw new Error(json.error || '');
      }
      form.hidden = true;
      $('#formSuccess').hidden = false;
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHtml;
      const detail = err && err.message ? err.message : '';
      showError(detail || `Something went wrong sending your details. Please try again, or email us at ${INBOX}.`);
    }
  });

  $('#formReset').addEventListener('click', () => {
    form.reset();
    form.hidden = false;
    $('#formSuccess').hidden = true;
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Book my free audit call <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M7 17L17 7M17 7H8M17 7V16"></path></svg>';
  });

  function showError(msg) { errorBox.textContent = msg; errorBox.hidden = false; }

  // Establish the initial view from the URL (server serves the SPA shell for
  // /about and /privacy). This also sets the sticky CTA state via setView().
  setView(pathToView[location.pathname] || 'home', { push: false, instant: true });
})();
