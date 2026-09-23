"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Note } from "@/lib/admin/store";
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

type Form = Omit<Note, "id" | "createdAt" | "updatedAt">;

const empty: Form = {
  type: "book", titleZh: "", titleEn: "", sourceZh: "", sourceEn: "", coverImage: "",
  rating: 0, tags: [], summaryZh: "", summaryEn: "", contentZh: "", contentEn: "",
  takeawayZh: "", takeawayEn: "", published: false, featured: false,
};

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

export default function AdminNotesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<Note[]>([]);
  const [editing, setEditing] = useState<Note | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchValue, setSearchValue] = useState("");

  const load = useCallback(() => { seedDemoData(); setItems(store.list<Note>("notes")); }, []);
  useEffect(() => { syncFromApi().then(() => load()); }, [load]);

  const handleSave = (data: Form) => {
    if (editing) store.update<Note>("notes", editing.id, data);
    else store.create<Note>("notes", data);
    setShowForm(false); setEditing(null); load();
    syncAllToApi();
  };
  const handleDelete = (id: string) => { store.delete("notes", id); setDeleteConfirm(null); load(); syncAllToApi(); };
  const togglePublish = (id: string, p: boolean) => { store.update<Note>("notes", id, { published: !p }); load(); syncAllToApi(); };

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    { key: "book", label: isZh ? "读书笔记" : "Book", count: items.filter((i) => i.type === "book").length },
    { key: "log", label: isZh ? "学习日志" : "Log", count: items.filter((i) => i.type === "log").length },
  ];

  const filtered = items.filter((item) => {
    if (activeTab !== "all" && item.type !== activeTab) return false;
    if (searchValue) {
      const q = searchValue.toLowerCase();
      return item.titleZh.toLowerCase().includes(q) || item.titleEn.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "读书笔记 & 学习日志" : "Notes & Learning Log"}
        subtitle={isZh ? `共 ${items.length} 条` : `${items.length} entries`}
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新建笔记" : "New Note"}
          </button>
        }
      />

      <FilterBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder={isZh ? "搜索笔记..." : "Search notes..."}
      />

      {filtered.length === 0 ? (
        <EmptyState message={isZh ? "暂无笔记" : "No notes yet"} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors">
              {item.coverImage && <img src={item.coverImage} alt={isZh ? item.titleZh : item.titleEn} className="h-32 w-full object-cover" />}
              <div className="p-4">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${item.type === "book" ? "bg-purple-500/10 text-purple-400" : "bg-teal-500/10 text-teal-400"}`}>{item.type === "book" ? (isZh ? "读书" : "Book") : (isZh ? "日志" : "Log")}</span>
                  {item.rating > 0 && <span className="text-[10px] text-amber-400">{"★".repeat(Math.round(item.rating))}</span>}
                </div>
                <h3 className="mt-2 truncate text-sm font-semibold text-white">{isZh ? item.titleZh : item.titleEn}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{isZh ? item.summaryZh : item.summaryEn}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={item.published ? "published" : "draft"}
                      label={item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                      onClick={() => togglePublish(item.id, item.published)}
                    />
                    {item.featured && <StatusBadge status="featured" label={isZh ? "精选" : "Featured"} />}
                  </div>
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
            </div>
          ))}
        </div>
      )}

      <AdminModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? (isZh ? "编辑笔记" : "Edit Note") : (isZh ? "新建笔记" : "New Note")}
        width="xl"
      >
        <NoteForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function NoteForm({ editing, isZh, onSave, onCancel }: { editing: Note | null; isZh: boolean; onSave: (d: Form) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(editing ? {
    type: editing.type, titleZh: editing.titleZh, titleEn: editing.titleEn, sourceZh: editing.sourceZh, sourceEn: editing.sourceEn,
    coverImage: editing.coverImage, rating: editing.rating, tags: editing.tags, summaryZh: editing.summaryZh, summaryEn: editing.summaryEn,
    contentZh: editing.contentZh, contentEn: editing.contentEn, takeawayZh: editing.takeawayZh, takeawayEn: editing.takeawayEn,
    published: editing.published, featured: editing.featured,
  } : { ...empty });
  const update = (f: keyof Form, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-xs text-slate-400">{isZh ? "类型" : "Type"}</label>
          <select value={form.type} onChange={(e) => update("type", e.target.value)} className={inputCls}>
            <option value="book">{isZh ? "读书笔记" : "Book note"}</option>
            <option value="log">{isZh ? "学习日志" : "Learning log"}</option>
          </select>
        </div>
        <AdminInput
          label={isZh ? "评分（0-5，0 不显示）" : "Rating (0-5, 0 hides)"}
          type="number"
          value={String(form.rating)}
          onChange={(v) => update("rating", Number(v))}
        />
      </div>

      <BilingualField
        label={isZh ? "标题" : "Title"}
        valueZh={form.titleZh}
        valueEn={form.titleEn}
        onChangeZh={(v) => update("titleZh", v)}
        onChangeEn={(v) => update("titleEn", v)}
      />

      <BilingualField
        label={isZh ? "来源/书名" : "Source"}
        valueZh={form.sourceZh}
        valueEn={form.sourceEn}
        onChangeZh={(v) => update("sourceZh", v)}
        onChangeEn={(v) => update("sourceEn", v)}
      />

      <AdminInput
        label={isZh ? "封面图 URL" : "Cover Image URL"}
        value={form.coverImage}
        onChange={(v) => update("coverImage", v)}
        placeholder="https://..."
      />

      <AdminInput
        label={isZh ? "标签（逗号分隔）" : "Tags (comma-separated)"}
        value={form.tags.join(", ")}
        onChange={(v) => update("tags", v.split(",").map(s => s.trim()).filter(Boolean))}
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

      <BilingualField
        label={isZh ? "正文笔记" : "Notes"}
        valueZh={form.contentZh}
        valueEn={form.contentEn}
        onChangeZh={(v) => update("contentZh", v)}
        onChangeEn={(v) => update("contentEn", v)}
        type="textarea"
        rows={6}
      />

      <BilingualField
        label={isZh ? "一句话收获" : "Takeaway"}
        valueZh={form.takeawayZh}
        valueEn={form.takeawayEn}
        onChangeZh={(v) => update("takeawayZh", v)}
        onChangeEn={(v) => update("takeawayEn", v)}
        type="textarea"
        rows={2}
      />

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
