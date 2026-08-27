/* ==========================================================================
   HC Agency — Custom AI Assistant Frontend Logic (js/assistant.js)
   ========================================================================== */

(function () {
  'use strict';

  // State Management
  const state = {
    isOpen: false,
    isWaiting: false,
    messages: [], // { role: 'user'|'assistant', content: string }
    lastFailedUserMessage: null
  };

  // DOM Elements (Initialized dynamically)
  let launcherBtn = null;
  let windowEl = null;
  let bodyEl = null;
  let inputEl = null;
  let sendBtn = null;
  let typingEl = null;

  // Initialize Assistant Component
  function initAssistant() {
    createDOMStructure();
    bindEvents();
    renderWelcomeState();
  }

  // Create HTML Structure for Launcher & Window
  function createDOMStructure() {
    // 1. Floating Launcher Button
    launcherBtn = document.createElement('button');
    launcherBtn.className = 'hc-ai-launcher';
    launcherBtn.setAttribute('aria-label', 'Open HC Agency AI Assistant');
    launcherBtn.setAttribute('aria-expanded', 'false');
    launcherBtn.innerHTML = `
      <span class="hc-ai-launcher__icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </span>
      <span>HC AI</span>
      <span class="hc-ai-launcher__badge" title="AI Consultant Online"></span>
    `;

    // 2. Chat Window Panel
    windowEl = document.createElement('div');
    windowEl.className = 'hc-ai-window';
    windowEl.setAttribute('role', 'dialog');
    windowEl.setAttribute('aria-label', 'HC Agency AI Assistant Chat');
    windowEl.innerHTML = `
      <div class="hc-ai-header">
        <div class="hc-ai-header__brand">
          <div class="hc-ai-header__avatar">HC</div>
          <div class="hc-ai-header__info">
            <span class="hc-ai-header__title">HC AI</span>
            <span class="hc-ai-header__status">
              <span class="hc-ai-header__dot"></span>
              AI Consultant
            </span>
          </div>
        </div>
        <button class="hc-ai-header__close" id="hc-ai-close" aria-label="Close Assistant">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="hc-ai-body" id="hc-ai-messages"></div>

      <div class="hc-ai-footer">
        <form class="hc-ai-input-form" id="hc-ai-form">
          <textarea class="hc-ai-input" id="hc-ai-input" placeholder="Ask about services, pricing, portfolio..." rows="1" aria-label="Message to HC AI"></textarea>
          <button type="submit" class="hc-ai-send-btn" id="hc-ai-send" aria-label="Send Message">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    `;

    document.body.appendChild(launcherBtn);
    document.body.appendChild(windowEl);

    // Bind DOM refs
    bodyEl = document.getElementById('hc-ai-messages');
    inputEl = document.getElementById('hc-ai-input');
    sendBtn = document.getElementById('hc-ai-send');
  }

  // Event Listeners
  function bindEvents() {
    launcherBtn.addEventListener('click', toggleChat);
    document.getElementById('hc-ai-close').addEventListener('click', closeChat);

    // Escape key to close
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && state.isOpen) {
        closeChat();
      }
    });

    // Form submission
    const form = document.getElementById('hc-ai-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      handleUserSubmit();
    });

    // Auto-expand textarea & Enter to send (Shift+Enter for newline)
    inputEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleUserSubmit();
      }
    });

    inputEl.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
  }

  // Toggle Chat Open/Close
  function toggleChat() {
    if (state.isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    state.isOpen = true;
    windowEl.classList.add('hc-ai-window--open');
    launcherBtn.setAttribute('aria-expanded', 'true');
    launcherBtn.classList.add('hc-ai-launcher--hidden');
    setTimeout(function () {
      inputEl.focus();
    }, 150);
  }

  function closeChat() {
    state.isOpen = false;
    windowEl.classList.remove('hc-ai-window--open');
    launcherBtn.setAttribute('aria-expanded', 'false');
    launcherBtn.classList.remove('hc-ai-launcher--hidden');
  }

  // Initial Welcome Message & Action Chips
  function renderWelcomeState() {
    const welcomeText = "Hi! I'm HC AI, HC Agency's assistant.\n\nI can help you explore our services, portfolio, pricing, or find the right solution for your project.\n\nWhat are you looking to build?";

    appendMessage('assistant', welcomeText, [
      { label: 'Explore Services', action: 'services' },
      { label: 'View Portfolio', action: 'portfolio' },
      { label: 'Pricing', action: 'pricing' },
      { label: 'Our Process', action: 'process' },
      { label: 'Start a Consultation', action: 'consultation', isCta: true }
    ]);
  }

  // Append Message to Body
  function appendMessage(role, text, quickActions = []) {
    const msgContainer = document.createElement('div');
    msgContainer.className = `hc-ai-message hc-ai-message--${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'hc-ai-message__bubble';
    bubble.innerHTML = formatMessageText(text);

    msgContainer.appendChild(bubble);

    // Quick Actions
    if (quickActions && quickActions.length > 0) {
      const actionsContainer = document.createElement('div');
      actionsContainer.className = 'hc-ai-quick-actions';

      quickActions.forEach(function (act) {
        const chip = document.createElement('button');
        chip.className = `hc-ai-chip ${act.isCta ? 'hc-ai-chip--cta' : ''}`;
        chip.textContent = act.label;

        chip.addEventListener('click', function () {
          handleQuickAction(act.label, act.action);
        });

        actionsContainer.appendChild(chip);
      });

      msgContainer.appendChild(actionsContainer);
    }

    bodyEl.appendChild(msgContainer);
    scrollToBottom();
  }

  // Handle Quick Action Clicks
  function handleQuickAction(label, actionKey) {
    if (state.isWaiting) return;

    if (actionKey === 'consultation') {
      window.location.href = 'contact.html';
      return;
    }

    if (actionKey === 'portfolio') {
      sendUserMessage("Tell me about your portfolio and recent case studies.");
      return;
    }

    if (actionKey === 'services') {
      sendUserMessage("What services does HC Agency offer?");
      return;
    }

    if (actionKey === 'pricing') {
      sendUserMessage("What are your pricing packages and options?");
      return;
    }

    if (actionKey === 'process') {
      sendUserMessage("How does HC Agency's 6-step project process work?");
      return;
    }

    // Default: send label text
    sendUserMessage(label);
  }

  // Handle Form Submission
  function handleUserSubmit() {
    const text = inputEl.value.trim();
    if (!text || state.isWaiting) return;

    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendUserMessage(text);
  }

  // Send Message Logic
  async function sendUserMessage(text) {
    appendMessage('user', text);
    state.messages.push({ role: 'user', content: text });

    setWaitingState(true);

    try {
      const apiUrl = (window.SITE_CONFIG && window.SITE_CONFIG.assistantApiUrl) || '/api/chat';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: state.messages })
      });

      setWaitingState(false);

      if (!response.ok) {
        throw new Error('API server returned error status ' + response.status);
      }

      const data = await response.json();
      const reply = data.content || data.reply;

      if (reply) {
        state.messages.push({ role: 'assistant', content: reply });
        
        // Contextual quick actions check
        let ctaChips = [];
        const lowerReply = reply.toLowerCase();
        if (lowerReply.includes('consultation') || lowerReply.includes('quote') || lowerReply.includes('book')) {
          ctaChips.push({ label: 'Book a Free Consultation', action: 'consultation', isCta: true });
        }

        appendMessage('assistant', reply, ctaChips);
      } else {
        throw new Error('Invalid response structure');
      }

    } catch (err) {
      console.warn('HC AI Assistant Error:', err.message);
      setWaitingState(false);
      state.lastFailedUserMessage = text;
      renderErrorState();
    }
  }

  // Render Error Message with Retry Button
  function renderErrorState() {
    const errorBox = document.createElement('div');
    errorBox.className = 'hc-ai-error-box';
    errorBox.innerHTML = `
      <span>Sorry, I'm having trouble connecting right now. Please try again in a moment.</span>
    `;

    const retryBtn = document.createElement('button');
    retryBtn.className = 'hc-ai-retry-btn';
    retryBtn.textContent = 'Try Again';
    retryBtn.addEventListener('click', function () {
      errorBox.remove();
      if (state.lastFailedUserMessage) {
        sendUserMessage(state.lastFailedUserMessage);
      }
    });

    errorBox.appendChild(retryBtn);
    bodyEl.appendChild(errorBox);
    scrollToBottom();
  }

  // Loading State (Typing indicator & button state)
  function setWaitingState(waiting) {
    state.isWaiting = waiting;
    sendBtn.disabled = waiting;

    if (waiting) {
      typingEl = document.createElement('div');
      typingEl.className = 'hc-ai-typing';
      typingEl.innerHTML = `
        <span class="hc-ai-typing__dot"></span>
        <span class="hc-ai-typing__dot"></span>
        <span class="hc-ai-typing__dot"></span>
      `;
      bodyEl.appendChild(typingEl);
      scrollToBottom();
    } else if (typingEl) {
      typingEl.remove();
      typingEl = null;
    }
  }

  // Scroll Body to Bottom
  function scrollToBottom() {
    setTimeout(function () {
      bodyEl.scrollTop = bodyEl.scrollHeight;
    }, 50);
  }

  // Safe HTML Text Formatting (prevents XSS while parsing markdown links, bold, bullet points)
  function formatMessageText(str) {
    if (!str) return '';

    // 1. Sanitize HTML tags
    let safe = str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    // 2. Bold (**text**)
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // 3. Markdown Images ![alt](url)
    safe = safe.replace(/!\[([^\]]*)\]\(([^)\s]+)\)?/g, function (match, alt, url) {
      const cleanUrl = url.trim().replace(/\)$/, '');
      const isSafeUrl = /^https?:\/\//i.test(cleanUrl) || /^([a-zA-Z0-9_-]+\/)*[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp|avif|svg)$/i.test(cleanUrl);
      return isSafeUrl ? `<img src="${cleanUrl}" alt="${alt}" class="hc-ai-message__img" loading="lazy">` : '';
    });

    // 4. Markdown Links [Text](url)
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (match, text, url) {
      const isSafeUrl = /^https?:\/\//i.test(url) || /^([a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.html(#[\w-]+)?$/i.test(url);
      const target = url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : '';
      return isSafeUrl ? `<a href="${url}" class="hc-ai-message__link" ${target}>${text}</a>` : text;
    });

    // 4. Line breaks & lists
    const lines = safe.split('\n');
    let html = '';
    let inList = false;

    lines.forEach(function (line) {
      const trimmed = line.trim();
      const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');

      if (isBullet) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        const content = trimmed.replace(/^([•\-\*]\s*)/, '');
        html += `<li>${content}</li>`;
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        if (trimmed.length > 0) {
          html += `<p>${trimmed}</p>`;
        }
      }
    });

    if (inList) html += '</ul>';

    return html;
  }

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAssistant);
  } else {
    initAssistant();
  }

})();
