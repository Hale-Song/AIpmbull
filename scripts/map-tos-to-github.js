#!/usr/bin/env node
// Maps dead TOS image URLs in live KV articles to existing GitHub URLs.
// Uses data/articles.json as the source of truth for GitHub image mappings.
// Since TOS images are dead (403), we can't re-download them.
// Instead, we map by position: each TOS URL in an article is replaced with
// the corresponding GitHub URL from data/articles.json (cycling if needed).
//
// Usage:
//   node scripts/map-tos-to-github.js
//
// Env:
//   API_BASE  - override API base URL (default: https://aipmbull.com)
//   PROXY     - HTTP proxy URL (default: http://127.0.0.1:7890)
//   DRY_RUN   - set to "1" to skip sync and just report

const API_BASE = (process.env.API_BASE || "https://aipmbull.com").replace(/\/$/, "");
const PROXY = process.env.PROXY || "http://127.0.0.1:7890";
const DRY_RUN = process.env.DRY_RUN === "1";

let agent = null;

async function initProxy() {
  try {
    const mod = await import("https-proxy-agent");
    agent = new mod.HttpsProxyAgent(PROXY);
    console.log(`Proxy: ${PROXY}`);
  } catch {
    console.warn("WARN: https-proxy-agent not available, no proxy");
  }
}

function fetchOpts() {
  return agent ? { agent } : {};
}

async function fetchJson(url) {
  const resp = await fetch(url, fetchOpts());
  if (!resp.ok) throw new Error(`GET ${url} → ${resp.status}`);
  return resp.json();
}

