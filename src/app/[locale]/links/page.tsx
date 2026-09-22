"use client";

import { usePublishedLinks } from "@/hooks/use-store-data";

const categories: Record<string, { zh: string; en: string }> = {
  blog: { zh: "博客", en: "Blog" },
  community: { zh: "社区", en: "Community" },
  tool: { zh: "工具", en: "Tool" },
  friend: { zh: "友站", en: "Friend" },
};

export default function LinksPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const { links, loaded } = usePublishedLinks();

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "友情链接" : "Links"}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {isZh ? "AI 产品经理值得关注的博客、社区与工具站点。" : "Blogs, communities and tools worth following for AI product managers."}
          </p>
        </div>

        {loaded && links.length === 0 ? (
          <p className="py-20 text-center text-slate-500">{isZh ? "暂无友链" : "No links yet"}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-dark flex items-start gap-4 p-5 transition hover:border-blue-500/40"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-800 text-lg font-bold text-blue-400">
                  {l.logo ? <img src={l.logo} alt={isZh ? l.nameZh : l.nameEn} className="h-full w-full object-cover" /> : (l.nameZh || l.nameEn || "?").slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-base font-semibold text-white">{isZh ? l.nameZh : l.nameEn}</h2>
                    <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{categories[l.category]?.[isZh ? "zh" : "en"] || l.category}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-400">{isZh ? l.descriptionZh : l.descriptionEn}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
