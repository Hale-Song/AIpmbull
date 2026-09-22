"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Article, type ImageItem } from "@/lib/admin/store";
import { syncAllToApi, syncFromApi, apiClient } from "@/lib/api/client";
import { FilterBar, EmptyState, DeleteConfirm } from "@/components/admin";
import ArticleForm from "./ArticleForm";
import { getUniqueImageUrls, replaceImageSrcInHtml } from "@/lib/admin/image-utils";
import { isGithubConfigured, uploadImageToGithub } from "@/lib/admin/github";

const categories = [
  { value: "productReview", zh: "产品评测", en: "Product Review" },
  { value: "productComparison", zh: "产品对比", en: "Product Comparison" },
  { value: "industryInsights", zh: "行业洞察", en: "Industry Insights" },
  { value: "aiProductManager", zh: "AI产品经理", en: "AI Product Manager" },
];

function exportArticlesData(articles: Article[]) {
  const published = articles.filter(a => a.published);
  const json = JSON.stringify(published, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert(published.length > 0
      ? `已复制 ${published.length} 篇已发布文章的 JSON 数据到剪贴板。请粘贴到 data/articles.json 文件中，然后重新构建部署。`
      : "没有已发布的文章可导出。");
  }).catch(() => {
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<pre style="white-space:pre-wrap;font-family:monospace;">${json}</pre>`);
    }
  });
}

export default function AdminArticlesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const lang = isZh ? "zh" : "en";
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateProgress, setMigrateProgress] = useState("");
  const [migrateDone, setMigrateDone] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    seedDemoData();
    setArticles(store.list<Article>("articles"));
  }, []);

  useEffect(() => { setLoading(true); syncFromApi().then(() => { load(); setLoading(false); }); }, [load]);

  const allCount = articles.length;
  const publishedCount = articles.filter(a => a.published).length;
  const draftCount = allCount - publishedCount;

  const filtered = articles.filter((a) => {
    if (filter === "published" && !a.published) return false;
    if (filter === "draft" && a.published) return false;
    if (search && !a.titleZh.includes(search) && !a.titleEn.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => (b.articleNo || "").localeCompare(a.articleNo || ""));

  const handleSave = (data: Omit<Article, "id" | "articleNo" | "createdAt" | "updatedAt">) => {
    if (editing) {
      store.update<Article>("articles", editing.id, data);
    } else {
      store.create<Article>("articles", data);
    }
    setShowForm(false);
    setEditing(null);
    load();
    syncAllToApi();
  };

  const handleDelete = (id: string) => {
    store.delete("articles", id);
    setDeleteConfirm(null);
    load();
    syncAllToApi();
  };

  const handleTogglePublish = (id: string, published: boolean) => {
    store.update<Article>("articles", id, { published: !published });
    load();
    syncAllToApi();
  };

  const handleMigrateImages = async () => {
    if (!isGithubConfigured()) {
      alert(isZh
        ? "请先在「设置」页面配置 GitHub Token 和仓库信息"
        : "Please configure GitHub Token and repo in Settings first");
      return;
    }

    setMigrating(true);
    setMigrateDone(false);
    setMigrateProgress(isZh ? "正在从服务器同步最新数据..." : "Syncing latest data from server...");

    try {
      const kvArticles = await apiClient.list<Article>("articles");
      if (kvArticles.length > 0) {
        localStorage.setItem("aipmbull_articles", JSON.stringify(kvArticles));
      }
      const kvImages = await apiClient.list<ImageItem>("images");
      if (kvImages.length > 0) {
        localStorage.setItem("aipmbull_images", JSON.stringify(kvImages));
      }
    } catch {
      // fall through to use existing localStorage data
    }

    const allArticles = store.list<Article>("articles");
    const urlsToMigrate: { articleId: string; url: string; field: "contentZh" | "contentEn" | "coverImage" }[] = [];
    const seen = new Set<string>();

    for (const article of allArticles) {
      const contentUrls = [
        ...getUniqueImageUrls(article.contentZh),
        ...getUniqueImageUrls(article.contentEn),
      ];
      for (const u of contentUrls) {
        if (!u.includes("raw.githubusercontent.com") && !seen.has(u)) {
          seen.add(u);
          urlsToMigrate.push({ articleId: article.id, url: u, field: "contentZh" });
        }
      }
      if (article.coverImage && !article.coverImage.includes("raw.githubusercontent.com") && !seen.has(article.coverImage)) {
        seen.add(article.coverImage);
        urlsToMigrate.push({ articleId: article.id, url: article.coverImage, field: "coverImage" });
      }
    }

    if (urlsToMigrate.length === 0) {
      setMigrating(false);
      setMigrateDone(true);
      setMigrateProgress(isZh ? "所有图片已在 GitHub 上" : "All images already on GitHub");
      setTimeout(() => setMigrateDone(false), 3000);
      return;
    }

    const replacements = new Map<string, string>();
    let done = 0;

    for (const item of urlsToMigrate) {
      done++;
      setMigrateProgress(isZh
        ? `正在上传 ${done}/${urlsToMigrate.length}: ${item.url.slice(0, 50)}...`
        : `Uploading ${done}/${urlsToMigrate.length}: ${item.url.slice(0, 50)}...`);

      const result = await uploadImageToGithub(item.url);
      if (result.success) {
        replacements.set(item.url, result.url);
        store.create<ImageItem>("images", {
          titleZh: `文章配图 ${result.filename}`,
          titleEn: `Article image ${result.filename}`,
          url: result.url,
          descriptionZh: "",
          descriptionEn: "",
          githubFilename: result.filename,
          githubUrl: result.url,
          sourceType: "article",
          sourceId: item.articleId,
          published: true,
        });
      }
    }

    if (replacements.size > 0) {
      for (const article of allArticles) {
        const updates: Partial<Article> = {};
        const newContentZh = replaceImageSrcInHtml(article.contentZh, replacements);
        const newContentEn = replaceImageSrcInHtml(article.contentEn, replacements);
        if (newContentZh !== article.contentZh) updates.contentZh = newContentZh;
        if (newContentEn !== article.contentEn) updates.contentEn = newContentEn;
        if (article.coverImage && replacements.has(article.coverImage)) {
          updates.coverImage = replacements.get(article.coverImage)!;
        }
        if (Object.keys(updates).length > 0) {
          store.update<Article>("articles", article.id, updates as Omit<Article, "id" | "createdAt" | "updatedAt">);
        }
      }
    }

    setMigrating(false);
    setMigrateDone(true);
    setMigrateProgress(isZh
      ? `完成！已迁移 ${replacements.size} 张图片到 GitHub`
      : `Done! Migrated ${replacements.size} images to GitHub`);
    load();
    syncAllToApi();
    setTimeout(() => setMigrateDone(false), 5000);
  };

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: allCount },
    { key: "published", label: isZh ? "已发布" : "Published", count: publishedCount },
    { key: "draft", label: isZh ? "草稿" : "Draft", count: draftCount },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <svg className="h-8 w-8 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          <p className="text-sm text-slate-400">{isZh ? "加载中..." : "Loading..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FilterBar
          tabs={tabs}
          activeTab={filter}
          onTabChange={(k) => setFilter(k as "all" | "published" | "draft")}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={isZh ? "搜索文章..." : "Search..."}
        />
        <div className="flex shrink-0 items-center gap-2">
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新建文章" : "New Article"}
          </button>
          <button onClick={handleMigrateImages} disabled={migrating} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:opacity-50">
            {migrating ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            )}
            {migrating ? migrateProgress : migrateDone ? migrateProgress : (isZh ? "迁移图片到GitHub" : "Migrate to GitHub")}
          </button>
          <button onClick={() => exportArticlesData(articles)} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:text-white">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            {isZh ? "导出数据" : "Export"}
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={isZh ? "暂无文章" : "No articles yet"}
          action={
            <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-sm">
              {isZh ? "新建文章" : "New Article"}
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-5 py-3">{isZh ? "编号" : "No."}</th>
                <th className="px-5 py-3">{isZh ? "标题" : "Title"}</th>
                <th className="px-5 py-3 hidden sm:table-cell">{isZh ? "分类" : "Category"}</th>
                <th className="px-5 py-3 hidden md:table-cell">{isZh ? "日期" : "Date"}</th>
                <th className="px-5 py-3">{isZh ? "状态" : "Status"}</th>
                <th className="px-5 py-3 text-right">{isZh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-blue-400">{article.articleNo || "—"}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {article.coverImage && <img src={article.coverImage} alt={article.titleZh} className="h-10 w-10 rounded-lg object-cover" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{isZh ? article.titleZh : article.titleEn}</p>
                        <p className="truncate text-xs text-slate-500 sm:hidden">{categories.find(c => c.value === article.category)?.[lang]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">{categories.find(c => c.value === article.category)?.[lang] || article.category}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden md:table-cell">{new Date(article.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US")}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleTogglePublish(article.id, article.published)} className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${article.published ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"}`}>
                      {article.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(article); setShowForm(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" title={isZh ? "编辑" : "Edit"}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                      </button>
                      {deleteConfirm === article.id ? (
                        <DeleteConfirm
                          onConfirm={() => handleDelete(article.id)}
                          onCancel={() => setDeleteConfirm(null)}
                          confirmLabel={isZh ? "确认" : "Yes"}
                          cancelLabel={isZh ? "取消" : "No"}
                        />
                      ) : (
                        <button onClick={() => setDeleteConfirm(article.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-colors" title={isZh ? "删除" : "Delete"}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ArticleForm
          article={editing}
          isZh={isZh}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
