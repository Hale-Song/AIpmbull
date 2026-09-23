"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Video } from "@/lib/admin/store";
import { syncAllToApi, syncFromApi } from "@/lib/api/client";
import { PageHeader, AdminModal, StatusBadge, EmptyState, BilingualField, AdminInput, DeleteConfirm, FilterBar } from "@/components/admin";

const emptyVideo = { titleZh: "", titleEn: "", descriptionZh: "", descriptionEn: "", videoUrl: "", thumbnail: "", duration: "", category: "", published: false, featured: false };

const videoCategories = [
  { value: "tutorial", zh: "教程", en: "Tutorial" },
  { value: "review", zh: "评测", en: "Review" },
  { value: "interview", zh: "访谈", en: "Interview" },
  { value: "demo", zh: "演示", en: "Demo" },
  { value: "news", zh: "资讯", en: "News" },
];

export default function AdminVideosPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<Video[]>([]);
  const [editing, setEditing] = useState<Video | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const load = useCallback(() => { seedDemoData(); setItems(store.list<Video>("videos")); }, []);
  useEffect(() => { syncFromApi().then(() => load()); }, [load]);

  const filtered = items.filter((item) => {
    if (activeTab !== "all" && item.category !== activeTab) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return item.titleZh.toLowerCase().includes(q) || item.titleEn.toLowerCase().includes(q);
  });

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    ...videoCategories.map((c) => ({
      key: c.value,
      label: isZh ? c.zh : c.en,
      count: items.filter((i) => i.category === c.value).length,
    })),
  ];

  const handleSave = (data: typeof emptyVideo) => {
    if (editing) store.update<Video>("videos", editing.id, data);
    else store.create<Video>("videos", data);
    setShowForm(false); setEditing(null); load();
    syncAllToApi();
  };

  const handleDelete = (id: string) => { store.delete("videos", id); setDeleteConfirm(null); load(); syncAllToApi(); };

  const handleTogglePublish = (id: string, published: boolean) => {
    store.update<Video>("videos", id, { published: !published });
    load();
    syncAllToApi();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "视频管理" : "Videos"}
        subtitle={isZh ? `共 ${items.length} 个视频` : `${items.length} videos total`}
        actions={
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            {isZh ? "新建视频" : "New Video"}
          </button>
        }
      />

      <FilterBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isZh ? "搜索视频..." : "Search videos..."}
      />

      {filtered.length === 0 ? (
        <EmptyState
          message={isZh ? "暂无视频" : "No videos yet"}
          action={
            <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-sm">
              {isZh ? "新建视频" : "New Video"}
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="group rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-colors">
              <div className="relative">
                {item.thumbnail && <img src={item.thumbnail} alt={isZh ? item.titleZh : item.titleEn} className="h-40 w-full object-cover" />}
                {item.duration && (
                  <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">{item.duration}</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="truncate text-sm font-semibold text-white">{isZh ? item.titleZh : item.titleEn}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-slate-400">{isZh ? item.descriptionZh : item.descriptionEn}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      status={item.published ? "published" : "draft"}
                      label={item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                      onClick={() => handleTogglePublish(item.id, item.published)}
                    />
                    {item.category && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{videoCategories.find(c => c.value === item.category)?.[isZh ? "zh" : "en"] || item.category}</span>}
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
        title={editing ? (isZh ? "编辑视频" : "Edit Video") : (isZh ? "新建视频" : "New Video")}
        width="lg"
      >
        <VideoForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function VideoForm({ editing, isZh, onSave, onCancel }: { editing: Video | null; isZh: boolean; onSave: (d: typeof emptyVideo) => void; onCancel: () => void }) {
  const [form, setForm] = useState(editing ? { titleZh: editing.titleZh, titleEn: editing.titleEn, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn, videoUrl: editing.videoUrl, thumbnail: editing.thumbnail, duration: editing.duration, category: editing.category, published: editing.published, featured: editing.featured } : { ...emptyVideo });
  const update = (f: string, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

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
        label={isZh ? "视频链接" : "Video URL"}
        value={form.videoUrl}
        onChange={(v) => update("videoUrl", v)}
        placeholder="https://..."
      />
      <div className="grid grid-cols-2 gap-4">
        <AdminInput
          label={isZh ? "缩略图 URL" : "Thumbnail URL"}
          value={form.thumbnail}
          onChange={(v) => update("thumbnail", v)}
          placeholder="https://..."
        />
        <AdminInput
          label={isZh ? "时长" : "Duration"}
          value={form.duration}
          onChange={(v) => update("duration", v)}
          placeholder="15:30"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-400">{isZh ? "分类" : "Category"}</label>
        <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
          <option value="">{isZh ? "选择分类" : "Select category"}</option>
          {videoCategories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
        </select>
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
