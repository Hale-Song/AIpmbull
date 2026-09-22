"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type PortfolioProject } from "@/lib/admin/store";
import { syncAllToApi } from "@/lib/api/client";

type PortfolioForm = Omit<PortfolioProject, "id" | "createdAt" | "updatedAt">;

const emptyPortfolio: PortfolioForm = {
  titleZh: "", titleEn: "", summaryZh: "", summaryEn: "", roleZh: "", roleEn: "",
  coverImage: "", tags: [], category: "", detailZh: "", detailEn: "",
  backgroundZh: "", backgroundEn: "", painZh: "", painEn: "", selectionZh: "", selectionEn: "",
  flowZh: "", flowEn: "", metricsZh: "", metricsEn: "", badcaseZh: "", badcaseEn: "", retroZh: "", retroEn: "",
  published: false, featured: false,
};

const portfolioCategories = [
  { value: "rag", zh: "RAG 知识库", en: "RAG" },
  { value: "agent", zh: "Agent 助手", en: "Agent" },
  { value: "content", zh: "内容生成", en: "Content" },
  { value: "analysis", zh: "数据分析", en: "Analysis" },
  { value: "other", zh: "其他", en: "Other" },
];

// Unified case template: 背景 → 痛点 → 选型 → 流程&原型 → 评估指标 → Badcase → 复盘
const templateFields: Array<{ key: string; zh: string; en: string; hint: string }> = [
  { key: "background", zh: "项目背景", en: "Background", hint: "" },
  { key: "pain", zh: "核心痛点", en: "Pain Points", hint: "每行一条，可加序号" },
  { key: "selection", zh: "方案选型与权衡", en: "Tech Selection", hint: "" },
  { key: "flow", zh: "流程 & 原型", en: "Flow & Prototype", hint: "" },
  { key: "metrics", zh: "评估指标", en: "Metrics", hint: "每行「指标：数值」" },
  { key: "badcase", zh: "Badcase 与改进", en: "Badcases", hint: "" },
  { key: "retro", zh: "复盘沉淀", en: "Retrospective", hint: "" },
];

