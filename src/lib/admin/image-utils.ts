export interface ExtractedImage {
  src: string;
  alt: string;
  index: number;
}

export function extractImagesFromHtml(html: string): ExtractedImage[] {
  if (!html) return [];
  const images: ExtractedImage[] = [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = imgRegex.exec(html)) !== null) {
    const fullTag = match[0];
    const src = match[1];
    const altMatch = fullTag.match(/alt=["']([^"']*)["']/i);
    const alt = altMatch ? altMatch[1] : "";

    if (src && !src.startsWith("data:")) {
      images.push({ src, alt, index });
      index++;
    }
  }

  return images;
}

export function replaceImageSrcInHtml(html: string, replacements: Map<string, string>): string {
  if (!html || replacements.size === 0) return html;
  let result = html;
  replacements.forEach((newSrc, oldSrc) => {
    result = result.replaceAll(oldSrc, newSrc);
  });
  return result;
}

export function getUniqueImageUrls(html: string): string[] {
  const images = extractImagesFromHtml(html);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const img of images) {
    if (!seen.has(img.src)) {
      seen.add(img.src);
      unique.push(img.src);
    }
  }
  return unique;
}
