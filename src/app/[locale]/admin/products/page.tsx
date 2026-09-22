"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Product } from "@/lib/admin/store";
import { syncAllToApi, syncFromApi } from "@/lib/api/client";
import {
  PageHeader,
  AdminModal,
  StatusBadge,
  EmptyState,
  BilingualField,
  AdminInput,
  DeleteConfirm,
  FilterBar,
} from "@/components/admin";

const emptyProduct = { nameZh: "", nameEn: "", descriptionZh: "", descriptionEn: "", imageUrl: "", websiteUrl: "", category: "", rating: 4.5, pmScenarioZh: "", pmScenarioEn: "", pmProsZh: "", pmProsEn: "", pmConsZh: "", pmConsEn: "", pmTakeawayZh: "", pmTakeawayEn: "", published: false, featured: false };

const productCategories = [
  { value: "llm", zh: "大语言模型", en: "LLM" },
  { value: "painting", zh: "AI绘画", en: "Painting" },
  { value: "writing", zh: "AI写作", en: "Writing" },
  { value: "coding", zh: "AI编程", en: "Coding" },
  { value: "office", zh: "AI办公", en: "Office" },
  { value: "video", zh: "AI视频", en: "Video" },
];

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

export default function AdminProductsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const load = useCallback(() => { seedDemoData(); setItems(store.list<Product>("products")); }, []);
  useEffect(() => { syncFromApi().then(() => load()); }, [load]);

  const handleSave = (data: typeof emptyProduct) => {
    if (editing) store.update<Product>("products", editing.id, data);
    else store.create<Product>("products", data);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = (id: string) => { store.delete("products", id); setDeleteConfirm(null); load(); };

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    ...productCategories.map((c) => ({
      key: c.value,
      label: isZh ? c.zh : c.en,
      count: items.filter((i) => i.category === c.value).length,
    })),
  ];

  const filtered = items.filter((item) => {
    if (activeTab !== "all" && item.category !== activeTab) return false;
    if (searchValue) {
      const q = searchValue.toLowerCase();
      return item.nameZh.toLowerCase().includes(q) || item.nameEn.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "AI 产品库" : "AI Products"}
        subtitle={isZh ? `共 ${items.length} 个产品` : `${items.length} products total`}
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新建产品" : "New Product"}
          </button>
        }
      />

      <FilterBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={isZh ? "搜索产品..." : "Search products..."}
      />

      {filtered.length === 0 ? (
        <EmptyState message={isZh ? "暂无产品" : "No products yet"} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
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
                  <StatusBadge
                    status={item.published ? "published" : "draft"}
                    label={item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                  />
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                    </button>
                    {deleteConfirm === item.id ? (
                      <DeleteConfirm
                        onConfirm={() => handleDelete(item.id)}
                        onCancel={() => setDeleteConfirm(null)}
                        confirmLabel={isZh ? "确认" : "Yes"}
                        cancelLabel={isZh ? "取消" : "No"}
                      />
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

      <AdminModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? (isZh ? "编辑产品" : "Edit Product") : (isZh ? "新建产品" : "New Product")}
        width="xl"
      >
        <ProductForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function ProductForm({ editing, isZh, onSave, onCancel }: { editing: Product | null; isZh: boolean; onSave: (d: typeof emptyProduct) => void; onCancel: () => void }) {
  const [form, setForm] = useState(editing ? { nameZh: editing.nameZh, nameEn: editing.nameEn, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn, imageUrl: editing.imageUrl, websiteUrl: editing.websiteUrl, category: editing.category, rating: editing.rating, pmScenarioZh: editing.pmScenarioZh ?? "", pmScenarioEn: editing.pmScenarioEn ?? "", pmProsZh: editing.pmProsZh ?? "", pmProsEn: editing.pmProsEn ?? "", pmConsZh: editing.pmConsZh ?? "", pmConsEn: editing.pmConsEn ?? "", pmTakeawayZh: editing.pmTakeawayZh ?? "", pmTakeawayEn: editing.pmTakeawayEn ?? "", published: editing.published, featured: editing.featured } : { ...emptyProduct });
  const update = (f: string, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="space-y-4">
      <BilingualField
        label={isZh ? "名称" : "Name"}
        valueZh={form.nameZh}
        valueEn={form.nameEn}
        onChangeZh={(v) => update("nameZh", v)}
        onChangeEn={(v) => update("nameEn", v)}
      />

      <BilingualField
        label={isZh ? "描述" : "Description"}
        valueZh={form.descriptionZh}
        valueEn={form.descriptionEn}
        onChangeZh={(v) => update("descriptionZh", v)}
        onChangeEn={(v) => update("descriptionEn", v)}
        type="textarea"
        rows={2}
      />

      <AdminInput
        label={isZh ? "图片 URL" : "Image URL"}
        value={form.imageUrl}
        onChange={(v) => update("imageUrl", v)}
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-slate-400">{isZh ? "分类" : "Category"}</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
            <option value="">{isZh ? "请选择分类" : "Select category"}</option>
            {productCategories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
          </select>
        </div>
        <AdminInput
          label={isZh ? "网站链接" : "Website URL"}
          value={form.websiteUrl}
          onChange={(v) => update("websiteUrl", v)}
        />
      </div>

      <AdminInput
        label={isZh ? "评分" : "Rating"}
        type="number"
        value={String(form.rating)}
        onChange={(v) => update("rating", parseFloat(v))}
      />

      <div className="border-t border-slate-800 pt-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{isZh ? "PM 视角分析" : "PM Perspective"}</p>
        <div className="space-y-3">
          <BilingualField
            label={isZh ? "适用场景" : "Use case"}
            valueZh={form.pmScenarioZh}
            valueEn={form.pmScenarioEn}
            onChangeZh={(v) => update("pmScenarioZh", v)}
            onChangeEn={(v) => update("pmScenarioEn", v)}
            type="textarea"
            rows={2}
          />

          <BilingualField
            label={isZh ? "优点" : "Pros"}
            valueZh={form.pmProsZh}
            valueEn={form.pmProsEn}
            onChangeZh={(v) => update("pmProsZh", v)}
            onChangeEn={(v) => update("pmProsEn", v)}
            type="textarea"
            rows={2}
          />

          <BilingualField
            label={isZh ? "局限" : "Limits"}
            valueZh={form.pmConsZh}
            valueEn={form.pmConsEn}
            onChangeZh={(v) => update("pmConsZh", v)}
            onChangeEn={(v) => update("pmConsEn", v)}
            type="textarea"
            rows={2}
          />

          <BilingualField
            label={isZh ? "设计借鉴点" : "Design takeaway"}
            valueZh={form.pmTakeawayZh}
            valueEn={form.pmTakeawayEn}
            onChangeZh={(v) => update("pmTakeawayZh", v)}
            onChangeEn={(v) => update("pmTakeawayEn", v)}
            type="textarea"
            rows={2}
          />
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />
          {isZh ? "发布" : "Published"}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />
          {isZh ? "推荐" : "Featured"}
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
