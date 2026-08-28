/**
 * HC Agency — Blog Articles API Endpoint (api/blog.js)
 * 
 * Serves the latest blog articles.
 * In Production on Vercel: Reads from Vercel Blob storage (if configured) or data/blog.json fallback.
 * In Local Dev: Reads directly from data/blog.json.
 */

const fs = require('fs');
const path = require('path');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. Try reading from Vercel Blob if token exists
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { list } = require('@vercel/blob');
        const { blobs } = await list({ prefix: 'blog.json' });
        
        if (blobs && blobs.length > 0) {
          const blobUrl = blobs[0].url;
          const blobRes = await fetch(blobUrl);
          if (blobRes.ok) {
            const posts = await blobRes.json();
            return res.status(200).json(posts);
          }
        }
      } catch (blobErr) {
        console.warn('[HC AI Blog] Vercel Blob read error, falling back to local file:', blobErr.message);
      }
    }

    // 2. Fallback to bundled data/blog.json
    const blogPath = path.join(process.cwd(), 'data', 'blog.json');
    if (fs.existsSync(blogPath)) {
      const fileContent = fs.readFileSync(blogPath, 'utf8');
      const posts = JSON.parse(fileContent);
      return res.status(200).json(posts);
    }

    return res.status(200).json([]);
  } catch (err) {
    console.error('[HC AI Blog] Endpoint exception:', err);
    return res.status(500).json({ error: 'Failed to fetch blog articles.' });
  }
};
