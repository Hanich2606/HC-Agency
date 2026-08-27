/**
 * Vercel Speed Insights Initialization
 * Initializes Speed Insights for the HC Agency website
 */

// Initialize the queue
if (!window.si) {
  window.si = function(...params) {
    window.siq = window.siq || [];
    window.siq.push(params);
  };
}

// Load the Speed Insights script
(function() {
  // Check if script is already loaded
  const scriptSrc = '/_vercel/speed-insights/script.js';
  if (document.head.querySelector(`script[src*="${scriptSrc}"]`)) return;

  const script = document.createElement('script');
  script.src = scriptSrc;
  script.defer = true;
  
  // Add SDK metadata
  script.dataset.sdkn = '@vercel/speed-insights';
  script.dataset.sdkv = '2.0.0';
  
  script.onerror = function() {
    console.log('[Vercel Speed Insights] Failed to load script from ' + scriptSrc + '. Please check if any content blockers are enabled and try again.');
  };
  
  document.head.appendChild(script);
})();
