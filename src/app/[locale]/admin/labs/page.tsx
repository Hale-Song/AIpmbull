"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type LabTemplate } from "@/lib/admin/store";
import { syncAllToApi, syncFromApi } from "@/lib/api/client";
import {
  PageHeader, AdminModal, StatusBadge, EmptyState, BilingualField,
  AdminInput, DeleteConfirm, FilterBar,
} from "@/components/admin";

type Form = Omit<LabTemplate, "id" | "createdAt" | "updatedAt">;

const empty: Form = {
  nameZh: "", nameEn: "", descriptionZh: "", descriptionEn: "",
  template: "", variables: "", category: "prompt", published: false,
};

const categories = [
  { value: "prompt", zh: "Prompt 工具", en: "Prompt" },
  { value: "rag", zh: "RAG", en: "RAG" },
  { value: "prd", zh: "需求/PRD", en: "PRD" },
  { value: "eval", zh: "模型评测", en: "Eval" },
];

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

export default function AdminLabsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<LabTemplate[]>([]);
  const [editing, setEditing] = useState<LabTemplate | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => { seedDemoData(); setItems(store.list<LabTemplate>("labs")); }, []);
  useEffect(() => { syncFromApi().then(() => load()); }, [load]);

  const handleSave = (data: Form) => {
    if (editing) store.update<LabTemplate>("labs", editing.id, data);
    else store.create<LabTemplate>("labs", data);
    setShowForm(false); setEditing(null); load();
  };
  const handleDelete = (id: string) => { store.delete("labs", id); setDeleteConfirm(null); load(); };
  const togglePublish = (id: string, p: boolean) => { store.update<LabTemplate>("labs", id, { published: !p }); load(); };

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    ...categories.map((c) => ({
      key: c.value,
      label: isZh ? c.zh : c.en,
      count: items.filter((i) => i.category === c.value).length,
    })),
  ];

  const filtered = items
    .filter((i) => activeTab === "all" || i.category === activeTab)
    .filter((i) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return i.nameZh.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q)
        || i.descriptionZh.toLowerCase().includes(q) || i.descriptionEn.toLowerCase().includes(q);
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "Prompt 模板库" : "Prompt Templates"}
        subtitle={isZh ? `共 ${items.length} 个模板，供前台「在线 Demo」调试器调用` : `${items.length} templates powering the Labs prompt debugger`}
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新建模板" : "New Template"}
          </button>
        }
      />

      <FilterBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isZh ? "搜索模板..." : "Search templates..."}
      />

      {filtered.length === 0 ? (
        <EmptyState message={isZh ? "暂无模板" : "No templates yet"} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white">{isZh ? item.nameZh : item.nameEn}</h3>
                <StatusBadge status={item.category} label={categories.find(c => c.value === item.category)?.[isZh ? "zh" : "en"] || item.category} />
              </div>
              <p className="mt-1 line-clamp-2 text-xs text-slate-400">{isZh ? item.descriptionZh : item.descriptionEn}</p>
              <p className="mt-2 text-[11px] text-slate-500">{isZh ? "变量" : "Vars"}: {item.variables || "—"}</p>
              <div className="mt-3 flex items-center justify-between">
                <StatusBadge
                  status={item.published ? "published" : "draft"}
                  label={item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                  onClick={() => togglePublish(item.id, item.published)}
                />
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(item); setShowForm(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white">
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
                    <button onClick={() => setDeleteConfirm(item.id)} className="rounded-lg p-1.5 text-slate-400 hover:text-red-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? (isZh ? "编辑模板" : "Edit Template") : (isZh ? "新建模板" : "New Template")}
        width="xl"
      >
        <LabForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function LabForm({ editing, isZh, onSave, onCancel }: { editing: LabTemplate | null; isZh: boolean; onSave: (d: Form) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(editing ? {
    nameZh: editing.nameZh, nameEn: editing.nameEn, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn,
    template: editing.template, variables: editing.variables, category: editing.category, published: editing.published,
  } : { ...empty });
  const update = (f: keyof Form, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

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
      <div>
        <label className="mb-1 block text-xs text-slate-400">{isZh ? "Prompt 模板（用 {{变量名}} 占位）" : "Prompt template (use {{var}} placeholders)"}</label>
        <textarea value={form.template} onChange={(e) => update("template", e.target.value)} rows={8} className={`${inputCls} resize-none`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label={isZh ? "变量（逗号分隔）" : "Variables (comma-separated)"}
          value={form.variables}
          onChange={(v) => update("variables", v)}
          placeholder="context, question"
        />
        <div>
          <label className="mb-1 block text-xs text-slate-400">{isZh ? "分类" : "Category"}</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
            {categories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />{isZh ? "发布" : "Published"}</label>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
