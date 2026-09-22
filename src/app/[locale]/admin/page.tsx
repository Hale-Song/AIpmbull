"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { store, seedDemoData } from "@/lib/admin/store";
import { PageHeader, StatusBadge } from "@/components/admin";

const t: Record<string, Record<string, string>> = {
  title: { zh: "控制台", en: "Dashboard" },
  subtitle: { zh: "内容管理概览", en: "Content Management Overview" },
  totalArticles: { zh: "文章", en: "Articles" },
  totalProducts: { zh: "产品", en: "Products" },
  totalAgents: { zh: "智能体", en: "Agents" },
  totalVideos: { zh: "视频", en: "Videos" },
  totalImages: { zh: "图片", en: "Images" },
  totalPortfolio: { zh: "作品", en: "Portfolio" },
  totalNotes: { zh: "笔记", en: "Notes" },
  totalSlides: { zh: "PPT", en: "Slides" },
  totalLabs: { zh: "实验室", en: "Labs" },
  totalQA: { zh: "问答", en: "Q&A" },
  totalLinks: { zh: "友链", en: "Links" },
  quickActions: { zh: "快捷操作", en: "Quick Actions" },
  recentActivity: { zh: "最近动态", en: "Recent Activity" },
  pendingAlerts: { zh: "待处理事项", en: "Pending Items" },
  newArticle: { zh: "新建文章", en: "New Article" },
  newProduct: { zh: "新建产品", en: "New Product" },
  newAgent: { zh: "新建智能体", en: "New Agent" },
  workbench: { zh: "工作台", en: "Workbench" },
  qaPending: { zh: "待回复问答", en: "Pending Q&A" },
  viewAll: { zh: "查看全部", en: "View All" },
  published: { zh: "已发布", en: "Published" },
  draft: { zh: "草稿", en: "Draft" },
  pending: { zh: "待回复", en: "Pending" },
  noPending: { zh: "暂无待处理事项", en: "No pending items" },
};

