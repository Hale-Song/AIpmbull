"use client";

import { useLocale } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Product } from "@/lib/admin/store";
import { syncAllToApi } from "@/lib/api/client";

const emptyProduct = { nameZh: "", nameEn: "", descriptionZh: "", descriptionEn: "", imageUrl: "", websiteUrl: "", category: "", rating: 4.5, pmScenarioZh: "", pmScenarioEn: "", pmProsZh: "", pmProsEn: "", pmConsZh: "", pmConsEn: "", pmTakeawayZh: "", pmTakeawayEn: "", published: false, featured: false };

export default function AdminProductsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const lang = isZh ? "zh" : "en";
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(() => { seedDemoData(); setItems(store.list<Product>("products")); }, []);
  useEffect(() => { load(); syncAllToApi(); }, [load]);

  const handleSave = (data: typeof emptyProduct) => {
    if (editing) store.update<Product>("products", editing.id, data);
    else store.create<Product>("products", data);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = (id: string) => { store.delete("products", id); setDeleteConfirm(null); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{isZh ? `共 ${items.length} 个产品` : `${items.length} products total`}</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {isZh ? "新建产品" : "New Product"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
          <p className="text-sm text-slate-500">{isZh ? "暂无产品" : "No products yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="group rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-colors">
              {item.imageUrl && <img src={item.imageUrl} alt={isZh ? item.nameZh : item.nameEn} className="h-40 w-full object-cover" />}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white">{isZh ? item.nameZh : item.nameEn}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">{isZh ? item.descriptionZh : item.descriptionEn}</p>
                  </div>
                  {item.rating > 0 && <span className="ml-2 shrink-0 text-xs text-amber-400">{"★".repeat(Math.round(item.rating))} {item.rating}</span>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${item.published ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"}`}>
                    {item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                    </button>
                    {deleteConfirm === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(item.id)} className="rounded bg-red-600 px-2 py-0.5 text-xs text-white">OK</button>
                        <button onClick={() => setDeleteConfirm(null)} className="rounded bg-slate-700 px-2 py-0.5 text-xs text-white">X</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(item.id)} className="rounded-lg p-1.5 text-slate-400 hover:text-red-400 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-20" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-6">{editing ? (isZh ? "编辑产品" : "Edit Product") : (isZh ? "新建产品" : "New Product")}</h2>
            <ProductForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ editing, isZh, onSave, onCancel }: { editing: Product | null; isZh: boolean; onSave: (d: typeof emptyProduct) => void; onCancel: () => void }) {
  const [form, setForm] = useState(editing ? { nameZh: editing.nameZh, nameEn: editing.nameEn, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn, imageUrl: editing.imageUrl, websiteUrl: editing.websiteUrl, category: editing.category, rating: editing.rating, pmScenarioZh: editing.pmScenarioZh ?? "", pmScenarioEn: editing.pmScenarioEn ?? "", pmProsZh: editing.pmProsZh ?? "", pmProsEn: editing.pmProsEn ?? "", pmConsZh: editing.pmConsZh ?? "", pmConsEn: editing.pmConsEn ?? "", pmTakeawayZh: editing.pmTakeawayZh ?? "", pmTakeawayEn: editing.pmTakeawayEn ?? "", published: editing.published, featured: editing.featured } : { ...emptyProduct });
  const update = (f: string, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "中文名称" : "Name (Chinese)"}</label><input type="text" value={form.nameZh} onChange={(e) => update("nameZh", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "英文名称" : "Name (English)"}</label><input type="text" value={form.nameEn} onChange={(e) => update("nameEn", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "中文描述" : "Description (Chinese)"}</label><textarea value={form.descriptionZh} onChange={(e) => update("descriptionZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "英文描述" : "Description (English)"}</label><textarea value={form.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
      </div>
      <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "图片 URL" : "Image URL"}</label><input type="text" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
      <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "分类" : "Category"}</label><select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"><option value="">{isZh ? "请选择分类" : "Select category"}</option><option value="llm">{isZh ? "大语言模型" : "Large Language Models"}</option><option value="painting">{isZh ? "AI绘画" : "AI Painting"}</option><option value="writing">{isZh ? "AI写作" : "AI Writing"}</option><option value="coding">{isZh ? "AI编程" : "AI Coding"}</option><option value="office">{isZh ? "AI办公" : "AI Office"}</option><option value="video">{isZh ? "AI视频" : "AI Video"}</option></select></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "网站链接" : "Website URL"}</label><input type="text" value={form.websiteUrl} onChange={(e) => update("websiteUrl", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "评分" : "Rating"}</label><input type="number" min={0} max={5} step={0.1} value={form.rating} onChange={(e) => update("rating", parseFloat(e.target.value))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
      </div>
      <div className="border-t border-slate-800 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{isZh ? "PM 视角分析" : "PM Perspective"}</p>
        <div className="space-y-3">
          <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "适用场景（中）" : "Use case (ZH)"}</label><textarea value={form.pmScenarioZh} onChange={(e) => update("pmScenarioZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "适用场景（英）" : "Use case (EN)"}</label><textarea value={form.pmScenarioEn} onChange={(e) => update("pmScenarioEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "优点（中）" : "Pros (ZH)"}</label><textarea value={form.pmProsZh} onChange={(e) => update("pmProsZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
            <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "优点（英）" : "Pros (EN)"}</label><textarea value={form.pmProsEn} onChange={(e) => update("pmProsEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "局限（中）" : "Limits (ZH)"}</label><textarea value={form.pmConsZh} onChange={(e) => update("pmConsZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
            <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "局限（英）" : "Limits (EN)"}</label><textarea value={form.pmConsEn} onChange={(e) => update("pmConsEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          </div>
          <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "设计借鉴点（中）" : "Design takeaway (ZH)"}</label><textarea value={form.pmTakeawayZh} onChange={(e) => update("pmTakeawayZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "设计借鉴点（英）" : "Design takeaway (EN)"}</label><textarea value={form.pmTakeawayEn} onChange={(e) => update("pmTakeawayEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
        </div>
      </div>
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />{isZh ? "发布" : "Published"}</label>
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />{isZh ? "推荐" : "Featured"}</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
