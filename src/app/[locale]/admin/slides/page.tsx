"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Slide } from "@/lib/admin/store";
import { syncAllToApi, syncFromApi } from "@/lib/api/client";
import { PageHeader, AdminModal, StatusBadge, EmptyState, BilingualField, AdminInput, DeleteConfirm, FilterBar } from "@/components/admin";

type Form = Omit<Slide, "id" | "createdAt" | "updatedAt">;

const empty: Form = {
  titleZh: "", titleEn: "", descriptionZh: "", descriptionEn: "", coverImage: "",
  topic: "share", slidesCount: 0, viewUrl: "", downloadUrl: "", tags: [], published: false, featured: false,
};

const topics = [
  { value: "share", zh: "公开分享", en: "Talk" },
  { value: "rag", zh: "RAG", en: "RAG" },
  { value: "eval", zh: "模型评测", en: "Eval" },
  { value: "career", zh: "职业成长", en: "Career" },
  { value: "other", zh: "其他", en: "Other" },
];

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

export default function AdminSlidesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<Slide[]>([]);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const load = useCallback(() => { seedDemoData(); setItems(store.list<Slide>("slides")); }, []);
  useEffect(() => { syncFromApi().then(() => load()); }, [load]);

  const filtered = items.filter((item) => {
    if (activeTab !== "all" && item.topic !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return item.titleZh.toLowerCase().includes(q) || item.titleEn.toLowerCase().includes(q);
  });

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    ...topics.map((t) => ({
      key: t.value,
      label: isZh ? t.zh : t.en,
      count: items.filter((i) => i.topic === t.value).length,
    })),
  ];

  const handleSave = (data: Form) => {
    if (editing) store.update<Slide>("slides", editing.id, data);
    else store.create<Slide>("slides", data);
    setShowForm(false); setEditing(null); load();
    syncAllToApi();
  };
  const handleDelete = (id: string) => { store.delete("slides", id); setDeleteConfirm(null); load(); syncAllToApi(); };
  const togglePublish = (id: string, p: boolean) => { store.update<Slide>("slides", id, { published: !p }); load(); syncAllToApi(); };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "PPT 分享管理" : "Slide Decks"}
        subtitle={isZh ? `共 ${items.length} 份` : `${items.length} decks`}
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新建 PPT" : "New Deck"}
          </button>
        }
      />

      <FilterBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isZh ? "搜索 PPT..." : "Search decks..."}
      />

      {filtered.length === 0 ? (
        <EmptyState
          message={isZh ? "暂无 PPT" : "No decks yet"}
          action={
            <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-sm">
              {isZh ? "新建 PPT" : "New Deck"}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-colors">
              {item.coverImage && <img src={item.coverImage} alt={isZh ? item.titleZh : item.titleEn} className="h-32 w-full object-cover" />}
              <div className="p-4">
                <h3 className="truncate text-sm font-semibold text-white">{isZh ? item.titleZh : item.titleEn}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{isZh ? item.descriptionZh : item.descriptionEn}</p>
                <p className="mt-2 text-[11px] text-slate-500">{item.slidesCount > 0 ? `${item.slidesCount} ${isZh ? "页" : "slides"}` : ""}{item.viewUrl ? " · 🔗" : ""}</p>
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
            </div>
          ))}
        </div>
      )}

      <AdminModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? (isZh ? "编辑 PPT" : "Edit Deck") : (isZh ? "新建 PPT" : "New Deck")}
        width="xl"
      >
        <SlideForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function SlideForm({ editing, isZh, onSave, onCancel }: { editing: Slide | null; isZh: boolean; onSave: (d: Form) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(editing ? {
    titleZh: editing.titleZh, titleEn: editing.titleEn, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn,
    coverImage: editing.coverImage, topic: editing.topic, slidesCount: editing.slidesCount, viewUrl: editing.viewUrl, downloadUrl: editing.downloadUrl,
    tags: editing.tags, published: editing.published, featured: editing.featured,
  } : { ...empty });
  const update = (f: keyof Form, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

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
        label={isZh ? "描述" : "Description"}
        valueZh={form.descriptionZh}
        valueEn={form.descriptionEn}
        onChangeZh={(v) => update("descriptionZh", v)}
        onChangeEn={(v) => update("descriptionEn", v)}
        type="textarea"
        rows={2}
      />
      <AdminInput
        label={isZh ? "封面图 URL" : "Cover Image URL"}
        value={form.coverImage}
        onChange={(v) => update("coverImage", v)}
        placeholder="https://..."
      />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-400">{isZh ? "主题" : "Topic"}</label>
          <select value={form.topic} onChange={(e) => update("topic", e.target.value)} className={inputCls}>
            {topics.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
          </select>
        </div>
        <AdminInput
          label={isZh ? "页数" : "Slides"}
          type="number"
          value={String(form.slidesCount)}
          onChange={(v) => update("slidesCount", Number(v))}
        />
        <AdminInput
          label={isZh ? "标签（逗号分隔）" : "Tags (comma separated)"}
          value={form.tags.join(", ")}
          onChange={(v) => update("tags", v.split(",").map(s => s.trim()).filter(Boolean))}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label={isZh ? "在线预览链接" : "View URL"}
          value={form.viewUrl}
          onChange={(v) => update("viewUrl", v)}
          placeholder="https://..."
        />
        <AdminInput
          label={isZh ? "下载链接" : "Download URL"}
          value={form.downloadUrl}
          onChange={(v) => update("downloadUrl", v)}
          placeholder="https://..."
        />
      </div>
      <div className="flex items-center gap-3">
        <StatusBadge
          status={form.published ? "published" : "draft"}
          label={form.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
          onClick={() => update("published", !form.published)}
        />
        <StatusBadge
          status={form.featured ? "featured" : "draft"}
          label={form.featured ? (isZh ? "精选" : "Featured") : (isZh ? "未推荐" : "Not Featured")}
          onClick={() => update("featured", !form.featured)}
        />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
