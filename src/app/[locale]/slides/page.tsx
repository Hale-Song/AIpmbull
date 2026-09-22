"use client";

import { usePublishedSlides } from "@/hooks/use-store-data";

const topics: Record<string, { zh: string; en: string }> = {
  share: { zh: "分享", en: "Talk" },
  rag: { zh: "RAG", en: "RAG" },
  eval: { zh: "评测", en: "Eval" },
  career: { zh: "职业", en: "Career" },
  other: { zh: "其他", en: "Other" },
};

export default function SlidesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const { slides, loaded } = usePublishedSlides();

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "分享 PPT" : "Slides"}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {isZh ? "RAG、Agent 与 AI 产品主题的分享材料，可在线查看与下载。" : "Talk decks on RAG, Agent and AI product topics — view online or download."}
          </p>
        </div>

        {loaded && slides.length === 0 ? (
          <p className="py-20 text-center text-slate-500">{isZh ? "暂无分享" : "No slides yet"}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {slides.map((s) => (
              <div key={s.id} className="card-dark flex flex-col overflow-hidden p-0 transition hover:border-blue-500/40">
                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                  {s.coverImage ? (
                    <img src={s.coverImage} alt={isZh ? s.titleZh : s.titleEn} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                      <svg className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" /></svg>
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{topics[s.topic]?.[isZh ? "zh" : "en"] || s.topic}</span>
                    {s.featured && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-400">{isZh ? "精选" : "Featured"}</span>}
                    {s.slidesCount > 0 && <span className="ml-auto text-xs text-slate-500">{s.slidesCount} {isZh ? "页" : "pages"}</span>}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-white">{isZh ? s.titleZh : s.titleEn}</h2>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-400">{isZh ? s.descriptionZh : s.descriptionEn}</p>
                  {s.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {s.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{tag}</span>)}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    {s.viewUrl && (
                      <a href={s.viewUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">
                        {isZh ? "在线查看" : "View"}
                      </a>
                    )}
                    {s.downloadUrl && (
                      <a href={s.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-center text-sm font-medium text-slate-300 hover:border-slate-600 hover:text-white">
                        {isZh ? "下载" : "Download"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
