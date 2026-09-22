export interface TagDef {
  zh: string;
  en: string;
}

export const TAG_POOL: TagDef[] = [
  { zh: "RAG", en: "RAG" },
  { zh: "Agent", en: "Agent" },
  { zh: "大模型产品设计", en: "LLM Product Design" },
  { zh: "模型评测", en: "Model Evaluation" },
  { zh: "Prompt工程", en: "Prompt Engineering" },
  { zh: "AI-PRD", en: "AI-PRD" },
  { zh: "行业分析", en: "Industry Analysis" },
  { zh: "求职作品集", en: "Career Portfolio" },
];

export const TAG_POOL_ZH = TAG_POOL.map((t) => t.zh);

export function tagLabel(tag: string, isZh: boolean): string {
  const found = TAG_POOL.find((t) => t.zh === tag || t.en === tag);
  if (!found) return tag;
  return isZh ? found.zh : found.en;
}
