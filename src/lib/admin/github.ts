import { store, type SiteSettings } from "./store";

function getGithubSettings(): SiteSettings {
  const items = store.list<SiteSettings>("settings");
  return items[0] || {
    siteName: "", siteNameEn: "", logo: "", descriptionZh: "", descriptionEn: "",
    email: "", website: "", wechat: "", twitter: "", github: "",
    githubToken: "", githubRepo: "Hale-Song/AIpmbull", githubBranch: "main",
    githubImagePath: "public/assets/images",
  };
}

export function isGithubConfigured(): boolean {
  const s = getGithubSettings();
  return !!(s.githubToken && s.githubRepo && s.githubBranch);
}

export function getGithubImageUrl(filename: string): string {
  const s = getGithubSettings();
  return `https://raw.githubusercontent.com/${s.githubRepo}/${s.githubBranch}/${s.githubImagePath}/${filename}`;
}

async function urlToBase64(url: string): Promise<string> {
  try {
    const proxyResp = await fetch("/api/fetch-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (proxyResp.ok) {
      const data = await proxyResp.json() as { base64: string };
      return data.base64;
    }
  } catch {}

  const resp = await fetch(url);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function generateFilename(originalUrl: string): string {
  const ext = originalUrl.match(/\.(png|jpg|jpeg|gif|webp|svg)/i)?.[1]?.toLowerCase() || "png";
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 6);
  return `img-${ts}-${rand}.${ext}`;
}

export interface UploadResult {
  success: boolean;
  url: string;
  filename: string;
  path: string;
  error?: string;
}

export async function uploadImageToGithub(imageSource: string | File): Promise<UploadResult> {
  const s = getGithubSettings();
  if (!s.githubToken || !s.githubRepo) {
    return { success: false, url: "", filename: "", path: "", error: "GitHub not configured" };
  }

  try {
    const isFile = imageSource instanceof File;
    const filename = isFile ? (imageSource as File).name : generateFilename(imageSource as string);
    const path = `${s.githubImagePath}/${filename}`;
    const base64 = isFile
      ? await fileToBase64(imageSource as File)
      : await urlToBase64(imageSource as string);

    const apiUrl = `https://api.github.com/repos/${s.githubRepo}/contents/${path}`;

    const checkResp = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${s.githubToken}` },
    });

    let sha: string | undefined;
    if (checkResp.ok) {
      const existing = await checkResp.json();
      sha = existing.sha;
    }

    const body: Record<string, string> = {
      message: `Add image: ${filename}`,
      content: base64,
      branch: s.githubBranch,
    };
    if (sha) body.sha = sha;

    const resp = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${s.githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return { success: false, url: "", filename, path, error: err.message || `HTTP ${resp.status}` };
    }

    const data = await resp.json();
    const rawUrl = data.content?.download_url || getGithubImageUrl(filename);

    return { success: true, url: rawUrl, filename, path };
  } catch (e) {
    return { success: false, url: "", filename: "", path: "", error: (e as Error).message };
  }
}

export async function uploadMultipleToGithub(
  sources: (string | File)[],
  onProgress?: (done: number, total: number) => void,
): Promise<UploadResult[]> {
  const results: UploadResult[] = [];
  for (let i = 0; i < sources.length; i++) {
    const result = await uploadImageToGithub(sources[i]);
    results.push(result);
    onProgress?.(i + 1, sources.length);
  }
  return results;
}

export async function deleteImageFromGithub(filename: string): Promise<boolean> {
  const s = getGithubSettings();
  if (!s.githubToken || !s.githubRepo) return false;

  try {
    const path = `${s.githubImagePath}/${filename}`;
    const apiUrl = `https://api.github.com/repos/${s.githubRepo}/contents/${path}`;

    const checkResp = await fetch(apiUrl, {
      headers: { Authorization: `Bearer ${s.githubToken}` },
    });
    if (!checkResp.ok) return false;

    const existing = await checkResp.json();

    const resp = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${s.githubToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `Delete image: ${filename}`,
        sha: existing.sha,
        branch: s.githubBranch,
      }),
    });

    return resp.ok;
  } catch {
    return false;
  }
}
