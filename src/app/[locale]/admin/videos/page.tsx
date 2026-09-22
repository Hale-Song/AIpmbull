"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Video } from "@/lib/admin/store";
import { syncAllToApi } from "@/lib/api/client";

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

  const load = useCallback(() => { seedDemoData(); setItems(store.list<Video>("videos")); }, []);
  useEffect(() => { load(); syncAllToApi(); }, [load]);

  const handleSave = (data: typeof emptyVideo) => {
    if (editing) store.update<Video>("videos", editing.id, data);
    else store.create<Video>("videos", data);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = (id: string) => { store.delete("videos", id); setDeleteConfirm(null); load(); };

  const handleTogglePublish = (id: string, published: boolean) => {
    store.update<Video>("videos", id, { published: !published });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{isZh ? `共 ${items.length} 个视频` : `${items.length} videos total`}</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {isZh ? "新建视频" : "New Video"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
          <p className="mt-3 text-sm text-slate-500">{isZh ? "暂无视频" : "No videos yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
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
                    <button onClick={() => handleTogglePublish(item.id, item.published)} className={`rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${item.published ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"}`}>
                      {item.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                    </button>
                    {item.category && <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{videoCategories.find(c => c.value === item.category)?.[isZh ? "zh" : "en"] || item.category}</span>}
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
            <h2 className="text-lg font-semibold text-white mb-6">{editing ? (isZh ? "编辑视频" : "Edit Video") : (isZh ? "新建视频" : "New Video")}</h2>
            <VideoForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function VideoForm({ editing, isZh, onSave, onCancel }: { editing: Video | null; isZh: boolean; onSave: (d: typeof emptyVideo) => void; onCancel: () => void }) {
  const [form, setForm] = useState(editing ? { titleZh: editing.titleZh, titleEn: editing.titleEn, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn, videoUrl: editing.videoUrl, thumbnail: editing.thumbnail, duration: editing.duration, category: editing.category, published: editing.published, featured: editing.featured } : { ...emptyVideo });
  const update = (f: string, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "中文标题" : "Title (Chinese)"}</label><input type="text" value={form.titleZh} onChange={(e) => update("titleZh", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "英文标题" : "Title (English)"}</label><input type="text" value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "中文描述" : "Description (Chinese)"}</label><textarea value={form.descriptionZh} onChange={(e) => update("descriptionZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "英文描述" : "Description (English)"}</label><textarea value={form.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
      </div>
      <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "视频链接" : "Video URL"}</label><input type="text" value={form.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="https://..." /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "缩略图 URL" : "Thumbnail URL"}</label><input type="text" value={form.thumbnail} onChange={(e) => update("thumbnail", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="https://..." /></div>
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "时长" : "Duration"}</label><input type="text" value={form.duration} onChange={(e) => update("duration", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="15:30" /></div>
      </div>
      <div>
        <label className="mb-1 block text-xs text-slate-400">{isZh ? "分类" : "Category"}</label>
        <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
          <option value="">{isZh ? "选择分类" : "Select category"}</option>
          {videoCategories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
        </select>
      </div>
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
