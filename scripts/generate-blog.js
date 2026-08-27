/**
 * HC Agency — CLI Script for Automated Blog Generation
 * 
 * Usage: node scripts/generate-blog.js [optional topic]
 * 
 * Generates a brand-new SEO article using HC AI and updates data/blog.json
 */

const fs = require('fs');
const path = require('path');

// Load .env
const envPath = path.join(__dirname, '../.env');
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

const generateBlogHandler = require('../api/generate-blog.js');

const customTopic = process.argv[2];

const req = {
  method: 'POST',
  body: customTopic ? { topic: customTopic } : {}
};

const res = {
  setHeader: () => {},
  status: (code) => {
    return {
      json: (data) => {
        if (code === 200 && data.success) {
          console.log('\n=============================================');
          console.log('✅ NEW BLOG ARTICLE GENERATED SUCCESSFULLY!');
          console.log('=============================================');
          console.log(`Title:    ${data.post.title}`);
          console.log(`Category: ${data.post.category}`);
          console.log(`Summary:  ${data.post.summary}`);
          console.log(`Saved To: data/blog.json`);
          console.log('=============================================\n');
        } else {
          console.error('❌ Generation Failed:', data);
        }
      },
      end: () => {}
    };
  }
};

console.log('🤖 HC AI is writing a new blog article...');
generateBlogHandler(req, res);
