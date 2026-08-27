/**
 * HC Agency — Backend AI Blog Generator Endpoint
 * 
 * Invoked by CLI script, frontend, or server automation.
 * Uses Gemini/OpenAI API (or built-in HC AI engine fallback) to generate rich,
 * SEO-optimized blog posts, saving them directly into data/blog.json.
 */

const fs = require('fs');
const path = require('path');

const TOPICS_POOL = [
  {
    title: "How Autonomous AI Assistants Are Transforming Local Client Acquisition",
    category: "AI & Automation",
    readTime: "5 min read",
    coverImage: "service-photo/1.avif",
    inlineImages: ["service-photo/6.png"],
    summary: "Discover how integrating a 24/7 AI response assistant on your website captures after-hours leads and triples appointment bookings.",
    keyTakeaways: [
      "Instant response times prevent high-intent buyers from going to competitors.",
      "Automated FAQ handling reduces support calls by up to 60%.",
      "Lead qualification happens automatically before your team even picks up the phone."
    ],
    content: `
      <p>Modern consumers expect immediate answers. When a prospective client visits your local business website after business hours, waiting until the next morning to respond often means losing that client to a faster competitor.</p>
      <h2>1. The 5-Minute Window of Client Interest</h2>
      <p>Research shows that response rates drop by over 80% if inquiry responses are delayed past 5 minutes. An integrated <strong>HC AI Assistant</strong> engages website visitors instantly, answering questions about your services, pricing guidelines, and availability 24 hours a day, 7 days a week.</p>
      <h2>2. Qualifying Leads Before Consultation Calls</h2>
      <p>Not all website inquiries are equal. AI automation pre-qualifies incoming prospects by asking structured questions regarding budget, timeline, and project scope. By the time you review the inquiry, you have a complete client profile ready for action.</p>
      <blockquote class="blog-quote">"Speed is the single biggest competitive advantage in local search conversion. Autonomous AI tools turn passive traffic into confirmed appointments."<cite>— HC AI Growth Report</cite></blockquote>
      <h2>3. Steps to Implement AI Automations</h2>
      <p>Ready to upgrade your site with 24/7 client response? Explore HC Agency's custom AI integration packages tailored specifically for service providers and local brands.</p>
    `
  },
  {
    title: "Why Site Speed is the #1 Secret to Ranking First on Google Local",
    category: "Local SEO",
    readTime: "4 min read",
    coverImage: "service-photo/2.jpg",
    inlineImages: ["service-photo/4.png"],
    summary: "Uncover how PageSpeed scores directly influence your Google Maps ranking and why custom-coded websites outrank heavy template builders.",
    keyTakeaways: [
      "Google's Core Web Vitals directly impact search rankings on mobile.",
      "Custom clean code loads 3x faster than WordPress plugin-heavy sites.",
      "Higher speed leads to lower bounce rates and higher conversion rates."
    ],
    content: `
      <p>When potential clients search for local services in your area, Google prioritizes websites that deliver an exceptional, lightning-fast user experience.</p>
      <h2>1. Core Web Vitals and Search Visibility</h2>
      <p>Since Google's page experience update, loading speed is no longer optional—it is a primary ranking factor. Sites that load under 1.5 seconds earn top placement on both Google Search and Google Maps local packs.</p>
      <h2>2. The Hidden Cost of Heavy Plugins</h2>
      <p>Many traditional website builders rely on dozens of third-party plugins that bloat code size and slow down rendering. Custom HTML5 and optimized CSS eliminate unnecessary overhead, delivering immediate response times on mobile devices.</p>
      <blockquote class="blog-quote">"Every half-second delay in page load time costs local businesses up to 10% of their organic conversion rate."<cite>— HC AI Performance Audit</cite></blockquote>
      <h2>3. Maximize Your Search Ranking Today</h2>
      <p>Is your website loading slowly? Contact HC Agency for a complimentary performance audit and discover how our custom web design elevates your local visibility.</p>
    `
  },
  {
    title: "The Anatomy of a High-Converting Local Business Landing Page",
    category: "Conversion",
    readTime: "6 min read",
    coverImage: "service-photo/3.jpg",
    inlineImages: ["service-photo/5.png"],
    summary: "Learn the exact design elements, layout strategy, and call-to-action structures that turn casual website visitors into paying clients.",
    keyTakeaways: [
      "Clear value propositions above the fold capture attention instantly.",
      "Social proof and real client testimonials build immediate trust.",
      "Frictionless contact forms increase submission rates by over 40%."
    ],
    content: `
      <p>Driving traffic to your website is only half the battle. If your landing page design is confusing or cluttered, visitors will leave without taking action.</p>
      <h2>1. Hero Section Clarity</h2>
      <p>Within the first 3 seconds of landing on your page, a visitor must understand: what you do, who you serve, and how to get started. Clear typography and visual hierarchy guide the user's eye naturally.</p>
      <h2>2. Strategic Placement of Trust Elements</h2>
      <p>Including authentic client reviews, verified rating badges, and portfolio showcases directly alongside call-to-action buttons removes buyer friction and validates your credibility.</p>
      <blockquote class="blog-quote">"Great web design is not just aesthetics—it is clear communication that drives business results."<cite>— HC AI Design Strategy</cite></blockquote>
      <h2>3. Modernize Your Web Experience</h2>
      <p>Elevate your local brand with a high-converting website engineered by HC Agency. Book your consultation today to get started.</p>
    `
  }
];

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || process.env.GEMINI_API_KEY;
    const body = req.body || {};
    const requestedTopic = body.topic || null;

    let generatedPost = null;

    // Try AI generation if API key exists
    if (apiKey && apiKey.length > 10) {
      const systemPrompt = `
You are HC AI, the official AI writer for HC Agency (premium web studio in Tunis, Tunisia).
Write a brand new, highly engaging blog article for local business owners.
Return ONLY valid JSON matching this exact structure:
{
  "title": "Title here",
  "slug": "seo-friendly-slug",
  "category": "Strategy | Local SEO | AI & Automation | Performance | Conversion",
  "readTime": "5 min read",
  "summary": "Short 2-sentence summary",
  "keyTakeaways": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "content": "<p>Content with <h2>, <p>, and <blockquote class=\\\"blog-quote\\\">...</blockquote...</p>"
}
      `.trim();

      const userPrompt = `Topic: "${requestedTopic || 'High Performance Web Design & AI Growth for Local Business'}". Make it actionable, fresh, and valuable for business owners.`;

      try {
        const isOpenAI = apiKey.startsWith('sk-');
        if (isOpenAI) {
          const apiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
              response_format: { type: "json_object" },
              temperature: 0.7
            })
          });

          if (apiResponse.ok) {
            const data = await apiResponse.json();
            const rawJson = data.choices && data.choices[0]?.message?.content;
            if (rawJson) generatedPost = JSON.parse(rawJson);
          }
        } else {
          // Gemini API
          const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
          const apiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
            })
          });

          if (apiResponse.ok) {
            const data = await apiResponse.json();
            const rawText = data.candidates && data.candidates[0]?.content?.parts?.[0]?.text;
            if (rawText) generatedPost = JSON.parse(rawText);
          } else {
            console.log('[HC AI] Remote Gemini API call returned status:', apiResponse.status);
          }
        }
      } catch (remoteErr) {
        console.warn('[HC AI] Remote AI API call failed, switching to HC AI Engine fallback:', remoteErr.message);
      }
    }

    // Fallback if AI provider call fails or key is invalid
    if (!generatedPost) {
      const blogJsonPath = path.join(__dirname, '../data/blog.json');
      let existingCount = 0;
      if (fs.existsSync(blogJsonPath)) {
        try {
          const existing = JSON.parse(fs.readFileSync(blogJsonPath, 'utf8'));
          existingCount = existing.length;
        } catch (e) {}
      }

      // Pick topic from pool based on existing count
      const template = TOPICS_POOL[existingCount % TOPICS_POOL.length];
      const timestamp = Date.now();
      
      generatedPost = {
        title: requestedTopic ? `Strategic Insights: ${requestedTopic}` : `${template.title}`,
        slug: `hc-ai-post-${timestamp}`,
        category: template.category,
        readTime: template.readTime,
        summary: template.summary,
        keyTakeaways: template.keyTakeaways,
        content: template.content,
        coverImage: template.coverImage,
        inlineImages: template.inlineImages
      };
    }

    const blogJsonPath = path.join(__dirname, '../data/blog.json');
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const finalPost = {
      id: `post-${Date.now()}`,
      title: generatedPost.title,
      slug: generatedPost.slug || `post-${Date.now()}`,
      category: generatedPost.category || "Strategy",
      readTime: generatedPost.readTime || "5 min read",
      date: formattedDate,
      author: "HC AI",
      coverImage: generatedPost.coverImage || "service-photo/3.jpg",
      inlineImages: generatedPost.inlineImages || ["service-photo/4.png"],
      summary: generatedPost.summary,
      keyTakeaways: generatedPost.keyTakeaways || [],
      content: generatedPost.content
    };

    // Save to data/blog.json
    try {
      let currentPosts = [];
      if (fs.existsSync(blogJsonPath)) {
        const fileData = fs.readFileSync(blogJsonPath, 'utf8');
        currentPosts = JSON.parse(fileData);
      }
      currentPosts.unshift(finalPost);
      fs.writeFileSync(blogJsonPath, JSON.stringify(currentPosts, null, 2), 'utf8');
      console.log(`[HC AI] Article generated & saved to data/blog.json: "${finalPost.title}"`);
    } catch (saveErr) {
      console.error('[HC AI] Error saving to data/blog.json:', saveErr);
    }

    return res.status(200).json({ success: true, post: finalPost });

  } catch (err) {
    console.error('Blog Generation Error:', err);
    return res.status(500).json({ error: 'Failed to generate blog post.' });
  }
};
