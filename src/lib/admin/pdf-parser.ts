export interface PdfParseResult {
  pageTexts: string[];
  pageImages: string[];
  title: string;
  summary: string;
  tags: string[];
  firstImage: string | null;
}

interface PdfTextItem {
  text: string;
  fontSize: number;
  isBold: boolean;
  x: number;
  y: number;
  width: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pdfjsLibPromise: Promise<any> | null = null;

function getPdfLib() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = import("pdfjs-dist/build/pdf.mjs").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.624/pdf.worker.min.mjs";
      return lib;
    });
  }
  return pdfjsLibPromise;
}

export async function parsePdf(file: File): Promise<PdfParseResult> {
  const pdfjsLib = await getPdfLib();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: "/cmaps/",
    cMapPacked: true,
  }).promise;

  const allItems: PdfTextItem[] = [];
  const pageTexts: string[] = [];
  const pageImages: string[] = [];
  let firstImage: string | null = null;
  const maxPages = Math.min(pdf.numPages, 50);

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const items: PdfTextItem[] = textContent.items
      .filter((item: unknown) => {
        const it = item as { str?: string };
        return !!it.str && it.str.trim().length > 0;
      })
      .map((item: unknown) => {
        const it = item as {
          str: string;
          transform: number[];
          fontName?: string;
          width?: number;
        };
        return {
          text: it.str,
          fontSize: Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || 12,
          isBold: (it.fontName || "").toLowerCase().includes("bold"),
          x: it.transform[4] || 0,
          y: it.transform[5] || 0,
          width: it.width || 0,
        };
      });

    allItems.push(...items);

    const pageText = buildPageText(items);
    pageTexts.push(pageText);

    const viewport = page.getViewport({ scale: 1.0 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      await page.render({ canvasContext: ctx, viewport }).promise;
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      pageImages.push(dataUrl);
      if (!firstImage && i <= 3) {
        firstImage = dataUrl;
      }
    }
    page.cleanup();
  }

  const allText = pageTexts.join("\n\n");
  const title = extractTitle(allItems, pageTexts, file.name);
  const summary = extractSummary(allText);
  const tags = extractTags(allText);

  return { pageTexts, pageImages, title, summary, tags, firstImage };
}

function buildPageText(items: PdfTextItem[]): string {
  if (items.length === 0) return "";

  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);

  const lines: string[] = [];
  let currentY = sorted[0].y;
  let currentLineItems: PdfTextItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    if (Math.abs(item.y - currentY) > 3) {
      const lineText = currentLineItems
        .sort((a, b) => a.x - b.x)
        .map((it) => it.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      if (lineText) lines.push(lineText);
      currentLineItems = [item];
      currentY = item.y;
    } else {
      currentLineItems.push(item);
    }
  }
  const lastLineText = currentLineItems
    .sort((a, b) => a.x - b.x)
    .map((it) => it.text)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (lastLineText) lines.push(lastLineText);

  return lines.join("\n");
}

function detectHeadings(items: PdfTextItem[]): Map<number, string> {
  const headingLines = new Map<number, string>();
  if (items.length === 0) return headingLines;

  const maxFontSize = Math.max(...items.map((it) => it.fontSize));
  const headingThreshold = maxFontSize * 0.85;

  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const lines: { y: number; text: string; fontSize: number; isBold: boolean }[] = [];
  let currentY = sorted[0].y;
  let currentLineItems: PdfTextItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const item = sorted[i];
    if (Math.abs(item.y - currentY) > 3) {
      const lineText = currentLineItems
        .sort((a, b) => a.x - b.x)
        .map((it) => it.text)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      const avgFontSize = currentLineItems.reduce((sum, it) => sum + it.fontSize, 0) / currentLineItems.length;
      const isBold = currentLineItems.some((it) => it.isBold);
      if (lineText) lines.push({ y: currentY, text: lineText, fontSize: avgFontSize, isBold });
      currentLineItems = [item];
      currentY = item.y;
    } else {
      currentLineItems.push(item);
    }
  }

  for (const line of lines) {
    if (line.fontSize >= headingThreshold || (line.isBold && line.fontSize >= maxFontSize * 0.7)) {
      headingLines.set(line.y, line.text);
    }
  }

  return headingLines;
}

