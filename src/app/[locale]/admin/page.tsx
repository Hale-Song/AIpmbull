"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { store, seedDemoData } from "@/lib/admin/store";

const t: Record<string, Record<string, string>> = {
  title: { zh: "控制台", en: "Dashboard" },
  totalArticles: { zh: "文章总数", en: "Articles" },
  totalProducts: { zh: "产品总数", en: "Products" },
  totalAgents: { zh: "智能体总数", en: "Agents" },
  totalVideos: { zh: "视频总数", en: "Videos" },
  totalImages: { zh: "图片总数", en: "Images" },
  quickActions: { zh: "快捷操作", en: "Quick Actions" },
  workbench: { zh: "任务工作台", en: "Task Workbench" },
  newArticle: { zh: "新建文章", en: "New Article" },
  newProduct: { zh: "新建产品", en: "New Product" },
  newAgent: { zh: "新建智能体", en: "New Agent" },
  newVideo: { zh: "新建视频", en: "New Video" },
  manageContent: { zh: "管理内容", en: "Manage Content" },
  siteSettings: { zh: "网站设置", en: "Site Settings" },
  recentArticles: { zh: "最近文章", en: "Recent Articles" },
  published: { zh: "已发布", en: "Published" },
  draft: { zh: "草稿", en: "Draft" },
  viewAll: { zh: "查看全部", en: "View All" },
};

export default function AdminDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const lang = isZh ? "zh" : "en";
  const [counts, setCounts] = useState({ articles: 0, products: 0, agents: 0, videos: 0, images: 0 });
  const [recentArticles, setRecentArticles] = useState<Array<{ id: string; titleZh: string; titleEn: string; published: boolean; createdAt: string }>>([]);

  useEffect(() => {
    seedDemoData();
    setCounts({
      articles: store.count("articles"),
      products: store.count("products"),
      agents: store.count("agents"),
      videos: store.count("videos"),
      images: store.count("images"),
    });
    setRecentArticles(store.list<{ id: string; titleZh: string; titleEn: string; published: boolean; createdAt: string }>("articles").slice(0, 5));
  }, []);

  const stats = [
    { label: t.totalArticles[lang], count: counts.articles, href: `/${locale}/admin/articles`, color: "from-blue-500 to-blue-600", icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" },
    { label: t.totalProducts[lang], count: counts.products, href: `/${locale}/admin/products`, color: "from-purple-500 to-purple-600", icon: "M20.25 7.5l-.625 3.285c.153.63-.16 1.282-.77 1.555l-2.662 1.197a1.125 1.125 0 0 0-.659.783l-.384 2.088a1.125 1.125 0 0 1-1.478.832l-2.606-.94a1.125 1.125 0 0 0-.87 0l-2.606.94a1.125 1.125 0 0 1-1.478-.832l-.384-2.088a1.125 1.125 0 0 0-.659-.783l-2.662-1.197a1.125 1.125 0 0 1-.77-1.555L3.75 7.5m16.5 0L12 3.75 3.75 7.5m16.5 0L12 11.25 3.75 7.5M12 11.25v9" },
    { label: t.totalAgents[lang], count: counts.agents, href: `/${locale}/admin/agents`, color: "from-emerald-500 to-emerald-600", icon: "M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" },
    { label: t.totalVideos[lang], count: counts.videos, href: `/${locale}/admin/videos`, color: "from-amber-500 to-amber-600", icon: "m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group rounded-xl border border-slate-800 bg-slate-900 p-5 transition-all hover:border-slate-700 hover:bg-slate-800/50">
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
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">{t.recentArticles[lang]}</h2>
            <Link href={`/${locale}/admin/articles`} className="text-sm text-blue-400 hover:text-blue-300">{t.viewAll[lang]}</Link>
          </div>
          {recentArticles.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">{isZh ? "暂无文章" : "No articles yet"}</p>
          ) : (
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between rounded-lg bg-slate-800/50 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{isZh ? article.titleZh : article.titleEn}</p>
                    <p className="text-xs text-slate-500">{new Date(article.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US")}</p>
                  </div>
                  <span className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${article.published ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {article.published ? t.published[lang] : t.draft[lang]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">{t.quickActions[lang]}</h2>
          <div className="space-y-2">
            <Link href={`/${locale}/admin/workbench`} className="flex items-center gap-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 px-4 py-3 text-sm font-medium text-blue-400 hover:from-blue-500/20 hover:to-purple-500/20 transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>
              {t.workbench[lang]}
            </Link>
            <Link href={`/${locale}/admin/articles`} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              {t.newArticle[lang]}
            </Link>
            <Link href={`/${locale}/admin/products`} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              {t.newProduct[lang]}
            </Link>
            <Link href={`/${locale}/admin/agents`} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              {t.newAgent[lang]}
            </Link>
            <Link href={`/${locale}/admin/videos`} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <svg className="h-5 w-5 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              {t.newVideo[lang]}
            </Link>
            <Link href={`/${locale}/admin/settings`} className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
              {t.siteSettings[lang]}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
