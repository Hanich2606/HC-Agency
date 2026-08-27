/* ==========================================================================
   HC Agency — Global Site Configuration & Contact Coordinates
   ==========================================================================
   
   EDIT VALUES IN THIS FILE TO UPDATE CONTACT DETAILS, SOCIAL LINKS,
   CASE STUDY PROJECT URLS, AND NAVIGATION ACROSS ALL PAGES AUTOMATICALLY.
   ========================================================================== */

const SITE_CONFIG = {
  // Agency Brand Information
  brandName: "HC Agency",
  tagline: "Premium web design studio helping local businesses grow with high-performance websites that attract customers and build trust.",
  copyrightYear: 2026,

  // AI Assistant Endpoint (Set custom URL if backend is hosted on a separate service)
  assistantApiUrl: "/api/chat",

  // Contact Coordinates (Edit here to update everywhere on all pages!)
  contact: {
    email: "hello@hcagency.tn",
    phone: "+216 50 375 506",
    phoneRaw: "+21650375506",
    whatsapp: "+216 50 375 715",
    whatsappUrl: "https://wa.me/21650375715",
    location: "Tunis, Tunisia",
    address: "Tunis, Tunisia",
    consultationUrl: "contact.html"
  },

  // Social Media Profiles
  socials: {
    instagram: "https://instagram.com/hcagency",
    linkedin: "https://linkedin.com/company/hcagency",
    behance: "https://behance.net/hcagency",
    github: "https://github.com/hcagency"
  },

  // Live Case Study Websites (Clickable buttons on August, Lumière & Nõva pages)
  projectUrls: {
    august: "https://hanich2606.github.io/august/",
    lumiere: "https://hanich2606.github.io/lumiere/",
    nova: "https://hanich2606.github.io/nova/"
  },

  // Main Header Navigation Links
  navigation: [
    { name: "Home", url: "index.html" },
    { name: "Services", url: "services.html" },
    { name: "Portfolio", url: "portfolio.html" },
    { name: "Pricing", url: "pricing.html" },
    { name: "About", url: "about.html" },
    { name: "Contact", url: "contact.html" },
    { name: "Blog", url: "blog.html" }
  ],

  // Footer Services Links
  services: [
    { name: "Website Design", url: "services.html" },
    { name: "Website Development", url: "services.html" },
    { name: "Local SEO", url: "services.html" },
    { name: "Maintenance", url: "services.html" },
    { name: "AI Automations", url: "services.html" },
    { name: "Performance", url: "services.html" }
  ],

  // Legal Links
  legal: [
    { name: "Privacy Policy", url: "privacy-policy.html" },
    { name: "Terms of Service", url: "terms-of-service.html" },
    { name: "Cookie Policy", url: "cookies.html" }
  ]
};

// Expose globally
if (typeof window !== 'undefined') {
  window.SITE_CONFIG = SITE_CONFIG;
}