function titleFromFilename(filename: string): string {
  const name = filename.replace(/\.pdf$/i, "");
  return name
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function extractTitle(items: PdfTextItem[], pageTexts: string[], filename: string): string {
  if (items.length === 0) {
    const firstPageText = pageTexts[0] || "";
    const firstLine = firstPageText.split("\n").find((l) => l.trim().length > 3) || "";
    if (firstLine.trim().length > 3) return firstLine.trim().slice(0, 100);
    return titleFromFilename(filename);
  }

  const maxFontSize = Math.max(...items.map((it) => it.fontSize));
  const titleItems = items.filter(
    (it) => it.fontSize >= maxFontSize * 0.75 && it.text.trim().length > 0
  );

  if (titleItems.length > 0 && titleItems.length < items.length * 0.3) {
    const sorted = [...titleItems].sort((a, b) => b.y - a.y || a.x - b.x);
    const lines: string[] = [];
    let currentY = sorted[0]?.y ?? 0;
    let currentLine = "";

    for (const item of sorted) {
      if (Math.abs(item.y - currentY) > 5) {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = item.text;
        currentY = item.y;
      } else {
        currentLine += " " + item.text;
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());

    const titleLine = lines.slice(0, 2).join(" ");
    if (titleLine.length > 3 && titleLine.length < 200) {
      return titleLine;
    }
  }

  const firstPageText = pageTexts[0] || "";
  const firstLine = firstPageText.split("\n").find((l) => l.trim().length > 3) || "";
  if (firstLine.trim().length > 3) return firstLine.trim().slice(0, 100);
  return titleFromFilename(filename);
}

function extractSummary(allText: string): string {
  const cleaned = allText.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  if (cleaned.length <= 250) return cleaned;

  const sentences = cleaned.split(/(?<=[.。!?！？])\s+/);
  const meaningful = sentences.filter((s) => s.trim().length > 10);

  if (meaningful.length === 0) return cleaned.slice(0, 250);

  const summaryParts = meaningful.slice(0, 3);
  let summary = summaryParts.join(" ");
  if (summary.length > 300) {
    summary = summary.slice(0, 297) + "...";
  }
  return summary;
}

function extractTags(allText: string): string[] {
  const found = new Set<string>();

  const keywordPatterns = [
    /(?:关键词|关键字|Keywords?|Tags?)[：:\s]*([^\n.。]+)/gi,
  ];

  for (const pattern of keywordPatterns) {
    let match;
    while ((match = pattern.exec(allText)) !== null) {
      const tags = match[1]
        .split(/[,;，；、\s]+/)
        .map((t) => t.trim())
        .filter((t) => t.length > 1 && t.length < 30);
      tags.forEach((t) => found.add(t));
    }
  }

  const techTerms = [
    "AI", "LLM", "GPT", "ChatGPT", "Claude", "Gemini", "Midjourney", "DALL-E",
    "Stable Diffusion", "Transformer", "BERT", "GPT-4", "GPT-3.5",
    "机器学习", "深度学习", "自然语言处理", "计算机视觉", "大模型", "人工智能",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision",
    "Prompt", "RAG", "Fine-tuning", "Agent", "Multi-modal",
    "Python", "TensorFlow", "PyTorch", "React", "API",
    "产品设计", "用户体验", "数据驱动", "产品经理",
  ];

  for (const term of techTerms) {
    if (allText.toLowerCase().includes(term.toLowerCase())) {
      found.add(term);
    }
  }

  return Array.from(found).slice(0, 8);
}

export function buildContentHtml(
  pageTexts: string[],
  pageImages: string[]
): string {
  const parts: string[] = [];
  const pageCount = Math.max(pageTexts.length, pageImages.length);
  const hasAnyText = pageTexts.some((t) => t.trim().length > 0);

  for (let i = 0; i < pageCount; i++) {
    const text = pageTexts[i] || "";
    const image = pageImages[i] || "";

    if (text.trim() || image) {
      if (i > 0 && (hasAnyText || pageImages.some((img) => img))) {
        parts.push(`<hr style="border:none;border-top:1px solid #334155;margin:24px 0;" />`);
      }

      if (text.trim()) {
        const lines = text.split("\n").filter((l) => l.trim());
        let inParagraph = false;
        let inList = false;

        for (const line of lines) {
          const escaped = line
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

          const trimmed = line.trim();
          const isNumberedItem = /^\d+[.、）)]\s*/.test(trimmed);
          const isBulletItem = /^[-•·]\s*/.test(trimmed);
          const isListItem = isNumberedItem || isBulletItem;

          const isHeading =
            trimmed.length < 80 &&
            !trimmed.includes("，") &&
            !trimmed.includes("。") &&
            !trimmed.endsWith("：") &&
            !isListItem &&
            (trimmed.startsWith("第") ||
              /^[\d一二三四五六七八九十]+[、.．]\s*/.test(trimmed) ||
              /^(一|二|三|四|五|六|七|八|九|十|百|千)/.test(trimmed));

          if (isHeading) {
            if (inParagraph) { parts.push(`</p>`); inParagraph = false; }
            if (inList) { parts.push(`</ul>`); inList = false; }
            parts.push(
              `<h3 style="margin:20px 0 12px 0;font-size:17px;font-weight:700;color:#f1f5f9;letter-spacing:0.02em;">${escaped}</h3>`
            );
          } else if (isListItem) {
            if (inParagraph) { parts.push(`</p>`); inParagraph = false; }
            if (!inList) { parts.push(`<ul style="margin:8px 0;padding-left:24px;list-style-type:disc;color:#e2e8f0;line-height:1.9;">`); inList = true; }
            const itemText = trimmed.replace(/^[-•·\d.、）)]+\s*/, "");
            parts.push(`<li style="margin-bottom:4px;">${itemText}</li>`);
          } else {
            if (inList) { parts.push(`</ul>`); inList = false; }
            if (!inParagraph) {
              parts.push(`<p style="margin-bottom:12px;line-height:1.9;color:#e2e8f0;text-align:justify;">`);
              inParagraph = true;
            }
            parts.push(`${escaped}<br/>`);
          }
        }

        if (inParagraph) parts.push(`</p>`);
        if (inList) parts.push(`</ul>`);
      }

      if (image) {
        parts.push(
          `<div style="margin:16px 0;"><img src="${image}" style="max-width:100%;border-radius:8px;display:block;" alt="Page ${i + 1}" /></div>`
        );
      }
    }
  }

  if (parts.length === 0 && pageImages.length > 0) {
    for (let j = 0; j < pageImages.length; j++) {
      if (pageImages[j]) {
        parts.push(
          `<div style="margin:16px 0;"><img src="${pageImages[j]}" style="max-width:100%;border-radius:8px;display:block;" alt="Page ${j + 1}" /></div>`
        );
      }
    }
  }

  return parts.join("\n");
}
