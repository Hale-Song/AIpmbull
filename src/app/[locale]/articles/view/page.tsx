"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { Article } from "@/lib/admin/store";

interface TocItem { id: string; text: string; level: number; }

function ArticleContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const isZh = locale === "zh";
  const [articles, setArticles] = useState<Article[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [activeId, setActiveId] = useState<string>("");
  const [flashId, setFlashId] = useState<string>("");
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiClient.list<Article>("articles").then((all) => {
      const published = all.filter((a) => a.published);
      setArticles(published);
      if (!id || !published.some((a) => a.id === id)) {
        setNotFound(true);
      }
    });
  }, [id]);

  const ordered = useMemo(
    () => [...articles].sort((a, b) => (a.articleNo || "").localeCompare(b.articleNo || "")),
    [articles]
  );

  const article = useMemo(() => ordered.find((a) => a.id === id) || null, [ordered, id]);

  const idx = article ? ordered.findIndex((a) => a.id === article.id) : -1;
  const prev = idx > 0 ? ordered[idx - 1] : null;
  const next = idx >= 0 && idx < ordered.length - 1 ? ordered[idx + 1] : null;

  const related = useMemo(() => {
    if (!article) return [];
    const score = (other: Article) => {
      let s = 0;
      const shared = other.tags.filter((t) => article.tags.includes(t)).length;
      s += shared * 2;
      if (other.category && other.category === article.category) s += 1;
      return s;
    };
    return ordered
      .filter((a) => a.id !== article.id)
      .map((a) => ({ a, s: score(a) }))
      .filter((x) => x.s > 0)
      .sort((x, y) => y.s - x.s)
      .slice(0, 3)
      .map((x) => x.a);
  }, [article, ordered]);

  const content = article
    ? (isZh ? article.contentZh || article.contentEn : article.contentEn || article.contentZh) || ""
    : "";

  const { htmlWithIds, tocItems } = useMemo(() => {
    if (!content) return { htmlWithIds: "", tocItems: [] as TocItem[] };
    const items: TocItem[] = [];
    let i = 0;
    const html = content.replace(/<(h[23])\b([^>]*)>([\s\S]*?)<\/\1>/gi, (_match, tag, attrs, inner) => {
      const secId = `sec-${i}`;
      const text = inner.replace(/<[^>]*>/g, "").trim();
      items.push({ id: secId, text, level: tag.toUpperCase() === "H2" ? 2 : 3 });
      i++;
      return `<${tag} id="${secId}"${attrs}>${inner}</${tag}>`;
    });
    return { htmlWithIds: html, tocItems: items };
  }, [content]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el || tocItems.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 }
    );
    tocItems.forEach((item) => {
      const heading = document.getElementById(item.id);
      if (heading) observer.observe(heading);
    });
    return () => observer.disconnect();
  }, [tocItems]);

  useEffect(() => {
    if (!flashId) return;
    const el = document.getElementById(flashId);
    if (!el) return;
    el.classList.add("heading-flash");
    const timer = setTimeout(() => {
      el.classList.remove("heading-flash");
      setFlashId("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [flashId]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
      setActiveId(id);
      setFlashId(id);
    }
  };

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

  const title = isZh ? (article.titleZh || article.titleEn) : (article.titleEn || article.titleZh);
  const summary = isZh ? (article.summaryZh || article.summaryEn) : (article.summaryEn || article.summaryZh);
  const linkTitle = (a: Article) => (isZh ? (a.titleZh || a.titleEn) : (a.titleEn || a.titleZh));

  return (
    <div className="container-site py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
        {tocItems.length > 0 && (
          <aside className="hidden w-60 shrink-0 lg:block">
            <nav className="sticky top-24">
              <style>{`
                @keyframes heading-flash {
                  0% { background-color: rgba(59, 130, 246, 0.35); border-radius: 6px; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4); }
                  50% { background-color: rgba(59, 130, 246, 0.15); }
                  100% { background-color: transparent; box-shadow: none; }
                }
                .heading-flash { animation: heading-flash 5s ease-out; }
              `}</style>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{isZh ? "目录" : "Table of Contents"}</p>
              <ul className="space-y-1.5 border-l border-slate-800">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollToHeading(item.id)}
                      className={`block w-full border-l-2 py-0.5 text-left text-sm transition-colors ${item.level === 3 ? "pl-6" : "pl-4"} ${activeId === item.id ? "border-blue-500 text-white" : "border-transparent text-slate-400 hover:border-blue-500/50 hover:text-slate-200"}`}
                    >
                      {item.text}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        <article className="min-w-0 flex-1 max-w-3xl">
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

          {htmlWithIds ? (
            <div
              ref={contentRef}
              className="prose prose-invert max-w-none [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_p]:text-slate-300 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-400 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: htmlWithIds }}
            />
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
              <p className="text-slate-500">{isZh ? "暂无内容" : "No content available"}</p>
            </div>
          )}

          <nav className="mt-12 grid gap-4 border-t border-slate-800 pt-8 sm:grid-cols-2">
            {prev ? (
              <a href={`/${locale}/articles/view?id=${prev.id}`} className="group rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
                <span className="text-xs text-slate-500">{isZh ? "上一篇" : "Previous"}</span>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-white group-hover:text-blue-400">{linkTitle(prev)}</p>
              </a>
            ) : <div className="hidden sm:block" />}
            {next && (
              <a href={`/${locale}/articles/view?id=${next.id}`} className="group rounded-xl border border-slate-800 bg-slate-900 p-4 text-right hover:border-slate-700 transition-colors sm:col-start-2">
                <span className="text-xs text-slate-500">{isZh ? "下一篇" : "Next"}</span>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-white group-hover:text-blue-400">{linkTitle(next)}</p>
              </a>
            )}
          </nav>

          {related.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-lg font-bold text-white">{isZh ? "相关推荐" : "Related Articles"}</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <a key={r.id} href={`/${locale}/articles/view?id=${r.id}`} className="group rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
                    {r.coverImage && <img src={r.coverImage} alt={linkTitle(r)} className="mb-3 aspect-video w-full rounded-lg object-cover" />}
                    <p className="line-clamp-2 text-sm font-medium text-white group-hover:text-blue-400">{linkTitle(r)}</p>
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
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
