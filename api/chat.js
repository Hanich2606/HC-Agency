/**
 * HC Agency — Backend AI Assistant Chat Endpoint
 * 
 * SECURITY NOTICE:
 * This endpoint runs server-side (Vercel Serverless Function / Node HTTP Server).
 * The AI API key MUST be provided via environment variable (OPENAI_API_KEY or AI_API_KEY).
 * NEVER hardcode API keys in frontend client JavaScript.
 */

const agencyData = require('../data/agency.json');
const servicesData = require('../data/services.json');
const pricingData = require('../data/pricing.json');
const portfolioData = require('../data/portfolio.json');
const faqData = require('../data/faq.json');

// ---------------------------------------------------------------------------
// Rate Limiter — In-memory sliding window (per Vercel serverless instance)
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10;              // 10 requests per IP per minute
const rateLimitMap = new Map();

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    // Reset window
    entry.count = 1;
    entry.windowStart = now;
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Periodically clean stale entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ---------------------------------------------------------------------------
// Input sanitization helpers
// ---------------------------------------------------------------------------
function sanitizeText(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

// ---------------------------------------------------------------------------
// Allowed CORS origin
// ---------------------------------------------------------------------------
const ALLOWED_ORIGIN = process.env.VERCEL
  ? 'https://hcagency.tn'
  : '*'; // Allow all origins in local dev only

// System Instruction prompt built from verified website knowledge
const SYSTEM_INSTRUCTION = `
You are HC AI, the official AI consultant for HC Agency (a premium web design & development agency for restaurants, cafés, and local businesses).

YOUR ROLE & TONE:
- Professional, friendly, concise, confident, modern, and premium.
- Speak in clear paragraphs with bullet points when appropriate.
- ALWAYS provide complete, non-truncated answers.

NAVIGATION LINKS & MEDIA (CRITICAL INSTRUCTION):
- When visitors ask about services, pricing, portfolio, or contact info, ALWAYS include clickable Markdown links [Link Text](page.html) so they can navigate directly!
  • Pricing: [View Full Pricing & Packages](pricing.html)
  • Services: [Explore Our Services](services.html)
  • Portfolio: [View Our Portfolio](portfolio.html)
  • Case Studies: [August Case Study](portfolio/august.html), [Lumière Case Study](portfolio/lumiere.html), [Nõva Case Study](portfolio/nova.html)
  • Consultation: [Book a Free Consultation](contact.html)
  • About: [About HC Agency](about.html)
- When showcasing case studies or services, include image previews using Markdown syntax ![Alt text](image_path):
  • August Signature: ![August Case Study](website/august/1.png)
  • Lumière Roastery: ![Lumière Case Study](website/lumiere/1.png)
  • Nõva Modern: ![Nõva Case Study](website/nova/1.png)
  • Web Development: ![HC Web Design](service-photo/1.avif)

STRICT SOURCE OF TRUTH RULE:
- Use ONLY the following verified HC Agency knowledge base.
- NEVER invent or fabricate prices, services, guarantees, clients, timelines, or stats.

VERIFIED HC AGENCY KNOWLEDGE BASE:

1. AGENCY DETAILS:
- Name: ${agencyData.brandName}
- Tagline: ${agencyData.tagline}
- Location: ${agencyData.location}
- Email: ${agencyData.contact.email}
- Phone / WhatsApp: ${agencyData.contact.phone}
- Consultation URL: [Book a Free Consultation](contact.html)

2. CORE VALUES:
${agencyData.coreValues.join('\n')}

3. PROCESS (6 Steps):
${agencyData.process.join('\n')}

4. SERVICES OFFERED:
${servicesData.map(s => `- ${s.name}: ${s.description} Key features: ${s.features.join(', ')}`).join('\n')}

5. PRICING & PACKAGES:
${pricingData.map(p => `- ${p.name} Package (${p.badge || 'Standard'}): ${p.target}. Price: ${p.price}. Features: ${p.features.join(', ')}`).join('\n')}

6. PORTFOLIO & CASE STUDIES:
${portfolioData.map(p => `- ${p.title} (${p.industry}): ${p.description}`).join('\n')}

7. FREQUENTLY ASKED QUESTIONS:
${faqData.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n')}

LEAD QUALIFICATION GOAL:
When visitors inquire about a project, naturally ask relevant clarifying questions. Once qualified, encourage them to click "[Book a Free Consultation](contact.html)".
`.trim();

module.exports = async function handler(req, res) {
  // CORS Headers — restricted to own domain in production
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIp = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '0.0.0.0').split(',')[0].trim();
  if (isRateLimited(clientIp)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment before trying again.' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('[HC Chat] Missing API key environment variable.');
      return res.status(500).json({
        error: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
      });
    }

    const body = req.body || {};
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty messages format.' });
    }

    // Limit to last 12 messages for efficiency, sanitize content
    const recentMessages = messages
      .slice(-12)
      .filter(m => m.content && typeof m.content === 'string')
      .map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: sanitizeText(m.content).substring(0, 500)
      }));

    if (recentMessages.length === 0) {
      return res.status(400).json({ error: 'No valid text messages provided.' });
    }

    // Determine Provider: OpenAI key (starts with 'sk-') vs Gemini key
    const isOpenAI = apiKey.startsWith('sk-');

    if (isOpenAI) {
      // --- CALL OPENAI API ---
      const formattedMessages = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...recentMessages
      ];

      const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: formattedMessages,
          temperature: 0.4,
          max_tokens: 2048
        })
      });

      if (!apiResponse.ok) {
        console.error('[HC Chat] OpenAI API error:', apiResponse.status);
        return res.status(500).json({
          error: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
        });
      }

      const data = await apiResponse.json();
      const replyText = data.choices && data.choices[0]?.message?.content;

      if (!replyText) {
        return res.status(500).json({
          error: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
        });
      }

      return res.status(200).json({
        role: 'assistant',
        content: replyText
      });

    } else {
      // --- CALL GEMINI API (v1beta) ---
      const contents = recentMessages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const payload = {
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 2048 }
      };

      // Primary model: gemini-3.6-flash
      const candidateModels = [
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-2.5-flash',
        'gemini-1.5-flash-latest'
      ];

      let apiResponse = null;

      for (const modelName of candidateModels) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        try {
          apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (apiResponse.ok) {
            break;
          }
          console.warn(`[HC Chat] Gemini ${modelName}: status ${apiResponse.status}`);
        } catch (e) {
          console.warn(`[HC Chat] Gemini ${modelName}: fetch error`);
        }
      }

      if (!apiResponse || !apiResponse.ok) {
        console.error('[HC Chat] All Gemini models failed.');
        return res.status(500).json({
          error: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
        });
      }

      const data = await apiResponse.json();
      const replyText = data.candidates && data.candidates[0]?.content?.parts?.[0]?.text;

      if (!replyText) {
        return res.status(500).json({
          error: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
        });
      }

      return res.status(200).json({
        role: 'assistant',
        content: replyText
      });
    }

  } catch (err) {
    console.error('[HC Chat] Endpoint exception.');
    return res.status(500).json({
      error: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
    });
  }
};
