"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type PortfolioProject } from "@/lib/admin/store";
import { syncAllToApi } from "@/lib/api/client";
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

const templateFields: Array<{ key: string; zh: string; en: string; hint: string }> = [
  { key: "background", zh: "项目背景", en: "Background", hint: "" },
  { key: "pain", zh: "核心痛点", en: "Pain Points", hint: "每行一条，可加序号" },
  { key: "selection", zh: "方案选型与权衡", en: "Tech Selection", hint: "" },
  { key: "flow", zh: "流程 & 原型", en: "Flow & Prototype", hint: "" },
  { key: "metrics", zh: "评估指标", en: "Metrics", hint: "每行「指标：数值」" },
  { key: "badcase", zh: "Badcase 与改进", en: "Badcases", hint: "" },
  { key: "retro", zh: "复盘沉淀", en: "Retrospective", hint: "" },
];

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

export default function AdminPortfolioPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<PortfolioProject[]>([]);
  const [editing, setEditing] = useState<PortfolioProject | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");

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

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    ...portfolioCategories.map((c) => ({
      key: c.value,
      label: isZh ? c.zh : c.en,
      count: items.filter((i) => i.category === c.value).length,
    })),
  ];

  const filtered = items.filter((item) => {
    if (activeTab !== "all" && item.category !== activeTab) return false;
    if (searchValue) {
      const q = searchValue.toLowerCase();
      return item.titleZh.toLowerCase().includes(q) || item.titleEn.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "作品集" : "Portfolio"}
        subtitle={isZh ? `共 ${items.length} 个作品` : `${items.length} projects total`}
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新建作品" : "New Project"}
          </button>
        }
      />

      <FilterBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={isZh ? "搜索作品..." : "Search projects..."}
      />

      {filtered.length === 0 ? (
        <EmptyState message={isZh ? "暂无作品" : "No projects yet"} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="group rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-colors">
              {item.coverImage && <img src={item.coverImage} alt={isZh ? item.titleZh : item.titleEn} className="h-40 w-full object-cover" />}
              <div className="p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold text-white">{isZh ? item.titleZh : item.titleEn}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{isZh ? item.summaryZh : item.summaryEn}</p>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={item.published ? "published" : "draft"}
                      label={item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                      onClick={() => handleTogglePublish(item.id, item.published)}
                    />
                    {item.featured && <StatusBadge status="featured" label={isZh ? "精选" : "Featured"} />}
                    {item.category && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{portfolioCategories.find(c => c.value === item.category)?.[isZh ? "zh" : "en"] || item.category}</span>}
                  </div>
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
        title={editing ? (isZh ? "编辑作品" : "Edit Project") : (isZh ? "新建作品" : "New Project")}
        width="xl"
      >
        <PortfolioFormComponent editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function PortfolioFormComponent({ editing, isZh, onSave, onCancel }: { editing: PortfolioProject | null; isZh: boolean; onSave: (d: PortfolioForm) => void; onCancel: () => void }) {
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

  return (
    <div className="space-y-4">
      <BilingualField
        label={isZh ? "标题" : "Title"}
        valueZh={form.titleZh}
        valueEn={form.titleEn}
        onChangeZh={(v) => update("titleZh", v)}
        onChangeEn={(v) => update("titleEn", v)}
      />

      <BilingualField
        label={isZh ? "担任角色" : "Role"}
        valueZh={form.roleZh}
        valueEn={form.roleEn}
        onChangeZh={(v) => update("roleZh", v)}
        onChangeEn={(v) => update("roleEn", v)}
      />

      <BilingualField
        label={isZh ? "摘要" : "Summary"}
        valueZh={form.summaryZh}
        valueEn={form.summaryEn}
        onChangeZh={(v) => update("summaryZh", v)}
        onChangeEn={(v) => update("summaryEn", v)}
        type="textarea"
        rows={2}
      />

      <AdminInput
        label={isZh ? "封面图 URL" : "Cover Image URL"}
        value={form.coverImage}
        onChange={(v) => update("coverImage", v)}
        placeholder="https://..."
      />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label={isZh ? "标签（逗号分隔）" : "Tags (comma-separated)"}
          value={form.tags.join(", ")}
          onChange={(v) => update("tags", v.split(",").map(s => s.trim()).filter(Boolean))}
          placeholder="RAG, 知识库"
        />
        <div>
          <label className="mb-1 block text-xs text-slate-400">{isZh ? "分类" : "Category"}</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
            <option value="">{isZh ? "选择分类" : "Select category"}</option>
            {portfolioCategories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
          </select>
        </div>
      </div>

      <BilingualField
        label={isZh ? "项目概述" : "Overview"}
        valueZh={form.detailZh}
        valueEn={form.detailEn}
        onChangeZh={(v) => update("detailZh", v)}
        onChangeEn={(v) => update("detailEn", v)}
        type="textarea"
        rows={3}
      />

      <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
        <p className="mb-1 text-xs font-medium text-slate-300">{isZh ? "案例统一模板" : "Unified Case Template"}</p>
        <p className="mb-3 text-[11px] text-slate-500">{isZh ? "背景 → 痛点 → 选型 → 流程&原型 → 评估指标 → Badcase → 复盘" : "Background → Pain → Selection → Flow → Metrics → Badcase → Retro"}</p>
        <div className="space-y-3">
          {templateFields.map((f) => {
            const zhKey = `${f.key}Zh` as keyof PortfolioForm;
            const enKey = `${f.key}En` as keyof PortfolioForm;
            return (
              <BilingualField
                key={f.key}
                label={isZh ? f.zh : f.en}
                valueZh={(form[zhKey] as string) || ""}
                valueEn={(form[enKey] as string) || ""}
                onChangeZh={(v) => update(zhKey, v)}
                onChangeEn={(v) => update(enKey, v)}
                type="textarea"
                rows={3}
              />
            );
          })}
        </div>
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />
          {isZh ? "发布" : "Published"}
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />
          {isZh ? "精选" : "Featured"}
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
