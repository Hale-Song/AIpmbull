#!/usr/bin/env node
/**
 * Migration script: Download all article images from TOS and upload to GitHub.
 * Run locally to bypass browser CORS restrictions.
 *
 * Usage: node scripts/migrate-images-to-github.js
 */

const fs = require('fs');
const path = require('path');

// GitHub config
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) { console.error('Error: GITHUB_TOKEN env var is required'); process.exit(1); }
const GITHUB_REPO = 'Hale-Song/AIpmbull';
const GITHUB_BRANCH = 'main';
const GITHUB_IMAGE_PATH = 'public/assets/images';

// Articles data file (exported from admin)
const ARTICLES_FILE = path.join(__dirname, '../data/articles.json');

async function urlToBase64(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`);
  const buffer = Buffer.from(await resp.arrayBuffer());
  return buffer.toString('base64');
}

function generateFilename(originalUrl) {
  const ext = originalUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)?.[1]?.toLowerCase() || 'png';
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `img-${ts}-${rand}.${ext}`;
}

async function uploadToGithub(base64, filename) {
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_IMAGE_PATH}/${filename}`;

  // Check if file exists
  const checkResp = await fetch(apiUrl, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}` },
  });

  let sha;
  if (checkResp.ok) {
    const existing = await checkResp.json();
    sha = existing.sha;
  }

  const body = {
    message: `Add image: ${filename}`,
    content: base64,
    branch: GITHUB_BRANCH,
  };
  if (sha) body.sha = sha;

  const resp = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(`Upload failed: ${err.message || resp.status}`);
  }

  const data = await resp.json();
  return data.content?.download_url || `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/${GITHUB_IMAGE_PATH}/${filename}`;
}

function replaceImageSrcInHtml(html, replacements) {
  let result = html;
  for (const [oldUrl, newUrl] of replacements) {
    result = result.split(oldUrl).join(newUrl);
  }
  return result;
}

async function main() {
  console.log('=== Image Migration Script ===\n');

  // Read articles
  let articles;
  try {
    const data = fs.readFileSync(ARTICLES_FILE, 'utf-8');
    articles = JSON.parse(data);
    console.log(`Loaded ${articles.length} articles from ${ARTICLES_FILE}\n`);
  } catch (err) {
    console.error('Failed to load articles. Please export articles from admin first.');
    console.error('Error:', err.message);
    process.exit(1);
  }

  // Collect all unique non-GitHub image URLs
  const urlsToMigrate = [];
  const seen = new Set();

  for (const article of articles) {
    // Extract from contentZh
    if (article.contentZh) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(article.contentZh)) !== null) {
        const url = match[1];
        if (!url.includes('raw.githubusercontent.com') && !seen.has(url)) {
          seen.add(url);
          urlsToMigrate.push({ articleId: article.id, url, field: 'contentZh' });
        }
      }
    }

    // Extract from contentEn
    if (article.contentEn) {
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/g;
      let match;
      while ((match = imgRegex.exec(article.contentEn)) !== null) {
        const url = match[1];
        if (!url.includes('raw.githubusercontent.com') && !seen.has(url)) {
          seen.add(url);
          urlsToMigrate.push({ articleId: article.id, url, field: 'contentEn' });
        }
      }
    }

    // Check coverImage
    if (article.coverImage && !article.coverImage.includes('raw.githubusercontent.com') && !seen.has(article.coverImage)) {
      seen.add(article.coverImage);
      urlsToMigrate.push({ articleId: article.id, url: article.coverImage, field: 'coverImage' });
    }
  }

  console.log(`Found ${urlsToMigrate.length} unique non-GitHub images to migrate\n`);

  if (urlsToMigrate.length === 0) {
    console.log('No images to migrate. All images are already on GitHub.');
    process.exit(0);
  }

  // Upload each image
  const replacements = new Map();
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < urlsToMigrate.length; i++) {
    const item = urlsToMigrate[i];
    console.log(`[${i + 1}/${urlsToMigrate.length}] Processing: ${item.url.slice(0, 60)}...`);

    try {
      const base64 = await urlToBase64(item.url);
      const filename = generateFilename(item.url);
      const githubUrl = await uploadToGithub(base64, filename);

      replacements.set(item.url, githubUrl);
      successCount++;
      console.log(`  ✓ Uploaded: ${filename}`);
    } catch (err) {
      failCount++;
      console.log(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log(`\n=== Migration Summary ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${urlsToMigrate.length}`);

  if (replacements.size > 0) {
    // Update articles
    for (const article of articles) {
      let updated = false;

      if (article.contentZh) {
        const newContent = replaceImageSrcInHtml(article.contentZh, replacements);
        if (newContent !== article.contentZh) {
          article.contentZh = newContent;
          updated = true;
        }
      }

      if (article.contentEn) {
        const newContent = replaceImageSrcInHtml(article.contentEn, replacements);
        if (newContent !== article.contentEn) {
          article.contentEn = newContent;
          updated = true;
        }
      }

      if (article.coverImage && replacements.has(article.coverImage)) {
        article.coverImage = replacements.get(article.coverImage);
        updated = true;
      }

      if (updated) {
        console.log(`Updated article: ${article.titleZh}`);
      }
    }

    // Save updated articles
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), 'utf-8');
    console.log(`\nSaved updated articles to ${ARTICLES_FILE}`);
    console.log('Please re-import these articles in the admin panel.');
  }

  console.log('\n=== Migration Complete ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
