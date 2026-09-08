/**
 * HC Agency — Blog Engine (js/blog.js)
 * 
 * Features:
 * - Dynamic article fetching with API, local static JSON & offline fallbacks
 * - Interactive category filtering (All, Strategy, Conversion, Local SEO, AI & Automation)
 * - Rich Article Modal Reader with scroll-lock & keyboard navigation
 * - URL hash deep linking (#post-id)
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // XSS Protection: HTML escaping & content sanitizer
  // ---------------------------------------------------------------------------

  // Escape HTML entities in plain text fields (title, summary, author, etc.)
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Sanitize HTML content using allowlist approach (for blog post content)
  // Only permits safe tags; strips script, event handlers, and dangerous attributes
  var ALLOWED_TAGS = new Set(['P', 'H2', 'H3', 'H4', 'STRONG', 'EM', 'A', 'BLOCKQUOTE', 'CITE', 'CODE', 'UL', 'OL', 'LI', 'IMG', 'BR', 'SPAN', 'B', 'I']);
  var ALLOWED_ATTRS = { 'A': ['href', 'target', 'rel', 'class'], 'IMG': ['src', 'alt', 'class', 'loading'], 'BLOCKQUOTE': ['class'], 'SPAN': ['class'] };
  var DANGEROUS_ATTR_PATTERN = /^on/i;

  function sanitizeHtmlContent(html) {
    if (typeof html !== 'string' || !html.trim()) return '';
    try {
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      sanitizeNode(doc.body);
      return doc.body.innerHTML;
    } catch (e) {
      return escapeHtml(html);
    }
  }

  function sanitizeNode(parent) {
    var children = Array.from(parent.childNodes);
    for (var i = 0; i < children.length; i++) {
      var node = children[i];
      if (node.nodeType === 3) continue; // Text node — safe
      if (node.nodeType !== 1) { node.remove(); continue; } // Non-element — remove

      var tagName = node.tagName;
      if (!ALLOWED_TAGS.has(tagName)) {
        // Replace disallowed element with its text content
        var textNode = document.createTextNode(node.textContent || '');
        parent.replaceChild(textNode, node);
        continue;
      }

      // Remove dangerous attributes
      var attrs = Array.from(node.attributes);
      var allowedForTag = ALLOWED_ATTRS[tagName] || [];
      for (var j = 0; j < attrs.length; j++) {
        var attrName = attrs[j].name.toLowerCase();
        if (DANGEROUS_ATTR_PATTERN.test(attrName) || (allowedForTag.indexOf(attrName) === -1 && attrName !== 'class')) {
          node.removeAttribute(attrs[j].name);
        }
      }

      // For <a> tags, ensure safe href and add rel="noopener noreferrer" to external links
      if (tagName === 'A') {
        var href = node.getAttribute('href') || '';
        if (href.match(/^javascript:/i) || href.match(/^data:/i)) {
          node.removeAttribute('href');
        }
        if (href.startsWith('http')) {
          node.setAttribute('rel', 'noopener noreferrer');
          node.setAttribute('target', '_blank');
        }
      }

      // For <img> tags, validate src
      if (tagName === 'IMG') {
        var src = node.getAttribute('src') || '';
        if (!src.match(/^https?:\/\//i) && !src.match(/^[a-zA-Z0-9_\-/]+\.[a-zA-Z]{2,5}$/i)) {
          node.remove();
          continue;
        }
      }

      // Recurse into children
      sanitizeNode(node);
    }
  }

  // Fallback posts for offline or file:// protocol preview
  const FALLBACK_POSTS = [
    {
      id: "post-1788808544450",
      title: "Local SEO Playbook: How to Dominate Google Maps in 2026",
      slug: "local-seo-playbook-google-maps-2026",
      category: "Local SEO",
      readTime: "5 min read",
      date: "Sep 7, 2026",
      author: "HC AI",
      coverImage: "service-photo/3.jpg",
      inlineImages: ["service-photo/5.png"],
      summary: "Discover the proven local search signals, schema markup, and geo-targeted landing page strategies that put your business in the top 3 Google Maps pack.",
      keyTakeaways: [
        "Consistent NAP (Name, Address, Phone) citation structure across the web is crucial.",
        "LocalBusiness JSON-LD schema markup gives search engines verified entity clarity.",
        "Fast, mobile-friendly landing pages convert local map clicks into real calls and bookings."
      ],
      content: "<p>When consumers search for local restaurants, cafés, clinics, or boutique services, more than 60% of clicks go directly to the top 3 listings on the Google Maps local pack.</p><h2>1. Precise Schema Entity Data</h2><p>Google doesn't just crawl text—it looks for structured data. By adding comprehensive <code>LocalBusiness</code> JSON-LD schema containing your coordinates, hours, opening days, and service categories, your site provides immediate signals to Google's ranking algorithm.</p><h2>2. Fast Mobile Experience for Map Browsers</h2><p>Users who click from Google Maps are usually on mobile devices and ready to visit or call immediately. If your landing page takes more than 2 seconds to load or lacks a prominent click-to-call button, they will tap back and choose your nearest competitor.</p><blockquote class=\"blog-quote\">\"Dominating local search isn't luck—it's structured data, speed, and clear conversion pathways that make Google trust your business.\"<cite>— HC AI Local SEO Strategy</cite></blockquote><h2>3. Real Client Reviews & Visual Proof</h2><p>Displaying authentic customer testimonials, verified ratings, and real photography directly on your local landing pages increases inquiry conversion rates by over 35%.</p>"
    },
    {
      id: "post-1788307798475",
      title: "Why Site Speed is the #1 Secret to Ranking First on Google Local",
      slug: "why-site-speed-is-number-one-secret-ranking-google-local",
      category: "Local SEO",
      readTime: "4 min read",
      date: "Sep 2, 2026",
      author: "HC AI",
      coverImage: "service-photo/2.jpg",
      inlineImages: ["service-photo/4.png"],
      summary: "Uncover how PageSpeed scores directly influence your Google Maps ranking and why custom-coded websites outrank heavy template builders.",
      keyTakeaways: [
        "Google's Core Web Vitals directly impact search rankings on mobile devices.",
        "Custom clean code loads 3x faster than WordPress plugin-heavy sites.",
        "Higher speed leads to lower bounce rates and higher conversion rates."
      ],
      content: "<p>When potential clients search for local services in your area, Google prioritizes websites that deliver an exceptional, lightning-fast user experience.</p><h2>1. Core Web Vitals and Search Visibility</h2><p>Since Google's page experience update, loading speed is no longer optional—it is a primary ranking factor. Sites that load under 1.5 seconds earn top placement on both Google Search and Google Maps local packs.</p><h2>2. The Hidden Cost of Heavy Plugins</h2><p>Many traditional website builders rely on dozens of third-party plugins that bloat code size and slow down rendering. Custom HTML5 and optimized CSS eliminate unnecessary overhead, delivering immediate response times on mobile devices.</p><blockquote class=\"blog-quote\">\"Every half-second delay in page load time costs local businesses up to 10% of their organic conversion rate.\"<cite>— HC AI Performance Audit</cite></blockquote><h2>3. Maximize Your Search Ranking Today</h2><p>Is your website loading slowly? Contact HC Agency for a complimentary performance audit and discover how our custom web design elevates your local visibility.</p>"
    },
    {
      id: "post-1787576665827",
      title: "How Autonomous AI Assistants Are Transforming Local Client Acquisition",
      slug: "autonomous-ai-assistants-local-client-acquisition",
      category: "AI & Automation",
      readTime: "5 min read",
      date: "Aug 28, 2026",
      author: "HC AI",
      coverImage: "service-photo/1.avif",
      inlineImages: ["service-photo/6.png"],
      summary: "Discover how integrating a 24/7 AI response assistant on your website captures after-hours leads and triples appointment bookings.",
      keyTakeaways: [
        "Instant response times prevent high-intent buyers from going to competitors.",
        "Automated FAQ handling reduces support calls by up to 60%.",
        "Lead qualification happens automatically before your team even picks up the phone."
      ],
      content: "<p>Modern consumers expect immediate answers. When a prospective client visits your local business website after business hours, waiting until the next morning to respond often means losing that client to a faster competitor.</p><h2>1. The 5-Minute Window of Client Interest</h2><p>Research shows that response rates drop by over 80% if inquiry responses are delayed past 5 minutes. An integrated <strong>HC AI Assistant</strong> engages website visitors instantly, answering questions about your services, pricing guidelines, and availability 24 hours a day, 7 days a week.</p><h2>2. Qualifying Leads Before Consultation Calls</h2><p>Not all website inquiries are equal. AI automation pre-qualifies incoming prospects by asking structured questions regarding budget, timeline, and project scope. By the time you review the inquiry, you have a complete client profile ready for action.</p><blockquote class=\"blog-quote\">\"Speed is the single biggest competitive advantage in local search conversion. Autonomous AI tools turn passive traffic into confirmed appointments.\"<cite>— HC AI Growth Report</cite></blockquote><h2>3. Steps to Implement AI Automations</h2><p>Ready to upgrade your site with 24/7 client response? Explore HC Agency's custom AI integration packages tailored specifically for service providers and local brands.</p>"
    },
    {
      id: "post-1787576598715",
      title: "The Anatomy of a High-Converting Local Business Landing Page",
      slug: "anatomy-high-converting-local-business-landing-page",
      category: "Conversion",
      readTime: "6 min read",
      date: "Aug 24, 2026",
      author: "HC AI",
      coverImage: "service-photo/3.jpg",
      inlineImages: ["service-photo/5.png"],
      summary: "Learn the exact design elements, layout strategy, and call-to-action structures that turn casual website visitors into paying clients.",
      keyTakeaways: [
        "Clear value propositions above the fold capture attention instantly.",
        "Social proof and real client testimonials build immediate trust.",
        "Frictionless contact forms increase submission rates by over 40%."
      ],
      content: "<p>Driving traffic to your website is only half the battle. If your landing page design is confusing or cluttered, visitors will leave without taking action.</p><h2>1. Hero Section Clarity</h2><p>Within the first 3 seconds of landing on your page, a visitor must understand: what you do, who you serve, and how to get started. Clear typography and visual hierarchy guide the user's eye naturally.</p><h2>2. Strategic Placement of Trust Elements</h2><p>Including authentic client reviews, verified rating badges, and portfolio showcases directly alongside call-to-action buttons removes buyer friction and validates your credibility.</p><blockquote class=\"blog-quote\">\"Great web design is not just aesthetics—it is clear communication that drives business results.\"<cite>— HC AI Design Strategy</cite></blockquote><h2>3. Modernize Your Web Experience</h2><p>Elevate your local brand with a high-converting website engineered by HC Agency. Book your consultation today to get started.</p>"
    },
    {
      id: "post-1",
      title: "Why Every Local Business Needs More Than Just a Social Media Page",
      slug: "why-local-businesses-need-websites",
      category: "Strategy",
      readTime: "5 min read",
      date: "Aug 20, 2026",
      author: "HC AI",
      coverImage: "service-photo/1.avif",
      inlineImages: ["service-photo/4.png"],
      summary: "Discover why relying solely on social platforms limits your search visibility and customer trust, and how a dedicated website changes the game.",
      keyTakeaways: [
        "Social media algorithms throttle reach; a website gives you 100% organic control.",
        "Most high-intent local service searches start on Google, not social feeds.",
        "A custom website builds instant premium credibility for your local brand."
      ],
      content: "<p>In today's fast-moving digital economy, many local business owners ask: <em>\"Do I really need a website when I already have an active Instagram and Facebook page?\"</em></p><p>The simple answer is an emphatic <strong>yes</strong>. While social media is fantastic for awareness and engagement, relying exclusively on rented platforms leaves your business vulnerable to algorithm changes.</p><h2>1. Algorithm Control vs. Organic Ownership</h2><p>When you build your presence on social media platforms, you operate at the mercy of opaque algorithm updates. Overnight, your organic post reach can drop significantly unless you pay constantly for sponsored ads.</p><p>Your website is digital real estate that <strong>you own outright</strong>. Every optimization you make, every customer testimonial you add, and every SEO rank you claim builds permanent value for your brand.</p><h2>2. Search Intent: People Buy on Search</h2><p>Consider consumer psychology. When someone is casually scrolling social media, they are seeking entertainment. But when someone searches Google for local services, they possess <strong>high commercial intent</strong>—they are ready to buy.</p><blockquote class=\"blog-quote\">\"Social media gets attention, but websites close transactions. Without a fast, optimized web experience, potential customers go straight to competitors.\"<cite>— HC AI</cite></blockquote><h2>3. Premium Trust & Conversion</h2><p>A website allows you to craft a seamless user journey tailored specifically to your conversion goals—whether that's booking a phone consultation, reserving a table, or exploring detailed portfolio case studies.</p>"
    },
    {
      id: "post-2",
      title: "5 Signs Your Website Is Losing You Paying Customers",
      slug: "5-signs-website-losing-customers",
      category: "Conversion",
      readTime: "6 min read",
      date: "Aug 19, 2026",
      author: "HC AI",
      coverImage: "service-photo/2.jpg",
      inlineImages: ["service-photo/5.png"],
      summary: "Slow load times, hidden call-to-action buttons, and poor mobile formatting cause visitors to bounce directly to your competitors. Here is how to fix them.",
      keyTakeaways: [
        "Mobile traffic accounts for 70%+ of local business inquiries.",
        "A 1-second delay in page load time reduces customer conversions by up to 17%.",
        "Cluttered navigation confuses users; clear primary CTAs drive revenue."
      ],
      content: "<p>You spent effort bringing traffic to your website, but visitors leave within seconds without calling or filling out your contact form. What went wrong?</p><p>Here are the primary silent conversion killers that turn potential clients away before they ever get in touch.</p><h2>1. Page Speed Lagging Beyond 2 Seconds</h2><p>Modern web users have zero tolerance for slow load times. If your website takes more than 2.5 seconds to render interactive content, over half of your visitors will leave.</p><h2>2. Hidden Call-to-Actions (CTAs)</h2><p>When a visitor lands on your homepage, they should instantly understand what service you offer and what exact action to take next. Clear primary CTA buttons drive direct conversions.</p><h2>3. Mobile Usability Issues</h2><p>Over 70% of local service searches happen on smartphones. Ensuring smooth responsive layouts on all mobile screen sizes is mandatory for converting visitors into clients.</p>"
    }
  ];

  let allPosts = [];
  let currentCategory = 'all';

  const blogGrid = document.getElementById('blog-grid');
  const categoriesBar = document.getElementById('blog-categories');
  const articleModal = document.getElementById('article-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContent = document.getElementById('modal-body');

  async function initBlog() {
    try {
      let res;
      try {
        res = await fetch(`/api/blog?t=${Date.now()}`);
        if (!res.ok) throw new Error('API status ' + res.status);
      } catch (apiErr) {
        // Fallback to static JSON file
        res = await fetch(`data/blog.json?t=${Date.now()}`);
      }

      if (res && res.ok) {
        allPosts = await res.json();
      } else {
        allPosts = FALLBACK_POSTS;
      }
    } catch (err) {
      console.warn('[HC Blog] Using static fallback articles:', err.message);
      allPosts = FALLBACK_POSTS;
    }

    if (!Array.isArray(allPosts) || allPosts.length === 0) {
      allPosts = FALLBACK_POSTS;
    }

    renderBlogGrid();
    setupCategoryFilters();
    setupEventListeners();
    checkUrlHash();
  }

  function renderBlogGrid() {
    if (!blogGrid) return;

    const filtered = currentCategory === 'all'
      ? allPosts
      : allPosts.filter(p => (p.category || '').toLowerCase() === currentCategory.toLowerCase());

    if (filtered.length === 0) {
      blogGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--color-text-secondary);">
          <p style="font-size: 1.125rem; margin-bottom: 1rem;">No articles found in this category.</p>
          <button class="btn btn--outline" id="reset-filter-btn">Show All Articles</button>
        </div>
      `;
      const resetBtn = document.getElementById('reset-filter-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          setCategory('all');
        });
      }
      return;
    }

    blogGrid.innerHTML = filtered.map(post => `
      <article class="blog-card" data-id="${escapeHtml(post.id)}" tabindex="0" role="button" aria-label="Read: ${escapeHtml(post.title)}">
        <div class="blog-card__image-wrap">
          <img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.title)}" class="blog-card__img" loading="lazy">
          <span class="blog-card__category-badge">${escapeHtml(post.category)}</span>
        </div>
        <div class="blog-card__body">
          <div class="blog-card__meta">
            <div class="blog-card__author">
              <img src="degrade.png" alt="${escapeHtml(post.author || 'HC AI')}" class="blog-card__avatar">
              <span class="blog-card__author-name">${escapeHtml(post.author || 'HC AI')}</span>
            </div>
            <span class="blog-card__date">${escapeHtml(post.date)}</span>
          </div>

          <h2 class="blog-card__title">${escapeHtml(post.title)}</h2>
          <p class="blog-card__excerpt">${escapeHtml(post.summary)}</p>

          <div class="blog-card__footer">
            <span class="blog-card__read-time">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${escapeHtml(post.readTime)}
            </span>
            <span class="blog-card__read-btn" aria-hidden="true">
              Read Article
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </span>
          </div>
        </div>
      </article>
    `).join('');

    // Attach click and keyboard listeners to cards
    blogGrid.querySelectorAll('.blog-card').forEach(card => {
      const id = card.getAttribute('data-id');
      const post = allPosts.find(p => p.id === id);
      if (!post) return;

      const triggerOpen = () => openArticleModal(post);

      card.addEventListener('click', triggerOpen);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          triggerOpen();
        }
      });
    });
  }

  function setCategory(cat) {
    currentCategory = cat;
    if (categoriesBar) {
      categoriesBar.querySelectorAll('.blog-cat-btn').forEach(btn => {
        const matches = btn.getAttribute('data-category').toLowerCase() === cat.toLowerCase();
        btn.classList.toggle('blog-cat-btn--active', matches);
        btn.setAttribute('aria-selected', matches ? 'true' : 'false');
      });
    }
    renderBlogGrid();
  }

  function setupCategoryFilters() {
    if (!categoriesBar) return;
    categoriesBar.querySelectorAll('.blog-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-category') || 'all';
        setCategory(cat);
      });
    });
  }

  function openArticleModal(post) {
    if (!articleModal || !modalContent) return;

    const takeawaysHtml = post.keyTakeaways && post.keyTakeaways.length > 0 ? `
      <div class="modal-takeaways">
        <div class="modal-takeaways__header">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Key Takeaways
        </div>
        <ul class="modal-takeaways__list">
          ${post.keyTakeaways.map(t => `<li>${escapeHtml(t)}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    const inlineImagesHtml = post.inlineImages && post.inlineImages.length > 0 ? `
      <div class="modal-inline-media" style="margin: 2rem 0; border-radius: var(--radius-lg); overflow: hidden;">
        <img src="${escapeHtml(post.inlineImages[0])}" alt="${escapeHtml(post.title)}" class="modal-inline-img" style="width: 100%; height: auto; display: block; border-radius: var(--radius-lg);">
      </div>
    ` : '';

    modalContent.innerHTML = `
      <div class="modal-hero">
        <img src="${escapeHtml(post.coverImage)}" alt="${escapeHtml(post.title)}" class="modal-hero__img">
        <div class="modal-hero__overlay"></div>
        <span class="modal-hero__tag">${escapeHtml(post.category)}</span>
      </div>

      <div class="modal-header-info">
        <h1 class="modal-title">${escapeHtml(post.title)}</h1>
        
        <div class="modal-author-bar">
          <div class="modal-author-info">
            <img src="degrade.png" alt="HC AI" class="modal-author-avatar">
            <div>
              <div class="modal-author-name">${escapeHtml(post.author || 'HC AI')} <span class="modal-author-badge"><span class="blog-card__live-dot"></span>Official</span></div>
              <div class="modal-author-role">HC Agency Digital Strategist</div>
            </div>
          </div>
          <div class="modal-meta-details">
            <span>Published: ${escapeHtml(post.date)}</span>
            <span>•</span>
            <span>${escapeHtml(post.readTime)}</span>
          </div>
        </div>
      </div>

      ${takeawaysHtml}

      <div class="modal-body-text">
        ${sanitizeHtmlContent(post.content)}
        ${inlineImagesHtml}
      </div>

      <div class="modal-cta-box" style="margin: 2rem; padding: 2rem; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: var(--radius-xl); text-align: center;">
        <h3 style="font-size: 1.5rem; margin-bottom: 0.75rem; color: var(--color-white);">Want Custom Strategy Advice for Your Business?</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem; max-width: 500px; margin-left: auto; margin-right: auto;">HC Agency crafts bespoke digital flagship websites that turn local traffic into paying clients.</p>
        <a href="contact.html" class="btn btn--primary btn--large">Book a Free Consultation</a>
      </div>
    `;

    articleModal.classList.add('article-modal--open');
    document.body.style.overflow = 'hidden';

    // Update hash for sharing
    if (history.replaceState) {
      history.replaceState(null, '', '#' + (post.slug || post.id));
    }
  }

  function closeArticleModal() {
    if (!articleModal) return;
    articleModal.classList.remove('article-modal--open');
    document.body.style.overflow = '';

    // Remove hash
    if (history.replaceState) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }

  function checkUrlHash() {
    const hash = (window.location.hash || '').replace('#', '');
    if (hash && allPosts.length > 0) {
      const match = allPosts.find(p => p.id === hash || p.slug === hash);
      if (match) {
        openArticleModal(match);
      }
    }
  }

  function setupEventListeners() {
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeArticleModal);
    if (articleModal) {
      articleModal.addEventListener('click', (e) => {
        if (e.target === articleModal) closeArticleModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && articleModal && articleModal.classList.contains('article-modal--open')) {
        closeArticleModal();
      }
    });

    window.addEventListener('hashchange', checkUrlHash);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlog);
  } else {
    initBlog();
  }
})();
