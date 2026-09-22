#!/usr/bin/env node
// Migrates article images from TOS (or any non-GitHub source) to GitHub hosting.
// Fetches live articles from KV API, downloads images, uploads to GitHub,
// replaces URLs, and syncs back via /api/sync-all.
//
// Usage:
//   GITHUB_TOKEN=ghp_xxx node scripts/migrate-live-images.js
//
// Env:
//   GITHUB_TOKEN  - GitHub PAT with repo scope
//   API_BASE      - override API base URL (default: https://aipmbull.com)
//   PROXY         - HTTP proxy URL (default: http://127.0.0.1:7890)
//   DRY_RUN       - set to "1" to skip uploads and just report

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const API_BASE = (process.env.API_BASE || "https://aipmbull.com").replace(/\/$/, "");
const PROXY = process.env.PROXY || "http://127.0.0.1:7890";
const DRY_RUN = process.env.DRY_RUN === "1";
const REPO = "Hale-Song/AIpmbull";
const BRANCH = "main";
const IMAGE_PATH = "public/assets/images";

if (!GITHUB_TOKEN) {
  console.error("ERROR: GITHUB_TOKEN env var is required");
  process.exit(1);
}

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

async function downloadImage(url) {
  const resp = await fetch(url, fetchOpts());
  if (!resp.ok) throw new Error(`Download ${url} → ${resp.status}`);
  return Buffer.from(await resp.arrayBuffer());
}

function extractImageUrls(html) {
  if (!html) return [];
  const matches = html.match(/src=["']([^"']+)["']/gi) || [];
  return matches.map(m => m.match(/src=["']([^"']+)["']/i)?.[1]).filter(Boolean);
}

function generateFilename(originalUrl) {
  const ext = originalUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)?.[1]?.toLowerCase() || "png";
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `img-${ts}-${rand}.${ext}`;
}

async function uploadToGitHub(filename, buffer) {
  const path = `${IMAGE_PATH}/${filename}`;
  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const base64 = buffer.toString("base64");

  let sha;
  try {
    const checkResp = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, "User-Agent": "aipmbull-migrator" },
    });
    if (checkResp.ok) {
      const existing = await checkResp.json();
      sha = existing.sha;
      console.log(`  File exists, will update (sha: ${sha.slice(0, 8)})`);
    }
  } catch {}

  const body = { message: `Add image: ${filename}`, content: base64, branch: BRANCH };
  if (sha) body.sha = sha;

  const resp = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "aipmbull-migrator",
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.message || `GitHub upload HTTP ${resp.status}`);
  }

  const data = await resp.json();
  return data.content?.download_url || `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${path}`;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

