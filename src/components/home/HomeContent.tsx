"use client";

import Link from "next/link";
import {
  usePublishedArticles,
  usePublishedAgents,
  usePublishedPortfolio,
  usePublishedNotes,
  usePublishedSlides,
  usePublishedLabs,
  usePublishedQA,
  usePublishedLinks,
} from "@/hooks/use-store-data";

export function HomeContent({ locale, translations }: {
  locale: string;
  translations: {
    featuredPortfolio: { title: string; subtitle: string; viewAll: string; role: string };
    featuredArticles: { title: string; subtitle: string; viewMore: string };
    aiTools: { title: string; subtitle: string; usersTried: string; exploreMore: string; external: string; demo: string; boundary: string };
    resources: { title: string; subtitle: string; cta: string; desc: string };
    showcase: {
      title: string; subtitle: string;
      portfolio: { title: string; desc: string };
      articles: { title: string; desc: string };
      tools: { title: string; desc: string };
      labs: { title: string; desc: string };
      notes: { title: string; desc: string };
      slides: { title: string; desc: string };
      qa: { title: string; desc: string };
      links: { title: string; desc: string };
    };
    community: {
      title: string; subtitle: string;
      qa: { title: string; desc: string; ask: string };
      links: { title: string; desc: string; viewAll: string };
    };
    learningHub: { title: string; subtitle: string };
    common: { featured: string; tryNow: string };
  };
}) {
  const isZh = locale === "zh";
  const { articles } = usePublishedArticles();
  const { agents } = usePublishedAgents();
  const { portfolio } = usePublishedPortfolio();
  const { notes } = usePublishedNotes();
  const { slides } = usePublishedSlides();
  const { labs } = usePublishedLabs();
  const { qa } = usePublishedQA();
  const { links } = usePublishedLinks();

  const displayPortfolio = (portfolio.filter(p => p.featured).length >= 3
    ? portfolio.filter(p => p.featured)
    : portfolio).slice(0, 3);
  const displayArticles = articles.slice(0, 4);
  const displayAgents = (agents.filter(a => a.featured).length >= 3
    ? agents.filter(a => a.featured)
    : agents).slice(0, 3);
  const displayNotes = notes.slice(0, 3);
  const displaySlides = slides.slice(0, 3);
  const displayQA = qa.slice(0, 3);

  const s = translations.showcase;
  const showcaseItems = [
    { href: `/${locale}/portfolio`, title: s.portfolio.title, desc: s.portfolio.desc, color: "from-blue-500/20 to-blue-600/5", iconColor: "text-blue-400", icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" },
    { href: `/${locale}/articles`, title: s.articles.title, desc: s.articles.desc, color: "from-purple-500/20 to-purple-600/5", iconColor: "text-purple-400", icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" },
    { href: `/${locale}/projects`, title: s.tools.title, desc: s.tools.desc, color: "from-emerald-500/20 to-emerald-600/5", iconColor: "text-emerald-400", icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" },
    { href: `/${locale}/labs`, title: s.labs.title, desc: s.labs.desc, color: "from-amber-500/20 to-amber-600/5", iconColor: "text-amber-400", icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
    { href: `/${locale}/notes`, title: s.notes.title, desc: s.notes.desc, color: "from-cyan-500/20 to-cyan-600/5", iconColor: "text-cyan-400", icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" },
    { href: `/${locale}/slides`, title: s.slides.title, desc: s.slides.desc, color: "from-rose-500/20 to-rose-600/5", iconColor: "text-rose-400", icon: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" },
    { href: `/${locale}/qa`, title: s.qa.title, desc: s.qa.desc, color: "from-indigo-500/20 to-indigo-600/5", iconColor: "text-indigo-400", icon: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" },
    { href: `/${locale}/links`, title: s.links.title, desc: s.links.desc, color: "from-teal-500/20 to-teal-600/5", iconColor: "text-teal-400", icon: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" },
  ];

  return (
    <>
      {/* Content Showcase Grid */}
      <section className="bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-10 text-center">
            <h2 className="section-title">{s.title}</h2>
            <p className="mt-2 text-slate-400">{s.subtitle}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {showcaseItems.map((item) => (
              <Link key={item.href} href={item.href} className="card-dark group flex items-start gap-4 p-5 transition-all hover:-translate-y-0.5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color}`}>
                  <svg className={`h-5 w-5 ${item.iconColor}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Portfolio */}
      <section className="border-t border-slate-800 bg-slate-900 py-16">
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

      {/* Latest Articles */}
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

      {/* AI Tools */}
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

      {/* Learning Hub: Notes + Labs + Slides */}
      <section className="border-t border-slate-800 bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-12">
            <h2 className="section-title">{translations.learningHub.title}</h2>
            <p className="mt-2 text-slate-400">{translations.learningHub.subtitle}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Notes */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <h3 className="text-base font-bold text-white">{s.notes.title}</h3>
              </div>
              <div className="space-y-3">
                {displayNotes.length === 0 ? (
                  <p className="py-4 text-sm text-slate-600">{isZh ? "暂无笔记" : "No notes yet"}</p>
                ) : displayNotes.map((note) => (
                  <Link key={note.id} href={`/${locale}/notes/view?id=${note.id}`} className="block rounded-lg bg-slate-800/50 p-3 transition-colors hover:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400">
                        {note.type === "book" ? (isZh ? "读书笔记" : "Book") : (isZh ? "学习日志" : "Log")}
                      </span>
                      {note.rating > 0 && (
                        <span className="text-xs text-amber-400">{"★".repeat(note.rating)}</span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-1 text-sm font-medium text-white">{isZh ? note.titleZh : note.titleEn}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{isZh ? note.summaryZh : note.summaryEn}</p>
                  </Link>
                ))}
              </div>
              <Link href={`/${locale}/notes`} className="mt-3 inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300">
                {isZh ? "查看全部" : "View all"}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>

            {/* Labs */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                <h3 className="text-base font-bold text-white">{s.labs.title}</h3>
              </div>
              <div className="space-y-3">
                {labs.length === 0 ? (
                  <p className="py-4 text-sm text-slate-600">{isZh ? "暂无模板" : "No templates yet"}</p>
                ) : labs.slice(0, 3).map((lab) => (
                  <Link key={lab.id} href={`/${locale}/labs`} className="block rounded-lg bg-slate-800/50 p-3 transition-colors hover:bg-slate-800">
                    <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">{lab.category}</span>
                    <p className="mt-1.5 text-sm font-medium text-white">{isZh ? lab.nameZh : lab.nameEn}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{isZh ? lab.descriptionZh : lab.descriptionEn}</p>
                  </Link>
                ))}
              </div>
              <Link href={`/${locale}/labs`} className="mt-3 inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300">
                {isZh ? "进入实验室" : "Enter lab"}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>

            {/* Slides */}
            <div>
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-rose-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                </svg>
                <h3 className="text-base font-bold text-white">{s.slides.title}</h3>
              </div>
              <div className="space-y-3">
                {displaySlides.length === 0 ? (
                  <p className="py-4 text-sm text-slate-600">{isZh ? "暂无分享" : "No slides yet"}</p>
                ) : displaySlides.map((slide) => (
                  <div key={slide.id} className="rounded-lg bg-slate-800/50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-medium text-rose-400">{slide.topic}</span>
                      <span className="text-[10px] text-slate-600">{slide.slidesCount} {isZh ? "页" : "slides"}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-medium text-white">{isZh ? slide.titleZh : slide.titleEn}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{isZh ? slide.descriptionZh : slide.descriptionEn}</p>
                    <div className="mt-2 flex gap-2">
                      {slide.viewUrl && <a href={slide.viewUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-rose-400 hover:text-rose-300">{isZh ? "查看" : "View"}</a>}
                      {slide.downloadUrl && <a href={slide.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 hover:text-slate-400">{isZh ? "下载" : "Download"}</a>}
                    </div>
                  </div>
                ))}
              </div>
              <Link href={`/${locale}/slides`} className="mt-3 inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300">
                {isZh ? "查看全部" : "View all"}
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community: Q&A + Links */}
      <section className="border-t border-slate-800 bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-10 text-center">
            <h2 className="section-title">{translations.community.title}</h2>
            <p className="mt-2 text-slate-400">{translations.community.subtitle}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2">
            {/* Q&A */}
            <div className="card-dark p-6">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
                <h3 className="text-base font-bold text-white">{translations.community.qa.title}</h3>
              </div>
              <p className="mb-4 text-sm text-slate-500">{translations.community.qa.desc}</p>
              <div className="space-y-3">
                {displayQA.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-600">{isZh ? "暂无问答" : "No Q&A yet"}</p>
                ) : displayQA.map((q) => (
                  <div key={q.id} className="rounded-lg bg-slate-800/50 p-3">
                    <p className="text-sm font-medium text-white">{isZh ? q.questionZh : q.questionEn}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">{isZh ? q.answerZh : q.answerEn}</p>
                  </div>
                ))}
              </div>
              <Link href={`/${locale}/qa`} className="mt-4 inline-flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300">
                {translations.community.qa.ask}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>

            {/* Friend Links */}
            <div className="card-dark p-6">
              <div className="mb-4 flex items-center gap-2">
                <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                </svg>
                <h3 className="text-base font-bold text-white">{translations.community.links.title}</h3>
              </div>
              <p className="mb-4 text-sm text-slate-500">{translations.community.links.desc}</p>
              <div className="grid grid-cols-2 gap-3">
                {links.slice(0, 4).map((link) => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg bg-slate-800/50 p-3 transition-colors hover:bg-slate-800">
                    {link.logo ? (
                      <img src={link.logo} alt={isZh ? link.nameZh : link.nameEn} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-400">
                        {(isZh ? link.nameZh : link.nameEn).charAt(0)}
                      </div>
                    )}
                    <span className="truncate text-sm text-slate-400">{isZh ? link.nameZh : link.nameEn}</span>
                  </a>
                ))}
                {links.length === 0 && [...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-800/50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-500/10 text-xs font-bold text-teal-400">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="truncate text-sm text-slate-400">{isZh ? "友链站点" : "Link site"} {i + 1}</span>
                  </div>
                ))}
              </div>
              <Link href={`/${locale}/links`} className="mt-4 inline-flex items-center gap-1 text-sm text-teal-400 hover:text-teal-300">
                {translations.community.links.viewAll}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Resources CTA */}
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
