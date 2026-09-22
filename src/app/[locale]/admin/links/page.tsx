"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type FriendLink } from "@/lib/admin/store";
import { syncAllToApi, syncFromApi } from "@/lib/api/client";
import {
  PageHeader, AdminModal, StatusBadge, EmptyState, BilingualField,
  AdminInput, DeleteConfirm, FilterBar,
} from "@/components/admin";

type Form = Omit<FriendLink, "id" | "createdAt" | "updatedAt">;

const empty: Form = {
  nameZh: "", nameEn: "", url: "", descriptionZh: "", descriptionEn: "",
  logo: "", category: "blog", order: 0, published: true,
};

const categories = [
  { value: "blog", zh: "博客", en: "Blog" },
  { value: "community", zh: "社区", en: "Community" },
  { value: "tool", zh: "工具", en: "Tool" },
  { value: "friend", zh: "友站", en: "Friend" },
];

const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

export default function AdminLinksPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<FriendLink[]>([]);
  const [editing, setEditing] = useState<FriendLink | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(() => { seedDemoData(); setItems(store.list<FriendLink>("links")); }, []);
  useEffect(() => { syncFromApi().then(() => load()); }, [load]);

  const handleSave = (data: Form) => {
    if (editing) store.update<FriendLink>("links", editing.id, data);
    else store.create<FriendLink>("links", data);
    setShowForm(false); setEditing(null); load();
  };
  const handleDelete = (id: string) => { store.delete("links", id); setDeleteConfirm(null); load(); };
  const togglePublish = (id: string, p: boolean) => { store.update<FriendLink>("links", id, { published: !p }); load(); };

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    ...categories.map((c) => ({
      key: c.value,
      label: isZh ? c.zh : c.en,
      count: items.filter((i) => i.category === c.value).length,
    })),
  ];

  const filtered = [...items]
    .filter((i) => activeTab === "all" || i.category === activeTab)
    .filter((i) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return i.nameZh.toLowerCase().includes(q) || i.nameEn.toLowerCase().includes(q);
    })
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "友链管理" : "Friend Links"}
        subtitle={isZh ? `共 ${items.length} 条，order 越小越靠前` : `${items.length} links · lower order shows first`}
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新增友链" : "New Link"}
          </button>
        }
      />

      <FilterBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isZh ? "搜索友链..." : "Search links..."}
      />

      {filtered.length === 0 ? (
        <EmptyState message={isZh ? "暂无友链" : "No links yet"} />
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-800 text-sm font-bold text-blue-400">
                {item.logo ? <img src={item.logo} alt={item.nameZh} className="h-full w-full object-cover" /> : (item.nameZh || item.nameEn || "?").slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-white">{isZh ? item.nameZh : item.nameEn}</h3>
                  <StatusBadge status={item.category} label={categories.find(c => c.value === item.category)?.[isZh ? "zh" : "en"] || item.category} />
                </div>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-blue-400 hover:underline">{item.url}</a>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge
                  status={item.published ? "published" : "draft"}
                  label={item.published ? (isZh ? "显示" : "Shown") : (isZh ? "隐藏" : "Hidden")}
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
          ))}
        </div>
      )}

      <AdminModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? (isZh ? "编辑友链" : "Edit Link") : (isZh ? "新增友链" : "New Link")}
        width="lg"
      >
        <LinkForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function LinkForm({ editing, isZh, onSave, onCancel }: { editing: FriendLink | null; isZh: boolean; onSave: (d: Form) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Form>(editing ? {
    nameZh: editing.nameZh, nameEn: editing.nameEn, url: editing.url, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn,
    logo: editing.logo, category: editing.category, order: editing.order, published: editing.published,
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
      <AdminInput
        label={isZh ? "链接 URL" : "URL"}
        value={form.url}
        onChange={(v) => update("url", v)}
        placeholder="https://..."
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
        label={isZh ? "Logo URL（可选）" : "Logo URL (optional)"}
        value={form.logo}
        onChange={(v) => update("logo", v)}
        placeholder="https://..."
      />
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="mb-1 block text-xs text-slate-400">{isZh ? "分类" : "Category"}</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputCls}>
            {categories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">{isZh ? "排序" : "Order"}</label>
          <input type="number" value={form.order} onChange={(e) => update("order", Number(e.target.value))} className={inputCls} />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 pb-2 text-sm text-slate-300">
            <input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600" />
            {isZh ? "显示" : "Shown"}
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
