"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import type { Note } from "@/lib/admin/store";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-800 pt-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
        <span className="h-4 w-1 rounded-full bg-blue-500" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`h-4 w-4 ${i <= rating ? "fill-amber-400" : "fill-slate-700"}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.286 3.958c.3.921-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.783.57-1.838-.197-1.538-1.118l1.285-3.958a1 1 0 00-.362-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69z" />
        </svg>
      ))}
    </span>
  );
}

function NoteContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const isZh = locale === "zh";
  const [item, setItem] = useState<Note | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    apiClient.getById<Note>("notes", id).then((found) => {
      if (found && found.published) setItem(found);
      else setNotFound(true);
    });
  }, [id]);

  if (notFound) {
    return (
      <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-white">{isZh ? "笔记不存在" : "Note not found"}</h1>
        <p className="mt-2 text-slate-400">{isZh ? "它可能已被删除或未发布。" : "It may have been removed or unpublished."}</p>
        <a href={`/${locale}/notes/`} className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">{isZh ? "返回笔记列表" : "Back to notes"}</a>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const title = isZh ? item.titleZh : item.titleEn;
  const source = isZh ? item.sourceZh : item.sourceEn;
  const summary = isZh ? item.summaryZh : item.summaryEn;
  const content = isZh ? item.contentZh : item.contentEn;
  const takeaway = isZh ? item.takeawayZh : item.takeawayEn;

  return (
    <article className="container-site max-w-3xl py-12">
      <a href={`/${locale}/notes/`} className="mb-8 inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-blue-400">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
        {isZh ? "返回笔记列表" : "Back to notes"}
      </a>

      {item.coverImage && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <img src={item.coverImage} alt={title} className="h-auto w-full object-cover" />
        </div>
      )}

      <header className="mb-8">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs ${item.type === "book" ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400"}`}>
            {item.type === "book" ? (isZh ? "读书笔记" : "Book Note") : (isZh ? "工作日志" : "Work Log")}
          </span>
          {item.rating > 0 && <Stars rating={item.rating} />}
        </div>
        <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {source && <p className="mt-3 text-sm text-blue-400">{isZh ? "来源" : "Source"}：{source}</p>}
        {summary && <p className="mt-4 text-lg leading-relaxed text-slate-400">{summary}</p>}
        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">{tag}</span>)}
          </div>
        )}
      </header>

      <div className="space-y-6">
        {content && (
          <Section title={isZh ? "笔记正文" : "Notes"}>
            <p className="whitespace-pre-line leading-relaxed text-slate-300">{content}</p>
          </Section>
        )}
        {takeaway && (
          <Section title={isZh ? "核心收获" : "Key Takeaways"}>
            <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
              <p className="whitespace-pre-line leading-relaxed text-slate-200">{takeaway}</p>
            </div>
          </Section>
        )}
      </div>

      <footer className="mt-12 border-t border-slate-800 pt-8">
        <a href={`/${locale}/notes/`} className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">← {isZh ? "返回笔记列表" : "Back to notes"}</a>
      </footer>
    </article>
  );
}

export default function NoteViewPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Suspense fallback={
      <div className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    }>
      <NoteContent locale={locale} />
    </Suspense>
  );
}
