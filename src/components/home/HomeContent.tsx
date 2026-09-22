"use client";

import Link from "next/link";
import { usePublishedArticles, usePublishedAgents, usePublishedPortfolio } from "@/hooks/use-store-data";

export function HomeContent({ locale, translations }: {
  locale: string;
  translations: {
    featuredPortfolio: { title: string; subtitle: string; viewAll: string; role: string };
    featuredArticles: { title: string; subtitle: string; viewMore: string };
    aiTools: { title: string; subtitle: string; usersTried: string; exploreMore: string; external: string; demo: string; boundary: string };
    resources: { title: string; subtitle: string; cta: string; desc: string };
    common: { featured: string; tryNow: string };
  };
}) {
  const isZh = locale === "zh";
  const { articles } = usePublishedArticles();
  const { agents } = usePublishedAgents();
  const { portfolio } = usePublishedPortfolio();

  const displayPortfolio = (portfolio.filter(p => p.featured).length >= 3
    ? portfolio.filter(p => p.featured)
    : portfolio).slice(0, 3);
  const displayArticles = articles.slice(0, 4);
  const displayAgents = (agents.filter(a => a.featured).length >= 3
    ? agents.filter(a => a.featured)
    : agents).slice(0, 3);

  return (
    <>
      {/* Featured Portfolio Section */}
      <section className="bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-12">
            <h2 className="section-title">{translations.featuredPortfolio.title}</h2>
            <p className="mt-2 text-slate-400">{translations.featuredPortfolio.subtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {displayPortfolio.map((item) => (
              <Link key={item.id} href={`/${locale}/portfolio/view?id=${item.id}`} className="card-dark group overflow-hidden p-0 transition-transform hover:-translate-y-1">
                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                  <img
                    src={item.coverImage}
                    alt={isZh ? item.titleZh : item.titleEn}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{tag}</span>
                    ))}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-white">{isZh ? item.titleZh : item.titleEn}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-400">{isZh ? item.summaryZh : item.summaryEn}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    {translations.featuredPortfolio.role}: {isZh ? item.roleZh : item.roleEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={`/${locale}/portfolio`} className="btn-secondary">
              {translations.featuredPortfolio.viewAll}
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="border-t border-slate-800 bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-12">
            <h2 className="section-title">{translations.featuredArticles.title}</h2>
            <p className="mt-2 text-slate-400">{translations.featuredArticles.subtitle}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayArticles.map((article) => (
              <Link key={article.id} href={`/${locale}/articles/view?id=${article.id}`} className="card-dark group flex flex-col overflow-hidden p-0 transition-transform hover:-translate-y-1">
                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                  <img
                    src={article.coverImage}
                    alt={isZh ? article.titleZh : article.titleEn}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-wrap gap-1.5">
                    {article.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{tag}</span>
                    ))}
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-base font-bold text-white">{isZh ? article.titleZh : article.titleEn}</h3>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-400">{isZh ? article.summaryZh : article.summaryEn}</p>
                  <time className="mt-3 text-xs text-slate-500">
                    {new Date(article.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US")}
                  </time>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href={`/${locale}/articles`} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
              {translations.featuredArticles.viewMore}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* AI Tools Section */}
      <section className="border-t border-slate-800 bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-12 text-center">
            <h2 className="section-title">{translations.aiTools.title}</h2>
            <p className="mt-2 text-slate-400">{translations.aiTools.subtitle}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {displayAgents.map((agent) => {
              const isDemo = !agent.agentUrl || agent.agentUrl === "#" || agent.agentUrl.startsWith("/");
              return (
                <div key={agent.id} className="card-dark flex flex-col overflow-hidden p-0">
                  <div className="aspect-video w-full overflow-hidden bg-slate-800">
                    <img src={agent.imageUrl} alt={isZh ? agent.nameZh : agent.nameEn} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${isDemo ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                        {isDemo ? translations.aiTools.demo : translations.aiTools.external}
                      </span>
                      <span className="badge-category">{agent.category}</span>
                    </div>
                    <h3 className="mt-3 text-lg font-bold text-white">{isZh ? agent.nameZh : agent.nameEn}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-400">{isZh ? agent.descriptionZh : agent.descriptionEn}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {translations.aiTools.boundary}: {isZh ? agent.descriptionZh : agent.descriptionEn}
                    </p>
                    <div className="mt-4 flex items-center justify-between pt-2">
                      <span className="flex items-center gap-1 text-sm text-slate-500">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {agent.userCount.toLocaleString()} {translations.aiTools.usersTried}
                      </span>
                      <Link href={`/${locale}/projects`} className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300">
                        {translations.common.tryNow}
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-12 text-center">
            <Link href={`/${locale}/projects`} className="btn-primary">
              {translations.aiTools.exploreMore}
            </Link>
          </div>
        </div>
      </section>

      {/* Resources Entry Section */}
      <section className="border-t border-slate-800 bg-slate-900 py-16">
        <div className="container-site">
          <div className="card-dark overflow-hidden bg-gradient-to-br from-blue-900/30 to-purple-900/20 p-10 text-center">
            <h2 className="section-title">{translations.resources.title}</h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-400">{translations.resources.desc}</p>
            <div className="mt-8">
              <Link href={`/${locale}/resources`} className="btn-primary">
                {translations.resources.cta}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
