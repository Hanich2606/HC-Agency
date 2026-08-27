/* ==========================================================================
   HC Agency — Vercel Web Analytics Initialization
   ========================================================================== */

// Import and inject Vercel Analytics
import { inject } from './vercel-analytics.mjs';

// Initialize Vercel Analytics
inject({
  mode: 'auto', // Automatically detect environment (production/development)
  debug: false // Set to true to see debug logs in development
});