export default function AdminDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const lang = isZh ? "zh" : "en";
  const [counts, setCounts] = useState({
    articles: 0, products: 0, agents: 0, videos: 0, images: 0,
    portfolio: 0, notes: 0, slides: 0, labs: 0, qa: 0, links: 0,
    pendingQA: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string; type: string; title: string; status: string; date: string; href: string;
  }>>([]);

  useEffect(() => {
    seedDemoData();
    const articles = store.list<any>("articles");
    const products = store.list<any>("products");
    const agents = store.list<any>("agents");
    const videos = store.list<any>("videos");
    const portfolio = store.list<any>("portfolio");
    const notes = store.list<any>("notes");
    const slides = store.list<any>("slides");
    const labs = store.list<any>("labs");
    const qa = store.list<any>("qa");
    const links = store.list<any>("links");

    setCounts({
      articles: articles.length,
      products: products.length,
      agents: agents.length,
      videos: videos.length,
      images: store.count("images"),
      portfolio: portfolio.length,
      notes: notes.length,
      slides: slides.length,
      labs: labs.length,
      qa: qa.length,
      links: links.length,
      pendingQA: qa.filter((q: any) => q.status === "pending").length,
    });

    const activity = [
      ...articles.slice(0, 3).map((a: any) => ({ id: a.id, type: "article", title: isZh ? a.titleZh : a.titleEn, status: a.published ? "published" : "draft", date: a.createdAt, href: `/${locale}/admin/articles` })),
      ...products.slice(0, 2).map((p: any) => ({ id: p.id, type: "product", title: isZh ? p.nameZh : p.nameEn, status: p.published ? "published" : "draft", date: p.createdAt, href: `/${locale}/admin/products` })),
      ...portfolio.slice(0, 2).map((p: any) => ({ id: p.id, type: "portfolio", title: isZh ? p.titleZh : p.titleEn, status: p.published ? "published" : "draft", date: p.createdAt, href: `/${locale}/admin/portfolio` })),
      ...qa.filter((q: any) => q.status === "pending").slice(0, 3).map((q: any) => ({ id: q.id, type: "qa", title: isZh ? q.questionZh : q.questionEn, status: "pending", date: q.createdAt, href: `/${locale}/admin/qa` })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

    setRecentActivity(activity);
  }, [locale, isZh]);

  const primaryStats = [
    { label: t.totalArticles[lang], count: counts.articles, href: `/${locale}/admin/articles`, color: "from-blue-500 to-blue-600", icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" },
    { label: t.totalProducts[lang], count: counts.products, href: `/${locale}/admin/products`, color: "from-purple-500 to-purple-600", icon: "M20.25 7.5l-.625 3.285c.153.63-.16 1.282-.77 1.555l-2.662 1.197a1.125 1.125 0 0 0-.659.783l-.384 2.088a1.125 1.125 0 0 1-1.478.832l-2.606-.94a1.125 1.125 0 0 0-.87 0l-2.606.94a1.125 1.125 0 0 1-1.478-.832l-.384-2.088a1.125 1.125 0 0 0-.659-.783l-2.662-1.197a1.125 1.125 0 0 1-.77-1.555L3.75 7.5m16.5 0L12 3.75 3.75 7.5m16.5 0L12 11.25 3.75 7.5M12 11.25v9" },
    { label: t.totalAgents[lang], count: counts.agents, href: `/${locale}/admin/agents`, color: "from-emerald-500 to-emerald-600", icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" },
    { label: t.totalQA[lang], count: counts.qa, href: `/${locale}/admin/qa`, color: "from-amber-500 to-amber-600", icon: "M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z", badge: counts.pendingQA > 0 ? counts.pendingQA : undefined },
  ];

  const secondaryStats = [
    { label: t.totalPortfolio[lang], count: counts.portfolio, href: `/${locale}/admin/portfolio`, icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" },
    { label: t.totalNotes[lang], count: counts.notes, href: `/${locale}/admin/notes`, icon: "M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" },
    { label: t.totalSlides[lang], count: counts.slides, href: `/${locale}/admin/slides`, icon: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" },
    { label: t.totalLabs[lang], count: counts.labs, href: `/${locale}/admin/labs`, icon: "M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
    { label: t.totalVideos[lang], count: counts.videos, href: `/${locale}/admin/videos`, icon: "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" },
    { label: t.totalImages[lang], count: counts.images, href: `/${locale}/admin/images`, icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" },
    { label: t.totalLinks[lang], count: counts.links, href: `/${locale}/admin/links`, icon: "M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" },
  ];

  const quickActions = [
    { label: t.newArticle[lang], href: `/${locale}/admin/articles`, color: "text-blue-400", icon: "M12 4.5v15m7.5-7.5h-15" },
    { label: t.newProduct[lang], href: `/${locale}/admin/products`, color: "text-purple-400", icon: "M12 4.5v15m7.5-7.5h-15" },
    { label: t.newAgent[lang], href: `/${locale}/admin/agents`, color: "text-emerald-400", icon: "M12 4.5v15m7.5-7.5h-15" },
    { label: t.workbench[lang], href: `/${locale}/admin/workbench`, color: "text-cyan-400", icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t.title[lang]} subtitle={t.subtitle[lang]} />

      {/* Primary stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {primaryStats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group relative rounded-xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-slate-700 hover:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold text-white">{stat.count}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} opacity-80 group-hover:opacity-100 transition-opacity`}>
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
            </div>
            {stat.badge && (
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {stat.badge}
              </div>
            )}
          </Link>
        ))}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {secondaryStats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-center transition-all hover:border-slate-700 hover:bg-slate-800/50">
            <svg className="mx-auto h-5 w-5 text-slate-500 group-hover:text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
            </svg>
            <p className="mt-1 text-lg font-bold text-white">{stat.count}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t.recentActivity[lang]}</h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">{isZh ? "暂无动态" : "No activity yet"}</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((item) => (
                <Link key={item.id} href={item.href} className="flex items-center justify-between rounded-lg bg-slate-800/30 px-4 py-3 transition-colors hover:bg-slate-800/50">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium capitalize ${
                        item.type === "article" ? "text-blue-400" :
                        item.type === "product" ? "text-purple-400" :
                        item.type === "portfolio" ? "text-cyan-400" :
                        "text-amber-400"
                      }`}>
                        {item.type}
                      </span>
                      <p className="truncate text-sm font-medium text-white">{item.title}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{new Date(item.date).toLocaleDateString(isZh ? "zh-CN" : "en-US")}</p>
                  </div>
                  <StatusBadge status={item.status} label={t[item.status as keyof typeof t]?.[lang] || item.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">{t.quickActions[lang]}</h2>
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href} className="flex items-center gap-3 rounded-lg bg-slate-800/30 px-4 py-3 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white">
                <svg className={`h-5 w-5 ${action.color}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d={action.icon} />
                </svg>
                {action.label}
              </Link>
            ))}
            {counts.pendingQA > 0 && (
              <Link href={`/${locale}/admin/qa`} className="flex items-center gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
                {t.qaPending[lang]} ({counts.pendingQA})
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
