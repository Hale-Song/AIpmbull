"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { Article } from "@/lib/admin/store";

function ArticleContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const isZh = locale === "zh";
  const [article, setArticle] = useState<Article | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      return;
    }
    apiClient.getById<Article>("articles", id).then((found) => {
      if (found && found.published) {
        setArticle(found);
      } else {
        setNotFound(true);
      }
    });
  }, [id]);

  if (notFound) {
    return (
      <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-white">{isZh ? "文章未找到" : "Article Not Found"}</h1>
        <p className="mt-2 text-slate-400">{isZh ? "该文章不存在或尚未发布" : "This article does not exist or has not been published"}</p>
        <a href={`/${locale}/articles/`} className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {isZh ? "返回文章列表" : "Back to Articles"}
        </a>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const content = isZh ? article.contentZh : article.contentEn;
  const title = isZh ? article.titleZh : article.titleEn;
  const summary = isZh ? article.summaryZh : article.summaryEn;

  return (
    <article className="container-site max-w-3xl py-12">
      <a href={`/${locale}/articles/`} className="mb-8 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
        {isZh ? "返回文章列表" : "Back to Articles"}
      </a>

      {article.coverImage && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <img src={article.coverImage} alt={title} className="h-auto w-full object-cover" />
        </div>
      )}

      <header className="mb-8">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {article.articleNo && (
            <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-blue-400">{article.articleNo}</span>
          )}
          {article.category && (
            <span className="badge-category">{article.category}</span>
          )}
          <time className="text-sm text-slate-500">
            {new Date(article.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
          </time>
        </div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {summary && (
          <p className="mt-4 text-lg leading-relaxed text-slate-400">{summary}</p>
        )}
        {article.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">{tag}</span>
            ))}
          </div>
        )}
      </header>

      {content ? (
        <div
          className="prose prose-invert max-w-none [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-slate-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-400 [&_a]:underline"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
          <p className="text-slate-500">{isZh ? "暂无内容" : "No content available"}</p>
        </div>
      )}

      <footer className="mt-12 border-t border-slate-800 pt-8">
        <a href={`/${locale}/articles/`} className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
          {isZh ? "← 返回文章列表" : "← Back to Articles"}
        </a>
      </footer>
    </article>
  );
}

export default function ArticleViewPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Suspense fallback={
      <div className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    }>
      <ArticleContent locale={locale} />
    </Suspense>
  );
}
