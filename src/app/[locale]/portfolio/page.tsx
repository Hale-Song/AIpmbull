"use client";

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
              <div key={item.id} className="card-dark flex flex-col overflow-hidden p-0">
                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                  <img src={item.coverImage} alt={isZh ? item.titleZh : item.titleEn} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{tag}</span>
                    ))}
                  </div>
                  <h2 className="mt-3 text-lg font-bold text-white">{isZh ? item.titleZh : item.titleEn}</h2>
                  <p className="mt-1 text-xs text-slate-500">{isZh ? item.roleZh : item.roleEn}</p>
                  <p className="mt-3 text-sm text-slate-400">{isZh ? item.summaryZh : item.summaryEn}</p>
                  {(isZh ? item.detailZh : item.detailEn) && (
                    <p className="mt-3 border-t border-slate-800 pt-3 text-sm text-slate-400">
                      {isZh ? item.detailZh : item.detailEn}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
