"use client";

import { useLocale } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Article } from "@/lib/admin/store";

const emptyArticle: Omit<Article, "id" | "createdAt" | "updatedAt"> = {
  titleZh: "", titleEn: "", summaryZh: "", summaryEn: "", contentZh: "", contentEn: "",
  coverImage: "", category: "", tags: [], published: false, featured: false,
};

const categories = [
  { value: "productReview", zh: "产品评测", en: "Product Review" },
  { value: "productComparison", zh: "产品对比", en: "Product Comparison" },
  { value: "industryInsights", zh: "行业洞察", en: "Industry Insights" },
];

export default function AdminArticlesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const lang = isZh ? "zh" : "en";
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(() => {
    seedDemoData();
    setArticles(store.list<Article>("articles"));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = articles.filter((a) => {
    if (filter === "published" && !a.published) return false;
    if (filter === "draft" && a.published) return false;
    if (search && !a.titleZh.includes(search) && !a.titleEn.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleSave = (data: Omit<Article, "id" | "createdAt" | "updatedAt">) => {
    if (editing) {
      store.update<Article>("articles", editing.id, data);
    } else {
      store.create<Article>("articles", data);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = (id: string) => {
    store.delete("articles", id);
    setDeleteConfirm(null);
    load();
  };

  const handleTogglePublish = (id: string, published: boolean) => {
    store.update<Article>("articles", id, { published: !published });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-700 bg-slate-800 p-0.5">
            {(["all", "published", "draft"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {f === "all" ? (isZh ? "全部" : "All") : f === "published" ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input type="text" placeholder={isZh ? "搜索文章..." : "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {isZh ? "新建文章" : "New Article"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" /></svg>
          <p className="mt-3 text-sm text-slate-500">{isZh ? "暂无文章" : "No articles yet"}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs font-medium uppercase text-slate-500">
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
                    <div className="flex items-center gap-3">
                      {article.coverImage && <img src={article.coverImage} alt="" className="h-10 w-10 rounded-lg object-cover" />}
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
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(article.id)} className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">{isZh ? "确认" : "Yes"}</button>
                          <button onClick={() => setDeleteConfirm(null)} className="rounded-lg bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600">{isZh ? "取消" : "No"}</button>
                        </div>
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

function ArticleForm({ article, isZh, onSave, onCancel }: { article: Article | null; isZh: boolean; onSave: (data: Omit<Article, "id" | "createdAt" | "updatedAt">) => void; onCancel: () => void }) {
  const [form, setForm] = useState(article ? { titleZh: article.titleZh, titleEn: article.titleEn, summaryZh: article.summaryZh, summaryEn: article.summaryEn, contentZh: article.contentZh, contentEn: article.contentEn, coverImage: article.coverImage, category: article.category, tags: article.tags, published: article.published, featured: article.featured } : { ...emptyArticle });

  const update = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-20" onClick={onCancel}>
      <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-white mb-6">{article ? (isZh ? "编辑文章" : "Edit Article") : (isZh ? "新建文章" : "New Article")}</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "中文标题" : "Title (Chinese)"}</label>
              <input type="text" value={form.titleZh} onChange={(e) => update("titleZh", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "英文标题" : "Title (English)"}</label>
              <input type="text" value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "中文摘要" : "Summary (Chinese)"}</label>
              <textarea value={form.summaryZh} onChange={(e) => update("summaryZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "英文摘要" : "Summary (English)"}</label>
              <textarea value={form.summaryEn} onChange={(e) => update("summaryEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "封面图片 URL" : "Cover Image URL"}</label>
            <input type="text" value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="https://..." />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "分类" : "Category"}</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="">{isZh ? "选择分类" : "Select category"}</option>
                {categories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "标签（逗号分隔）" : "Tags (comma separated)"}</label>
              <input type="text" value={form.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "中文内容" : "Content (Chinese)"}</label>
              <textarea value={form.contentZh} onChange={(e) => update("contentZh", e.target.value)} rows={4} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "英文内容" : "Content (English)"}</label>
              <textarea value={form.contentEn} onChange={(e) => update("contentEn", e.target.value)} rows={4} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500" />
              {isZh ? "发布" : "Published"}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500" />
              {isZh ? "推荐" : "Featured"}
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors">{isZh ? "取消" : "Cancel"}</button>
          <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
