"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Agent } from "@/lib/admin/store";
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

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

export default function AdminAgentsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<Agent[]>([]);
  const [editing, setEditing] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const load = useCallback(() => { seedDemoData(); setItems(store.list<Agent>("agents")); }, []);
  useEffect(() => { syncFromApi().then(() => load()); }, [load]);

  const handleSave = (data: typeof emptyAgent) => {
    if (editing) store.update<Agent>("agents", editing.id, data);
    else store.create<Agent>("agents", data);
    setShowForm(false); setEditing(null); load();
    syncAllToApi();
  };

  const handleDelete = (id: string) => { store.delete("agents", id); setDeleteConfirm(null); load(); syncAllToApi(); };

  const handleTogglePublish = (id: string, published: boolean) => {
    store.update<Agent>("agents", id, { published: !published });
    load();
    syncAllToApi();
  };

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    ...agentCategories.map((c) => ({
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
        title={isZh ? "AI 智能体" : "AI Agents"}
        subtitle={isZh ? `共 ${items.length} 个智能体` : `${items.length} agents total`}
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新建智能体" : "New Agent"}
          </button>
        }
      />

      <FilterBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={isZh ? "搜索智能体..." : "Search agents..."}
      />

      {filtered.length === 0 ? (
        <EmptyState message={isZh ? "暂无智能体" : "No agents yet"} />
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
                  {item.userCount > 0 && <span className="ml-2 shrink-0 text-xs text-blue-400">{item.userCount.toLocaleString()} {isZh ? "用户" : "users"}</span>}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={item.published ? "published" : "draft"}
                      label={item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                      onClick={() => handleTogglePublish(item.id, item.published)}
                    />
                    {item.category && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{agentCategories.find(c => c.value === item.category)?.[isZh ? "zh" : "en"] || item.category}</span>}
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
        title={editing ? (isZh ? "编辑智能体" : "Edit Agent") : (isZh ? "新建智能体" : "New Agent")}
        width="xl"
      >
        <AgentForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function AgentForm({ editing, isZh, onSave, onCancel }: { editing: Agent | null; isZh: boolean; onSave: (d: typeof emptyAgent) => void; onCancel: () => void }) {
  const [form, setForm] = useState(editing ? { nameZh: editing.nameZh, nameEn: editing.nameEn, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn, imageUrl: editing.imageUrl, agentUrl: editing.agentUrl, apiToken: editing.apiToken, projectId: editing.projectId, category: editing.category, workflow: editing.workflow || "", scenarioZh: editing.scenarioZh || "", scenarioEn: editing.scenarioEn || "", pmTipsZh: editing.pmTipsZh || "", pmTipsEn: editing.pmTipsEn || "", prosZh: editing.prosZh || "", prosEn: editing.prosEn || "", consZh: editing.consZh || "", consEn: editing.consEn || "", boundaryZh: editing.boundaryZh || "", boundaryEn: editing.boundaryEn || "", userCount: editing.userCount, published: editing.published, featured: editing.featured } : { ...emptyAgent });
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
        placeholder="https://..."
      />

      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label={isZh ? "智能体链接" : "Agent URL"}
          value={form.agentUrl}
          onChange={(v) => update("agentUrl", v)}
          placeholder="https://..."
        />
        <div>
          <label className="mb-1 block text-xs text-slate-400">{isZh ? "分类" : "Category"}</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
            <option value="">{isZh ? "选择分类" : "Select category"}</option>
            {agentCategories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-slate-400">{isZh ? "PM 工作流分类" : "PM Workflow Category"}</label>
        <select value={form.workflow} onChange={(e) => update("workflow", e.target.value)} className={inputCls}>
          <option value="">{isZh ? "选择工作流分类" : "Select workflow"}</option>
          {workflowCategories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
        </select>
      </div>

      <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3">
        <p className="mb-2 text-xs font-medium text-slate-300">{isZh ? "工具条目标准化（PM 视角）" : "Standardized Entry (PM Perspective)"}</p>
        <div className="space-y-3">
          <BilingualField
            label={isZh ? "适用场景" : "Scenario"}
            valueZh={form.scenarioZh}
            valueEn={form.scenarioEn}
            onChangeZh={(v) => update("scenarioZh", v)}
            onChangeEn={(v) => update("scenarioEn", v)}
            type="textarea"
            rows={2}
          />

          <BilingualField
            label={isZh ? "PM 使用建议" : "PM Tips"}
            valueZh={form.pmTipsZh}
            valueEn={form.pmTipsEn}
            onChangeZh={(v) => update("pmTipsZh", v)}
            onChangeEn={(v) => update("pmTipsEn", v)}
            type="textarea"
            rows={2}
          />

          <BilingualField
            label={isZh ? "优点" : "Pros"}
            valueZh={form.prosZh}
            valueEn={form.prosEn}
            onChangeZh={(v) => update("prosZh", v)}
            onChangeEn={(v) => update("prosEn", v)}
            type="textarea"
            rows={2}
          />

          <BilingualField
            label={isZh ? "局限" : "Cons"}
            valueZh={form.consZh}
            valueEn={form.consEn}
            onChangeZh={(v) => update("consZh", v)}
            onChangeEn={(v) => update("consEn", v)}
            type="textarea"
            rows={2}
          />

          <BilingualField
            label={isZh ? "能力边界" : "Boundary"}
            valueZh={form.boundaryZh}
            valueEn={form.boundaryEn}
            onChangeZh={(v) => update("boundaryZh", v)}
            onChangeEn={(v) => update("boundaryEn", v)}
            type="textarea"
            rows={2}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label="API Token"
          value={form.apiToken}
          onChange={(v) => update("apiToken", v)}
          placeholder="yJh********"
        />
        <AdminInput
          label="Project ID"
          value={form.projectId}
          onChange={(v) => update("projectId", v)}
          placeholder="7687449723363491880"
        />
      </div>

      <AdminInput
        label={isZh ? "用户数量" : "User Count"}
        type="number"
        value={String(form.userCount)}
        onChange={(v) => update("userCount", parseInt(v) || 0)}
      />

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
