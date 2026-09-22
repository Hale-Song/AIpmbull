"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Agent } from "@/lib/admin/store";
import { syncAllToApi } from "@/lib/api/client";

const emptyAgent = { nameZh: "", nameEn: "", descriptionZh: "", descriptionEn: "", imageUrl: "", agentUrl: "", apiToken: "", projectId: "", category: "", workflow: "", scenarioZh: "", scenarioEn: "", pmTipsZh: "", pmTipsEn: "", prosZh: "", prosEn: "", consZh: "", consEn: "", boundaryZh: "", boundaryEn: "", userCount: 0, published: false, featured: false };

const agentCategories = [
  { value: "product", zh: "产品助手", en: "Product" },
  { value: "document", zh: "文档工具", en: "Document" },
  { value: "design", zh: "设计辅助", en: "Design" },
  { value: "analysis", zh: "数据分析", en: "Analysis" },
  { value: "other", zh: "其他", en: "Other" },
];

const workflowCategories = [
  { value: "prototype", zh: "原型设计", en: "Prototyping" },
  { value: "prompt", zh: "Prompt 工具", en: "Prompt Tools" },
  { value: "rag", zh: "向量库 & RAG", en: "Vector DB & RAG" },
  { value: "eval", zh: "模型评测", en: "Model Evaluation" },
  { value: "doc", zh: "文档 & PRD", en: "Docs & PRD" },
];

export default function AdminAgentsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<Agent[]>([]);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(() => { seedDemoData(); setItems(store.list<Agent>("agents")); }, []);
  useEffect(() => { load(); syncAllToApi(); }, [load]);

  const handleSave = (data: typeof emptyAgent) => {
    if (editing) store.update<Agent>("agents", editing.id, data);
    else store.create<Agent>("agents", data);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = (id: string) => { store.delete("agents", id); setDeleteConfirm(null); load(); };

  const handleTogglePublish = (id: string, published: boolean) => {
    store.update<Agent>("agents", id, { published: !published });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{isZh ? `共 ${items.length} 个智能体` : `${items.length} agents total`}</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {isZh ? "新建智能体" : "New Agent"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
          <p className="mt-3 text-sm text-slate-500">{isZh ? "暂无智能体" : "No agents yet"}</p>
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
                  {item.userCount > 0 && <span className="ml-2 shrink-0 text-xs text-blue-400">{item.userCount.toLocaleString()} {isZh ? "用户" : "users"}</span>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleTogglePublish(item.id, item.published)} className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${item.published ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"}`}>
                      {item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                    </button>
                    {item.category && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{agentCategories.find(c => c.value === item.category)?.[isZh ? "zh" : "en"] || item.category}</span>}
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
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-white mb-6">{editing ? (isZh ? "编辑智能体" : "Edit Agent") : (isZh ? "新建智能体" : "New Agent")}</h2>
            <AgentForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function AgentForm({ editing, isZh, onSave, onCancel }: { editing: Agent | null; isZh: boolean; onSave: (d: typeof emptyAgent) => void; onCancel: () => void }) {
  const [form, setForm] = useState(editing ? { nameZh: editing.nameZh, nameEn: editing.nameEn, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn, imageUrl: editing.imageUrl, agentUrl: editing.agentUrl, apiToken: editing.apiToken, projectId: editing.projectId, category: editing.category, workflow: editing.workflow || "", scenarioZh: editing.scenarioZh || "", scenarioEn: editing.scenarioEn || "", pmTipsZh: editing.pmTipsZh || "", pmTipsEn: editing.pmTipsEn || "", prosZh: editing.prosZh || "", prosEn: editing.prosEn || "", consZh: editing.consZh || "", consEn: editing.consEn || "", boundaryZh: editing.boundaryZh || "", boundaryEn: editing.boundaryEn || "", userCount: editing.userCount, published: editing.published, featured: editing.featured } : { ...emptyAgent });
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
      <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "图片 URL" : "Image URL"}</label><input type="text" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="https://..." /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "智能体链接" : "Agent URL"}</label><input type="text" value={form.agentUrl} onChange={(e) => update("agentUrl", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="https://..." /></div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">{isZh ? "分类" : "Category"}</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
            <option value="">{isZh ? "选择分类" : "Select category"}</option>
            {agentCategories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400">{isZh ? "PM 工作流分类" : "PM Workflow Category"}</label>
        <select value={form.workflow} onChange={(e) => update("workflow", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
          <option value="">{isZh ? "选择工作流分类" : "Select workflow"}</option>
          {workflowCategories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
        </select>
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
        <p className="mb-2 text-xs font-medium text-slate-300">{isZh ? "工具条目标准化（PM 视角）" : "Standardized Entry (PM Perspective)"}</p>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "适用场景（中）" : "Scenario (ZH)"}</label><textarea value={form.scenarioZh} onChange={(e) => update("scenarioZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "适用场景（英）" : "Scenario (EN)"}</label><textarea value={form.scenarioEn} onChange={(e) => update("scenarioEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "PM 使用建议（中）" : "PM Tips (ZH)"}</label><textarea value={form.pmTipsZh} onChange={(e) => update("pmTipsZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "PM 使用建议（英）" : "PM Tips (EN)"}</label><textarea value={form.pmTipsEn} onChange={(e) => update("pmTipsEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "优点（中）" : "Pros (ZH)"}</label><textarea value={form.prosZh} onChange={(e) => update("prosZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "优点（英）" : "Pros (EN)"}</label><textarea value={form.prosEn} onChange={(e) => update("prosEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "局限（中）" : "Cons (ZH)"}</label><textarea value={form.consZh} onChange={(e) => update("consZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "局限（英）" : "Cons (EN)"}</label><textarea value={form.consEn} onChange={(e) => update("consEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "能力边界（中）" : "Boundary (ZH)"}</label><textarea value={form.boundaryZh} onChange={(e) => update("boundaryZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
            <div><label className="mb-1 block text-[11px] text-slate-400">{isZh ? "能力边界（英）" : "Boundary (EN)"}</label><textarea value={form.boundaryEn} onChange={(e) => update("boundaryEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "API Token" : "API Token"}</label><input type="text" value={form.apiToken} onChange={(e) => update("apiToken", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="yJh********" /></div>
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "Project ID" : "Project ID"}</label><input type="text" value={form.projectId} onChange={(e) => update("projectId", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="7687449723363491880" /></div>
      </div>
      <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "用户数量" : "User Count"}</label><input type="number" min={0} value={form.userCount} onChange={(e) => update("userCount", parseInt(e.target.value) || 0)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
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
