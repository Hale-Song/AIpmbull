export interface MdParseResult {
  title: string;
  summary: string;
  tags: string[];
  contentHtml: string;
  firstImage: string;
}

export function parseMarkdown(text: string): MdParseResult {
  let frontmatter: Record<string, string> = {};
  let body = text;

  const fmMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (fmMatch) {
    const fmBlock = fmMatch[1];
    body = fmMatch[2];
    for (const line of fmBlock.split("\n")) {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        let val = line.slice(colonIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        frontmatter[key] = val;
      }
    }
  }

  const title = frontmatter.title || extractFirstHeading(body) || "";
  const tags = parseTags(frontmatter.tags || frontmatter.keywords || "");
  const firstImage = extractFirstImage(body);
  const summary = frontmatter.description || frontmatter.summary || extractSummary(body);
  const contentHtml = mdToHtml(body);

  return { title, summary, tags, contentHtml, firstImage };
}

function extractFirstHeading(md: string): string {
  const match = md.match(/^#{1,6}\s+(.+)$/m);
  return match ? match[1].trim() : "";
}

function extractFirstImage(md: string): string {
  const match = md.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : "";
}

function extractSummary(md: string): string {
  const lines = md.split("\n");
  const textLines: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#") || trimmed.startsWith("!") || trimmed.startsWith("```") || trimmed.startsWith("---")) continue;
    const clean = trimmed.replace(/[*_`\[\]()]/g, "").trim();
    if (clean.length > 10) {
      textLines.push(clean);
      if (textLines.join("").length > 120) break;
    }
  }
  const joined = textLines.join(" ");
  return joined.length > 200 ? joined.slice(0, 197) + "..." : joined;
}

function parseTags(raw: string): string[] {
  if (!raw) return [];
  if (raw.startsWith("[")) {
    try {
      const arr = JSON.parse(raw.replace(/'/g, '"'));
      if (Array.isArray(arr)) return arr.map(String);
    } catch { /* fall through */ }
  }
  return raw.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function processInline(text: string): string {
  let result = escapeHtml(text);
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
  result = result.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return result;
}

function mdToHtml(md: string): string {
  const lines = md.split("\n");
  const html: string[] = [];
  let i = 0;
  let inList: "ul" | "ol" | null = null;
  let inCode = false;
  let codeLang = "";
  let codeLines: string[] = [];

  const closeList = () => {
    if (inList === "ul") { html.push("</ul>"); inList = null; }
    else if (inList === "ol") { html.push("</ol>"); inList = null; }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code class="language-${escapeHtml(codeLang)}">${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        inCode = false;
        codeLines = [];
        codeLang = "";
      } else {
        closeList();
        inCode = true;
        codeLang = trimmed.slice(3).trim();
      }
      i++;
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      i++;
      continue;
    }

    if (!trimmed) {
      closeList();
      i++;
      continue;
    }

    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      closeList();
      html.push("<hr />");
      i++;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${processInline(headingMatch[2])}</h${level}>`);
      i++;
      continue;
    }

    if (trimmed.startsWith("> ")) {
      closeList();
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("> ")) {
        quoteLines.push(lines[i].trim().slice(2));
        i++;
      }
      html.push(`<blockquote>${quoteLines.map((l) => processInline(l)).join("<br />")}</blockquote>`);
      continue;
    }

    const ulMatch = trimmed.match(/^[-*+]\s+(.+)$/);
    if (ulMatch) {
      if (inList !== "ul") { closeList(); html.push("<ul>"); inList = "ul"; }
      html.push(`<li>${processInline(ulMatch[1])}</li>`);
      i++;
      continue;
    }

    const olMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (olMatch) {
      if (inList !== "ol") { closeList(); html.push("<ol>"); inList = "ol"; }
      html.push(`<li>${processInline(olMatch[1])}</li>`);
      i++;
      continue;
    }

    closeList();
    const paraLines: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const next = lines[i].trim();
      if (!next || next.startsWith("#") || next.startsWith(">") || next.startsWith("```") || next.startsWith("- ") || next.startsWith("* ") || next.match(/^\d+\.\s/) || next === "---" || next === "***" || next === "___") break;
      paraLines.push(next);
      i++;
    }
    html.push(`<p>${paraLines.map((l) => processInline(l)).join("<br />")}</p>`);
  }

  closeList();
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return html.join("\n");
}
