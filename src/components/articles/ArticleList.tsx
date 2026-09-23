"use client";

import { useMemo, useState } from "react";
import { usePublishedArticles } from "@/hooks/use-store-data";

const categories = ["all", "productReview", "productComparison", "industryInsights", "aiProductManager"];
const PAGE_SIZE = 6;

export function ArticleList({ locale, translations }: {
  locale: string;
  translations: {
    categoryLabels: Record<string, string>;
    readLabel: string;
  };
}) {
  const isZh = locale === "zh";
  const { articles, loaded } = usePublishedArticles();
  const [activeCat, setActiveCat] = useState("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const a of articles) for (const t of a.tags || []) set.add(t);
    return Array.from(set);
  }, [articles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const catOk = activeCat === "all" || a.category === activeCat;
      const tagOk = !activeTag || (a.tags || []).includes(activeTag);
      return catOk && tagOk;
    });
  }, [articles, activeCat, activeTag]);

  const shown = filtered.slice(0, visible);

  const resetVisible = () => setVisible(PAGE_SIZE);

  return (
    <section className="container-site py-12">
      <div className="mb-4 flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => { setActiveCat(cat); resetVisible(); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeCat === cat
                ? "bg-blue-600 text-white"
                : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
            }`}
          >
            {cat === "all" ? (isZh ? "全部" : "All") : translations.categoryLabels[cat]}
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-500">{isZh ? "标签：" : "Tags:"}</span>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => { setActiveTag(activeTag === tag ? null : tag); resetVisible(); }}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                activeTag === tag
                  ? "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {!loaded && articles.length === 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-dark block overflow-hidden p-0 animate-pulse">
              <div className="aspect-video w-full bg-slate-800" />
              <div className="p-6 space-y-3">
                <div className="flex gap-2">
                  <div className="h-4 w-12 rounded bg-slate-800" />
                  <div className="h-4 w-16 rounded bg-slate-800" />
                </div>
                <div className="h-5 w-3/4 rounded bg-slate-800" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-slate-800/60" />
                  <div className="h-3 w-2/3 rounded bg-slate-800/60" />
                </div>
                <div className="h-3 w-24 rounded bg-slate-800/40" />
              </div>
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <p className="py-20 text-center text-slate-500">{isZh ? "暂无匹配的文章" : "No matching articles"}</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {shown.map((article) => (
            <a
              key={article.id}
              href={`/${locale}/articles/view/?id=${article.id}`}
              className="card-dark block overflow-hidden p-0 transition-all hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-800">
                <img
                  src={article.coverImage}
                  alt={isZh ? article.titleZh : article.titleEn}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2">
                  {article.articleNo && (
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-blue-400">{article.articleNo}</span>
                  )}
                  <span className="badge-category">
                    {translations.categoryLabels[article.category] || article.category}
                  </span>
                  {(article.tags || []).slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-400">#{tag}</span>
                  ))}
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {isZh ? article.titleZh : article.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {isZh ? article.summaryZh : article.summaryEn}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <time>{new Date(article.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US")}</time>
                  <span className="text-blue-400">{isZh ? "阅读全文 →" : "Read more →"}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {visible < filtered.length && (
        <div className="mt-12 text-center">
          <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="btn-secondary">
            {isZh ? "查看更多" : "Load More"}
          </button>
        </div>
      )}
    </section>
  );
}
