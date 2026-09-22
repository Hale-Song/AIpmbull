"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type QA } from "@/lib/admin/store";
import { syncAllToApi, syncFromApi } from "@/lib/api/client";
import {
  PageHeader, AdminModal, StatusBadge, EmptyState, BilingualField,
  AdminInput, DeleteConfirm, FilterBar,
} from "@/components/admin";

type Form = Omit<QA, "id" | "createdAt" | "updatedAt">;

const empty: Form = {
  questionZh: "", questionEn: "", askerName: "", answerZh: "", answerEn: "",
  status: "answered", tags: [], published: true, featured: false,
};

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

export default function AdminQAPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<QA[]>([]);
  const [editing, setEditing] = useState<QA | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => { seedDemoData(); setItems(store.list<QA>("qa")); }, []);
  useEffect(() => { syncFromApi().then(() => load()); }, [load]);

  const handleSave = (data: Form) => {
    if (editing) store.update<QA>("qa", editing.id, data);
    else store.create<QA>("qa", data);
    setShowForm(false); setEditing(null); load();
  };
  const handleDelete = (id: string) => { store.delete("qa", id); setDeleteConfirm(null); load(); };
  const togglePublish = (id: string, p: boolean) => { store.update<QA>("qa", id, { published: !p }); load(); };

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const answeredCount = items.filter((i) => i.status === "answered").length;

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    { key: "pending", label: isZh ? "待回答" : "Pending", count: pendingCount },
    { key: "answered", label: isZh ? "已回答" : "Answered", count: answeredCount },
  ];

  const filtered = [...items]
    .filter((i) => activeTab === "all" || i.status === activeTab)
    .filter((i) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return i.questionZh.toLowerCase().includes(q) || i.questionEn.toLowerCase().includes(q) || i.askerName.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "问答管理" : "Q&A"}
        subtitle={isZh ? `共 ${items.length} 条${pendingCount > 0 ? `，${pendingCount} 条待回答` : ""}` : `${items.length} questions${pendingCount > 0 ? `, ${pendingCount} pending` : ""}`}
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新增问答" : "New Q&A"}
          </button>
        }
      />

      <FilterBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isZh ? "搜索问题..." : "Search questions..."}
      />

      {filtered.length === 0 ? (
        <EmptyState message={isZh ? "暂无问答" : "No questions yet"} />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      status={item.status}
                      label={item.status === "answered" ? (isZh ? "已回答" : "Answered") : (isZh ? "待回答" : "Pending")}
                    />
                    {item.featured && <StatusBadge status="featured" label={isZh ? "精选" : "Featured"} />}
                    {item.tags.map((tag) => <span key={tag} className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{tag}</span>)}
                  </div>
                  <h3 className="mt-2 text-sm font-semibold text-white">{isZh ? item.questionZh : item.questionEn}</h3>
                  {item.askerName && <p className="mt-0.5 text-xs text-slate-500">{isZh ? "提问者" : "Asker"}: {item.askerName}</p>}
                  {(isZh ? item.answerZh : item.answerEn) && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-400">{isZh ? item.answerZh : item.answerEn}</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge
                    status={item.published ? "published" : "draft"}
                    label={item.published ? (isZh ? "已发布" : "Live") : (isZh ? "草稿" : "Draft")}
                    onClick={() => togglePublish(item.id, item.published)}
                  />
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
        title={editing ? (isZh ? "编辑问答" : "Edit Q&A") : (isZh ? "新增问答" : "New Q&A")}
        width="xl"
      >
        <QAForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function QAForm({ editing, isZh, onSave, onCancel }: { editing: QA | null; isZh: boolean; onSave: (d: Form) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(editing ? {
    questionZh: editing.questionZh, questionEn: editing.questionEn, askerName: editing.askerName,
    answerZh: editing.answerZh, answerEn: editing.answerEn, status: editing.status,
    tags: editing.tags, published: editing.published, featured: editing.featured,
  } : { ...empty });
  const [tagsText, setTagsText] = useState((editing?.tags || []).join(", "));
  const update = (f: keyof Form, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  const submit = () => {
    const tags = tagsText.split(/[,，]/).map((t) => t.trim()).filter(Boolean);
    onSave({ ...form, tags });
  };

  return (
    <div className="space-y-4">
      <BilingualField
        label={isZh ? "问题" : "Question"}
        valueZh={form.questionZh}
        valueEn={form.questionEn}
        onChangeZh={(v) => update("questionZh", v)}
        onChangeEn={(v) => update("questionEn", v)}
        type="textarea"
        rows={2}
        placeholderZh={isZh ? "输入问题..." : "Enter question..."}
        placeholderEn="Enter question..."
      />
      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label={isZh ? "提问者（可选）" : "Asker (optional)"}
          value={form.askerName}
          onChange={(v) => update("askerName", v)}
        />
        <div>
          <label className="mb-1 block text-xs text-slate-400">{isZh ? "状态" : "Status"}</label>
          <select value={form.status} onChange={(e) => update("status", e.target.value)} className={inputCls}>
            <option value="answered">{isZh ? "已回答" : "Answered"}</option>
            <option value="pending">{isZh ? "待回答" : "Pending"}</option>
          </select>
        </div>
      </div>
      <BilingualField
        label={isZh ? "回答" : "Answer"}
        valueZh={form.answerZh}
        valueEn={form.answerEn}
        onChangeZh={(v) => update("answerZh", v)}
        onChangeEn={(v) => update("answerEn", v)}
        type="textarea"
        rows={6}
        placeholderZh={isZh ? "输入回答..." : "Enter answer..."}
        placeholderEn="Enter answer..."
      />
      <AdminInput
        label={isZh ? "标签（逗号分隔）" : "Tags (comma separated)"}
        value={tagsText}
        onChange={setTagsText}
        placeholder="RAG, Agent"
      />
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />{isZh ? "发布" : "Published"}</label>
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />{isZh ? "精选" : "Featured"}</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={submit} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
