"use client";

import Link from "next/link";
import { usePublishedPortfolio } from "@/hooks/use-store-data";

export default function PortfolioPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const { portfolio, loaded } = usePublishedPortfolio();

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "作品集" : "Portfolio"}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {isZh
              ? "聚焦 RAG、Agent 与大模型产品落地的实战案例，涵盖从需求定义、方案设计到效果评估的完整复盘。"
              : "Hands-on cases focused on RAG, Agent and LLM product delivery — full retrospectives from requirements and design to evaluation."}
          </p>
        </div>

        {loaded && portfolio.length === 0 ? (
          <p className="py-20 text-center text-slate-500">{isZh ? "暂无作品" : "No projects yet"}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((item) => (
              <Link
                key={item.id}
                href={`/${locale}/portfolio/view?id=${item.id}`}
                className="card-dark flex flex-col overflow-hidden p-0 transition hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                  <img src={item.coverImage} alt={isZh ? item.titleZh : item.titleEn} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{tag}</span>
                    ))}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-white">{isZh ? item.titleZh : item.titleEn}</h2>
                  <p className="mt-1 text-xs text-slate-500">{isZh ? item.roleZh : item.roleEn}</p>
                  <p className="mt-3 line-clamp-3 text-sm text-slate-400">{isZh ? item.summaryZh : item.summaryEn}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-blue-400">
                    {isZh ? "查看完整案例" : "View full case"}
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