export default function AdminPortfolioPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<PortfolioProject[]>([]);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(() => { seedDemoData(); setItems(store.list<PortfolioProject>("portfolio")); }, []);
  useEffect(() => { load(); syncAllToApi(); }, [load]);

  const handleSave = (data: PortfolioForm) => {
    if (editing) store.update<PortfolioProject>("portfolio", editing.id, data);
    else store.create<PortfolioProject>("portfolio", data);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = (id: string) => { store.delete("portfolio", id); setDeleteConfirm(null); load(); };

  const handleTogglePublish = (id: string, published: boolean) => {
    store.update<PortfolioProject>("portfolio", id, { published: !published });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{isZh ? `共 ${items.length} 个作品` : `${items.length} projects total`}</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {isZh ? "新建作品" : "New Project"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
          <p className="mt-3 text-sm text-slate-500">{isZh ? "暂无作品" : "No projects yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.id} className="group rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-colors">
              {item.coverImage && <img src={item.coverImage} alt={isZh ? item.titleZh : item.titleEn} className="h-40 w-full object-cover" />}
              <div className="p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">{isZh ? item.titleZh : item.titleEn}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{isZh ? item.summaryZh : item.summaryEn}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleTogglePublish(item.id, item.published)} className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${item.published ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"}`}>
                      {item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                    </button>
                    {item.featured && <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{isZh ? "精选" : "Featured"}</span>}
                    {item.category && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{portfolioCategories.find(c => c.value === item.category)?.[isZh ? "zh" : "en"] || item.category}</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                    </button>
                    {deleteConfirm === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(item.id)} className="rounded bg-red-600 px-2 py-0.5 text-xs text-white">{isZh ? "确认" : "Yes"}</button>
                        <button onClick={() => setDeleteConfirm(null)} className="rounded bg-slate-700 px-2 py-0.5 text-xs text-white">{isZh ? "取消" : "No"}</button>
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
          <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-6">{editing ? (isZh ? "编辑作品" : "Edit Project") : (isZh ? "新建作品" : "New Project")}</h2>
            <PortfolioForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function PortfolioForm({ editing, isZh, onSave, onCancel }: { editing: PortfolioProject | null; isZh: boolean; onSave: (d: PortfolioForm) => void; onCancel: () => void }) {
  const [form, setForm] = useState<PortfolioForm>(editing ? {
    titleZh: editing.titleZh, titleEn: editing.titleEn, summaryZh: editing.summaryZh, summaryEn: editing.summaryEn,
    roleZh: editing.roleZh, roleEn: editing.roleEn, coverImage: editing.coverImage, tags: editing.tags, category: editing.category,
    detailZh: editing.detailZh, detailEn: editing.detailEn,
    backgroundZh: editing.backgroundZh || "", backgroundEn: editing.backgroundEn || "",
    painZh: editing.painZh || "", painEn: editing.painEn || "",
    selectionZh: editing.selectionZh || "", selectionEn: editing.selectionEn || "",
    flowZh: editing.flowZh || "", flowEn: editing.flowEn || "",
    metricsZh: editing.metricsZh || "", metricsEn: editing.metricsEn || "",
    badcaseZh: editing.badcaseZh || "", badcaseEn: editing.badcaseEn || "",
    retroZh: editing.retroZh || "", retroEn: editing.retroEn || "",
    published: editing.published, featured: editing.featured,
  } : { ...emptyPortfolio });

  const update = (f: keyof PortfolioForm, v: unknown) => setForm((p) => ({ ...p, [f]: v }));
  const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none";
  const areaCls = inputCls + " resize-none";
  const labelCls = "mb-1 block text-xs text-slate-400";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>{isZh ? "中文标题" : "Title (Chinese)"}</label><input type="text" value={form.titleZh} onChange={(e) => update("titleZh", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>{isZh ? "英文标题" : "Title (English)"}</label><input type="text" value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} className={inputCls} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>{isZh ? "担任角色（中）" : "Role (ZH)"}</label><input type="text" value={form.roleZh} onChange={(e) => update("roleZh", e.target.value)} className={inputCls} /></div>
        <div><label className={labelCls}>{isZh ? "担任角色（英）" : "Role (EN)"}</label><input type="text" value={form.roleEn} onChange={(e) => update("roleEn", e.target.value)} className={inputCls} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>{isZh ? "摘要（中）" : "Summary (ZH)"}</label><textarea value={form.summaryZh} onChange={(e) => update("summaryZh", e.target.value)} rows={2} className={areaCls} /></div>
        <div><label className={labelCls}>{isZh ? "摘要（英）" : "Summary (EN)"}</label><textarea value={form.summaryEn} onChange={(e) => update("summaryEn", e.target.value)} rows={2} className={areaCls} /></div>
      </div>
      <div><label className={labelCls}>{isZh ? "封面图 URL" : "Cover Image URL"}</label><input type="text" value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} className={inputCls} placeholder="https://..." /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>{isZh ? "标签（逗号分隔）" : "Tags (comma-separated)"}</label><input type="text" value={form.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} className={inputCls} placeholder="RAG, 知识库" /></div>
        <div>
          <label className={labelCls}>{isZh ? "分类" : "Category"}</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
            <option value="">{isZh ? "选择分类" : "Select category"}</option>
            {portfolioCategories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>{isZh ? "项目概述（中）" : "Overview (ZH)"}</label><textarea value={form.detailZh} onChange={(e) => update("detailZh", e.target.value)} rows={3} className={areaCls} /></div>
        <div><label className={labelCls}>{isZh ? "项目概述（英）" : "Overview (EN)"}</label><textarea value={form.detailEn} onChange={(e) => update("detailEn", e.target.value)} rows={3} className={areaCls} /></div>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
        <p className="mb-1 text-xs font-medium text-slate-300">{isZh ? "案例统一模板" : "Unified Case Template"}</p>
        <p className="mb-3 text-[11px] text-slate-500">{isZh ? "背景 → 痛点 → 选型 → 流程&原型 → 评估指标 → Badcase → 复盘" : "Background → Pain → Selection → Flow → Metrics → Badcase → Retro"}</p>
        <div className="space-y-3">
          {templateFields.map((f) => {
            const zhKey = `${f.key}Zh` as keyof PortfolioForm;
            const enKey = `${f.key}En` as keyof PortfolioForm;
            return (
              <div key={f.key} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] text-slate-400">{f.zh}{f.hint ? ` · ${f.hint}` : ""}</label>
                  <textarea value={(form[zhKey] as string) || ""} onChange={(e) => update(zhKey, e.target.value)} rows={3} className={areaCls} />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] text-slate-400">{f.en}</label>
                  <textarea value={(form[enKey] as string) || ""} onChange={(e) => update(enKey, e.target.value)} rows={3} className={areaCls} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />{isZh ? "发布" : "Published"}</label>
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />{isZh ? "精选" : "Featured"}</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