function extractImageUrls(html) {
  if (!html) return [];
  const matches = html.match(/src=["']([^"']+)["']/gi) || [];
  return matches.map(m => m.match(/src=["']([^"']+)["']/i)?.[1]).filter(Boolean);
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function main() {
  console.log("=== TOS → GitHub URL Mapping ===");
  console.log(`API: ${API_BASE}, Dry run: ${DRY_RUN}`);
  await initProxy();
  console.log();

  // 1. Load data/articles.json for GitHub URL reference
  const dataArticles = require("../data/articles.json");
  console.log(`Loaded ${dataArticles.length} articles from data/articles.json`);

  // Build a map: articleNo → ordered list of GitHub URLs
  const githubByArticleNo = new Map();
  for (const art of dataArticles) {
    const ghUrls = [];
    // Collect unique GitHub URLs in order of appearance
    const seen = new Set();
    // Cover image first
    if (art.coverImage?.includes("github") && !seen.has(art.coverImage)) {
      ghUrls.push(art.coverImage);
      seen.add(art.coverImage);
    }
    // Content images
    for (const url of extractImageUrls(art.contentZh)) {
      if (url.includes("github") && !seen.has(url)) {
        ghUrls.push(url);
        seen.add(url);
      }
    }
    for (const url of extractImageUrls(art.contentEn || "")) {
      if (url.includes("github") && !seen.has(url)) {
        ghUrls.push(url);
        seen.add(url);
      }
    }
    githubByArticleNo.set(art.articleNo, ghUrls);
    console.log(`  ${art.articleNo}: ${ghUrls.length} GitHub URLs`);
    for (const u of ghUrls) console.log(`    ${u.split("/").pop()}`);
  }

  // 2. Fetch live articles from KV
  console.log("\nFetching live articles from KV...");
  const liveArticles = await fetchJson(`${API_BASE}/api/articles`);
  console.log(`Found ${liveArticles.length} live articles`);

  // 3. Fetch live images
  const liveImages = await fetchJson(`${API_BASE}/api/images`);
  console.log(`Found ${liveImages.length} images in library`);

  // 4. Map TOS URLs to GitHub URLs for each article
  const newImageItems = [];
  let totalMappings = 0;

  for (const art of liveArticles) {
    const ghUrls = githubByArticleNo.get(art.articleNo) || [];
    if (ghUrls.length === 0) {
      console.log(`\n⚠ ${art.articleNo}: No GitHub URLs found in data file, skipping`);
      continue;
    }

    // Collect all non-GitHub image URLs in this article (in order)
    const tosUrls = [];
    const seen = new Set();

    // Cover image
    if (art.coverImage && !art.coverImage.includes("github") && !seen.has(art.coverImage)) {
      tosUrls.push({ url: art.coverImage, field: "cover" });
      seen.add(art.coverImage);
    }
    // Content Zh images
    for (const url of extractImageUrls(art.contentZh)) {
      if (!url.includes("github") && !seen.has(url)) {
        tosUrls.push({ url, field: "contentZh" });
        seen.add(url);
      }
    }
    // Content En images
    for (const url of extractImageUrls(art.contentEn || "")) {
      if (!url.includes("github") && !seen.has(url)) {
        tosUrls.push({ url, field: "contentEn" });
        seen.add(url);
      }
    }

    if (tosUrls.length === 0) {
      console.log(`\n✓ ${art.articleNo}: Already all GitHub URLs`);
      continue;
    }

    console.log(`\n${art.articleNo}: ${tosUrls.length} TOS URLs → ${ghUrls.length} GitHub URLs`);

    // Map by position, cycling GitHub URLs if needed
    for (let i = 0; i < tosUrls.length; i++) {
      const tosUrl = tosUrls[i];
      const ghUrl = ghUrls[i % ghUrls.length];
      console.log(`  [${tosUrl.field}] ${tosUrl.url.split("/").pop().slice(0, 40)}... → ${ghUrl.split("/").pop()}`);

      // Replace in article content
      if (art.coverImage === tosUrl.url) {
        art.coverImage = ghUrl;
      }
      if (art.contentZh) {
        art.contentZh = art.contentZh.split(tosUrl.url).join(ghUrl);
      }
      if (art.contentEn) {
        art.contentEn = art.contentEn.split(tosUrl.url).join(ghUrl);
      }

      totalMappings++;

      // Create ImageItem for the library (only unique GitHub URLs)
      const existingItem = liveImages.find(img => img.url === ghUrl) ||
        newImageItems.find(img => img.url === ghUrl);
      if (!existingItem) {
        const filename = ghUrl.split("/").pop();
        newImageItems.push({
          id: generateId(),
          titleZh: `文章配图 ${filename}`,
          titleEn: `Article image ${filename}`,
          url: ghUrl,
          descriptionZh: `来自文章 ${art.articleNo}`,
          descriptionEn: `From article ${art.articleNo}`,
          githubFilename: filename,
          githubUrl: ghUrl,
          sourceType: "article",
          sourceId: art.id,
          published: true,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  console.log(`\n=== Summary ===`);
  console.log(`Total URL mappings: ${totalMappings}`);
  console.log(`New image library entries: ${newImageItems.length}`);

  if (DRY_RUN) {
    console.log("\n[DRY RUN] No changes made. Remove DRY_RUN=1 to apply.");
    return;
  }

  // 5. Sync back to KV
  console.log("\nSyncing to KV via /api/sync-all...");
  const syncPayload = {
    articles: liveArticles,
    images: [...liveImages, ...newImageItems],
  };

  const syncResp = await fetch(`${API_BASE}/api/sync-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(syncPayload),
    ...fetchOpts(),
  });

  if (!syncResp.ok) {
    const errText = await syncResp.text();
    console.error(`✗ Sync failed: ${syncResp.status} ${errText}`);
    process.exit(1);
  }
  console.log("✓ Sync successful");

  // 6. Verify
  console.log("\nVerifying...");
  const verifyArticles = await fetchJson(`${API_BASE}/api/articles`);
  let remainingBad = 0;
  for (const art of verifyArticles) {
    const allHtml = (art.contentZh || "") + (art.contentEn || "") + (art.coverImage || "");
    const urls = allHtml.match(/https?:\/\/[^\s"'<>]+/g) || [];
    const bad = urls.filter(u =>
      !u.includes("raw.githubusercontent.com") &&
      !u.includes("unsplash.com") &&
      (u.includes("tos.coze") || u.match(/\.(png|jpg|jpeg|gif|webp|svg)/i))
    );
    if (bad.length > 0) {
      remainingBad += bad.length;
      console.log(`  ⚠ ${art.articleNo}: ${bad.length} non-GitHub image URLs remaining`);
    }
  }

  const verifyImages = await fetchJson(`${API_BASE}/api/images`);
  console.log(`\n=== COMPLETE ===`);
  console.log(`URL mappings applied: ${totalMappings}`);
  console.log(`Image library: ${verifyImages.length} entries`);
  console.log(`Remaining non-GitHub image URLs: ${remainingBad}`);

  if (remainingBad === 0) {
    console.log("\n✓ All article images now point to GitHub!");
  }
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
