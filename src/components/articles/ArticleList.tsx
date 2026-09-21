"use client";

import { usePublishedArticles } from "@/hooks/use-store-data";

const categories = ["all", "productReview", "productComparison", "industryInsights", "aiProductManager"];

export function ArticleList({ locale, translations }: {
  locale: string;
  translations: {
    categoryLabels: Record<string, string>;
    readLabel: string;
  };
}) {
  const isZh = locale === "zh";
  const { articles } = usePublishedArticles();

  return (
    <section className="container-site py-12">
      <div className="mb-8 flex flex-wrap gap-3">
        {categories.map((cat, i) => (
          <button
            key={cat}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              i === 0
                ? "bg-blue-600 text-white"
                : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
            }`}
          >
            {cat === "all" ? (isZh ? "全部" : "All") : translations.categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {articles.map((article) => (
          <a
            key={article.id}
            href={`/${locale}/articles/view/?id=${article.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="card-dark block overflow-hidden p-0 transition-all hover:border-slate-600 hover:shadow-lg hover:shadow-blue-500/5"
          >
            <div className="aspect-video w-full overflow-hidden bg-slate-800">
              <img
                src={article.coverImage}
                alt={isZh ? article.titleZh : article.titleEn}
                className="h-full w-full object-cover transition-transform hover:scale-105"
              />
            </div>
            <div className="p-6">
              <span className="badge-category">
                {translations.categoryLabels[article.category] || article.category}
              </span>
              <h3 className="mt-3 text-lg font-bold text-white">
                {isZh ? article.titleZh : article.titleEn}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {isZh ? article.summaryZh : article.summaryEn}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <time>{new Date(article.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US")}</time>
                <span className="text-blue-400 group-hover:text-blue-300">
                  {isZh ? "阅读全文 →" : "Read more →"}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
