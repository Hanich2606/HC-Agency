/**
 * HC Agency — Local Development Web Server & API Gateway
 * 
 * Runs a local server on http://localhost:3000 that serves static website files
 * AND handles /api/chat endpoint calls using environment variables from .env.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env manually (no npm packages required)
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (key && value && !process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// Import serverless handlers from api/
const chatHandler = require('./api/chat.js');
const blogHandler = require('./api/blog.js');
const generateBlogHandler = require('./api/generate-blog.js');

const PORT = 3000;

// Maximum request body size (1 MB) to prevent DoS via large payloads
const MAX_BODY_SIZE = 1 * 1024 * 1024;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain',
  '.avif': 'image/avif',
  '.webp': 'image/webp'
};

// Blocked paths — prevent access to sensitive files via static file server
const BLOCKED_PATHS = [
  '/.env',
  '/.env.example',
  '/.env.local',
  '/.gitignore',
  '/.git',
  '/package.json',
  '/package-lock.json',
  '/server.js',
  '/node_modules',
  '/scripts',
  '/vercel.json'
];

function isBlockedPath(pathname) {
  const lower = pathname.toLowerCase();
  return BLOCKED_PATHS.some(blocked => lower === blocked || lower.startsWith(blocked + '/'));
}

// Security headers for local dev (mirrors Vercel config)
function setSecurityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
}

// Helper: read request body with size limit
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let size = 0;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY_SIZE) {
        req.destroy();
        reject(new Error('Request body too large'));
        return;
      }
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Apply security headers to all responses
  setSecurityHeaders(res);

  // Emulate Vercel/Express response helper methods
  res.status = function (code) {
    res.statusCode = code;
    return res;
  };
  res.json = function (data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
  };

  // Handle /api/blog GET requests
  if (pathname === '/api/blog') {
    blogHandler(req, res);
    return;
  }

  // Handle /api/chat POST requests
  if (pathname === '/api/chat') {
    try {
      const body = await readBody(req);
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = {};
      }
      chatHandler(req, res);
    } catch (err) {
      res.statusCode = 413;
      res.end('Request body too large');
    }
    return;
  }

  // Handle /api/generate-blog POST/GET requests
  if (pathname === '/api/generate-blog') {
    try {
      const body = await readBody(req);
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = {};
      }
      generateBlogHandler(req, res);
    } catch (err) {
      res.statusCode = 413;
      res.end('Request body too large');
    }
    return;
  }

  // Block access to sensitive files
  if (isBlockedPath(pathname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  // Serve static files
  let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);

  // Security check: stay within workspace directory (prevent path traversal)
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(__dirname))) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html');
      res.end('<h1>404 Not Found</h1>');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 HC Agency Server with AI Assistant is running!`);
  console.log(`👉 Open in your browser: http://localhost:${PORT}`);
  console.log(`🤖 Automated Blog AI Scheduler active (generates new articles daily)`);
  console.log(`==================================================\n`);

  // Helper to trigger automated blog generation
  function runAutoBlogGen() {
    const reqMock = { method: 'POST', body: {}, headers: { authorization: `Bearer ${process.env.CRON_SECRET || ''}` } };
    const resMock = {
      setHeader: () => {},
      status: () => ({ json: () => {}, end: () => {} })
    };
    generateBlogHandler(reqMock, resMock);
  }

  // Check if blog needs auto-generation on server startup (e.g. if last post is not today)
  setTimeout(() => {
    try {
      const blogJsonPath = path.join(__dirname, 'data/blog.json');
      const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (fs.existsSync(blogJsonPath)) {
        const posts = JSON.parse(fs.readFileSync(blogJsonPath, 'utf8'));
        if (!posts || posts.length === 0 || posts[0].date !== formattedDate) {
          console.log('[HC AI Scheduler] Auto-generating daily blog post for', formattedDate);
          runAutoBlogGen();
        }
      }
    } catch (e) {
      console.warn('[HC AI Scheduler] Startup check warning:', e.message);
    }
  }, 3000);

  // Schedule auto-generation every 24 hours (86,400,000 ms)
  setInterval(() => {
    console.log('[HC AI Scheduler] Running scheduled daily blog article generation...');
    runAutoBlogGen();
  }, 24 * 60 * 60 * 1000);
});
