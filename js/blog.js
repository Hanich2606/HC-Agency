/**
 * HC Agency — Automated Blog Engine (js/blog.js)
 * 
 * Renders the 2 initial HC AI articles, supports full article reading modal,
 * and maintains clean presentation.
 */

(function () {
  'use strict';

  let allPosts = [];
  const blogGrid = document.getElementById('blog-grid');
  const articleModal = document.getElementById('article-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalContent = document.getElementById('modal-body');

  const genAiBtn = document.getElementById('generate-ai-blog-btn');
  const genStatus = document.getElementById('blog-gen-status');

  async function initBlog() {
    try {
      const res = await fetch(`data/blog.json?t=${Date.now()}`);
      allPosts = await res.json();
      renderBlogGrid();
      setupEventListeners();
    } catch (err) {
      console.error('Error loading blog articles:', err);
      if (blogGrid) {
        blogGrid.innerHTML = '<div class="blog-empty">Unable to load articles at this time.</div>';
      }
    }
  }

  function renderBlogGrid() {
    if (!blogGrid) return;

    if (allPosts.length === 0) {
      blogGrid.innerHTML = '<div class="blog-empty">No articles available.</div>';
      return;
    }

    blogGrid.innerHTML = allPosts.map(post => `
      <article class="blog-card" data-id="${post.id}">
        <div class="blog-card__image-wrap">
          <img src="${post.coverImage}" alt="${post.title}" class="blog-card__img" loading="lazy">
          <span class="blog-card__category-badge">${post.category}</span>
        </div>
        <div class="blog-card__body">
          <div class="blog-card__meta">
            <div class="blog-card__author">
              <img src="degrade.png" alt="HC AI" class="blog-card__avatar">
              <span class="blog-card__author-name">${post.author || 'HC AI'}</span>
            </div>
            <span class="blog-card__date">${post.date}</span>
          </div>

          <h2 class="blog-card__title">${post.title}</h2>
          <p class="blog-card__excerpt">${post.summary}</p>

          <div class="blog-card__footer">
            <span class="blog-card__read-time">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${post.readTime}
            </span>
            <button class="blog-card__read-btn" aria-label="Read full article">
              Read Article
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      </article>
    `).join('');

    blogGrid.querySelectorAll('.blog-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const post = allPosts.find(p => p.id === id);
        if (post) openArticleModal(post);
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
          ${post.keyTakeaways.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    const inlineImagesHtml = post.inlineImages && post.inlineImages.length > 0 ? `
      <div class="modal-inline-media">
        <img src="${post.inlineImages[0]}" alt="Article visual" class="modal-inline-img">
      </div>
    ` : '';

    modalContent.innerHTML = `
      <div class="modal-hero">
        <img src="${post.coverImage}" alt="${post.title}" class="modal-hero__img">
        <div class="modal-hero__overlay"></div>
        <span class="modal-hero__tag">${post.category}</span>
      </div>

      <div class="modal-header-info">
        <h1 class="modal-title">${post.title}</h1>
        
        <div class="modal-author-bar">
          <div class="modal-author-info">
            <img src="degrade.png" alt="HC AI" class="modal-author-avatar">
            <div>
              <div class="modal-author-name">${post.author || 'HC AI'}</div>
              <div class="modal-author-role">Official HC Agency AI Strategist</div>
            </div>
          </div>
          <div class="modal-meta-details">
            <span>Published: ${post.date}</span>
            <span>•</span>
            <span>${post.readTime}</span>
          </div>
        </div>
      </div>

      ${takeawaysHtml}

      <div class="modal-body-text">
        ${post.content}
        ${inlineImagesHtml}
      </div>

      <div class="modal-cta-box">
        <h3>Want Custom Strategy Advice for Your Business?</h3>
        <p>HC Agency builds custom high-performance web platforms for growing businesses.</p>
        <a href="contact.html" class="btn btn--primary btn--large">Book a Free Consultation</a>
      </div>
    `;

    articleModal.classList.add('article-modal--open');
    document.body.style.overflow = 'hidden';
  }

  function closeArticleModal() {
    if (!articleModal) return;
    articleModal.classList.remove('article-modal--open');
    document.body.style.overflow = '';
  }

  function setupEventListeners() {
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeArticleModal);
    if (articleModal) {
      articleModal.addEventListener('click', (e) => {
        if (e.target === articleModal) closeArticleModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeArticleModal();
    });

    if (genAiBtn) {
      genAiBtn.addEventListener('click', async () => {
        try {
          genAiBtn.disabled = true;
          if (genStatus) genStatus.textContent = '🤖 HC AI is generating article...';
          
          const res = await fetch('/api/generate-blog', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
          });

          if (res.ok) {
            const data = await res.json();
            if (genStatus) genStatus.textContent = '✅ New article created!';
            setTimeout(() => { if (genStatus) genStatus.textContent = ''; }, 4000);
            await initBlog();
          } else {
            if (genStatus) genStatus.textContent = '❌ Could not generate article';
          }
        } catch (e) {
          console.error('Blog generation trigger error:', e);
          if (genStatus) genStatus.textContent = '⚠️ Generation endpoint unavailable';
        } finally {
          genAiBtn.disabled = false;
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBlog);
  } else {
    initBlog();
  }
})();
