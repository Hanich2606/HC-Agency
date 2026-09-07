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
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Server Error: No AI_API_KEY or OPENAI_API_KEY environment variable provided.');
      return res.status(500).json({
        error: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
      });
    }

    const body = req.body || {};
    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty messages format.' });
    }

    // Limit to last 12 messages for efficiency
    const recentMessages = messages.slice(-12).filter(m => m.content && typeof m.content === 'string');

    if (recentMessages.length === 0) {
      return res.status(400).json({ error: 'No valid text messages provided.' });
    }

    // Determine Provider: OpenAI key (starts with 'sk-') vs Gemini key
    const isOpenAI = apiKey.startsWith('sk-');

    if (isOpenAI) {
      // --- CALL OPENAI API ---
      const formattedMessages = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...recentMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content.substring(0, 1000)
        }))
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
        const errText = await apiResponse.text();
        console.error('OpenAI API Error:', apiResponse.status, errText);
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
        parts: [{ text: m.content.substring(0, 1000) }]
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
      let lastErrText = '';

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
          lastErrText = await apiResponse.text();
          console.warn(`Gemini model ${modelName} returned status ${apiResponse.status}: ${lastErrText}`);
        } catch (e) {
          console.warn(`Fetch error for model ${modelName}:`, e.message);
        }
      }

      if (!apiResponse || !apiResponse.ok) {
        console.error('Gemini API Error across all models:', lastErrText);
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
    console.error('API Endpoint Exception:', err);
    return res.status(500).json({
      error: "Sorry, I'm having trouble connecting right now. Please try again in a moment."
    });
  }
};