async function main() {
  console.log("=== Live KV Image Migration ===");
  console.log(`API: ${API_BASE}, Dry run: ${DRY_RUN}`);
  await initProxy();
  console.log();

  // 1. Fetch current articles from live KV
  console.log("1. Fetching articles from live API...");
  const articles = await fetchJson(`${API_BASE}/api/articles`);
  console.log(`   Found ${articles.length} articles`);

  // 2. Fetch current images from live KV
  console.log("2. Fetching images from live API...");
  const images = await fetchJson(`${API_BASE}/api/images`);
  console.log(`   Found ${images.length} images in library`);

  // 3. Collect all non-GitHub image URLs across all articles
  const urlMap = new Map();
  for (const art of articles) {
    const contentUrls = [
      ...extractImageUrls(art.contentZh),
      ...extractImageUrls(art.contentEn),
    ];
    if (art.coverImage) contentUrls.push(art.coverImage);

    for (const url of contentUrls) {
      if (url.includes("raw.githubusercontent.com")) continue;
      if (!urlMap.has(url)) {
        urlMap.set(url, { articleIds: new Set(), fields: new Set() });
      }
      const entry = urlMap.get(url);
      entry.articleIds.add(art.id);
      if (art.coverImage === url) entry.fields.add("coverImage");
      if (extractImageUrls(art.contentZh || "").includes(url)) entry.fields.add("contentZh");
      if (extractImageUrls(art.contentEn || "").includes(url)) entry.fields.add("contentEn");
    }
  }

  console.log(`\n3. Found ${urlMap.size} unique non-GitHub image URLs to migrate`);
  if (urlMap.size === 0) {
    console.log("   Nothing to migrate!");
    return;
  }

  // List all URLs
  let idx = 0;
  for (const [url, info] of urlMap) {
    idx++;
    console.log(`   ${idx}. [${[...info.fields].join(",")}] ${url.slice(0, 80)}${url.length > 80 ? "..." : ""}`);
  }

  // 4. Download and upload each image to GitHub
  const replacements = new Map();
  const newImageItems = [];
  let done = 0;

  for (const [originalUrl, info] of urlMap) {
    done++;
    const shortUrl = originalUrl.length > 70 ? originalUrl.slice(0, 70) + "..." : originalUrl;
    console.log(`\n[${done}/${urlMap.size}] ${shortUrl}`);
    console.log(`   Used by ${info.articleIds.size} article(s), fields: ${[...info.fields].join(", ")}`);

    if (DRY_RUN) {
      const fakeGithubUrl = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${IMAGE_PATH}/${generateFilename(originalUrl)}`;
      replacements.set(originalUrl, fakeGithubUrl);
      console.log(`   [DRY RUN] Would upload → ${fakeGithubUrl}`);
      continue;
    }

    try {
      console.log("   Downloading...");
      const buffer = await downloadImage(originalUrl);
      console.log(`   Downloaded ${(buffer.length / 1024).toFixed(1)} KB`);

      const filename = generateFilename(originalUrl);
      console.log(`   Uploading as ${filename}...`);
      const githubUrl = await uploadToGitHub(filename, buffer);
      console.log(`   ✓ Uploaded → ${githubUrl}`);

      replacements.set(originalUrl, githubUrl);

      const articleId = [...info.articleIds][0];
      newImageItems.push({
        id: generateId(),
        titleZh: `文章配图 ${filename}`,
        titleEn: `Article image ${filename}`,
        url: githubUrl,
        descriptionZh: "",
        descriptionEn: "",
        githubFilename: filename,
        githubUrl: githubUrl,
        sourceType: "article",
        sourceId: articleId,
        published: true,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`   ✗ FAILED: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }

  if (DRY_RUN) {
    console.log("\n=== DRY RUN COMPLETE ===");
    console.log(`Would migrate ${replacements.size} images across ${articles.length} articles`);
    return;
  }

  // 5. Replace URLs in articles
  console.log(`\n4. Replacing URLs in articles...`);
  let totalReplacements = 0;
  for (const art of articles) {
    let changed = false;
    for (const [oldUrl, newUrl] of replacements) {
      if (art.contentZh && art.contentZh.includes(oldUrl)) {
        art.contentZh = art.contentZh.split(oldUrl).join(newUrl);
        changed = true;
      }
      if (art.contentEn && art.contentEn.includes(oldUrl)) {
        art.contentEn = art.contentEn.split(oldUrl).join(newUrl);
        changed = true;
      }
      if (art.coverImage === oldUrl) {
        art.coverImage = newUrl;
        changed = true;
      }
    }
    if (changed) {
      totalReplacements++;
      console.log(`   ✓ Updated ${art.articleNo || art.id}`);
    }
  }
  console.log(`   Updated ${totalReplacements} articles`);

  // 6. Sync updated articles + images back to KV
  console.log(`\n5. Syncing to KV via /api/sync-all...`);
  const syncPayload = {
    articles: articles,
    images: [...images, ...newImageItems],
  };

  const syncResp = await fetch(`${API_BASE}/api/sync-all`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(syncPayload),
    ...fetchOpts(),
  });

  if (!syncResp.ok) {
    const errText = await syncResp.text();
    console.error(`   ✗ Sync failed: ${syncResp.status} ${errText}`);
    process.exit(1);
  }
  console.log("   ✓ Sync successful");

  // 7. Verify
  console.log(`\n6. Verifying...`);
  const verifyArticles = await fetchJson(`${API_BASE}/api/articles`);
  let remainingTos = 0;
  for (const art of verifyArticles) {
    const allHtml = (art.contentZh || "") + (art.contentEn || "") + (art.coverImage || "");
    const urls = allHtml.match(/https?:\/\/[^\s"'<>]+/g) || [];
    const nonGithub = urls.filter(u =>
      !u.includes("raw.githubusercontent.com") &&
      !u.includes("unsplash.com") &&
      (u.match(/\.(png|jpg|jpeg|gif|webp|svg)/i) || u.includes("tos.coze"))
    );
    if (nonGithub.length > 0) {
      remainingTos += nonGithub.length;
      console.log(`   ⚠ ${art.articleNo}: ${nonGithub.length} non-GitHub image URLs remaining`);
      for (const u of nonGithub) console.log(`     ${u.slice(0, 80)}`);
    }
  }

  const verifyImages = await fetchJson(`${API_BASE}/api/images`);
  console.log(`\n=== MIGRATION COMPLETE ===`);
  console.log(`Articles updated: ${totalReplacements}`);
  console.log(`Images uploaded to GitHub: ${replacements.size}`);
  console.log(`Image library entries: ${verifyImages.length} (was ${images.length}, added ${newImageItems.length})`);
  console.log(`Remaining non-GitHub image URLs: ${remainingTos}`);

  if (remainingTos > 0) {
    console.log("\n⚠ Some images were not migrated. Check the URLs above.");
  } else {
    console.log("\n✓ All article images are now on GitHub!");
  }
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
