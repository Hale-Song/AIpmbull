"use client";

import Link from "next/link";
import { usePublishedNotes } from "@/hooks/use-store-data";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`h-3.5 w-3.5 ${i <= rating ? "fill-amber-400" : "fill-slate-700"}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.446a1 1 0 00-.363 1.118l1.286 3.958c.3.921-.755 1.688-1.539 1.118l-3.367-2.446a1 1 0 00-1.175 0l-3.367 2.446c-.783.57-1.838-.197-1.538-1.118l1.285-3.958a1 1 0 00-.362-1.118L2.063 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69z" />
        </svg>
      ))}
    </span>
  );
}

export default function NotesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const { notes, loaded } = usePublishedNotes();

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "学习笔记" : "Notes"}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {isZh ? "读书笔记与工作日志，沉淀方法论、复盘与实战心得。" : "Book notes and work logs — methodologies, retrospectives and hands-on insights."}
          </p>
        </div>

        {loaded && notes.length === 0 ? (
          <p className="py-20 text-center text-slate-500">{isZh ? "暂无笔记" : "No notes yet"}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Link
                key={note.id}
                href={`/${locale}/notes/view?id=${note.id}`}
                className="card-dark flex flex-col overflow-hidden p-0 transition hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5"
              >
                {note.coverImage && (
                  <div className="aspect-video w-full overflow-hidden bg-slate-800">
                    <img src={note.coverImage} alt={isZh ? note.titleZh : note.titleEn} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${note.type === "book" ? "bg-purple-500/10 text-purple-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                      {note.type === "book" ? (isZh ? "读书笔记" : "Book") : (isZh ? "工作日志" : "Log")}
                    </span>
                    {note.featured && <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{isZh ? "精选" : "Featured"}</span>}
                    {note.rating > 0 && <span className="ml-auto"><Stars rating={note.rating} /></span>}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-white">{isZh ? note.titleZh : note.titleEn}</h2>
                  {(isZh ? note.sourceZh : note.sourceEn) && <p className="mt-1 text-xs text-slate-500">{isZh ? note.sourceZh : note.sourceEn}</p>}
                  <p className="mt-3 line-clamp-3 text-sm text-slate-400">{isZh ? note.summaryZh : note.summaryEn}</p>
                  {note.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {note.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{tag}</span>)}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
