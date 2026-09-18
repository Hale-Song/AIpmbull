"use client";

import { useEffect, useState, useCallback } from "react";
import { store, type ImageItem } from "@/lib/admin/store";

const emptyImage = { titleZh: "", titleEn: "", url: "", descriptionZh: "", descriptionEn: "", published: false };

export default function AdminImagesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<ImageItem[]>([]);
  const [editing, setEditing] = useState<ImageItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(() => { setItems(store.list<ImageItem>("images")); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSave = (data: typeof emptyImage) => {
    if (editing) store.update<ImageItem>("images", editing.id, data);
    else store.create<ImageItem>("images", data);
    setShowForm(false); setEditing(null); load();
  };

  const handleDelete = (id: string) => { store.delete("images", id); setDeleteConfirm(null); load(); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{isZh ? `共 ${items.length} 张图片` : `${items.length} images total`}</p>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {isZh ? "上传图片" : "Upload Image"}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
          <p className="mt-3 text-sm text-slate-500">{isZh ? "暂无图片" : "No images yet"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="group relative rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-colors">
              {item.url ? (
                <img src={item.url} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-slate-800">
                  <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
                </div>
              )}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-full p-3">
                  <p className="truncate text-xs font-medium text-white">{isZh ? item.titleZh : item.titleEn}</p>
                  <div className="mt-2 flex gap-1">
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                    </button>
                    {deleteConfirm === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleDelete(item.id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">{isZh ? "确认" : "Yes"}</button>
                        <button onClick={() => setDeleteConfirm(null)} className="rounded bg-slate-700 px-2 py-1 text-xs text-white">{isZh ? "取消" : "No"}</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(item.id)} className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm hover:bg-red-600/80 transition-colors">
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
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
            <h2 className="text-lg font-semibold text-white mb-6">{editing ? (isZh ? "编辑图片" : "Edit Image") : (isZh ? "上传图片" : "Upload Image")}</h2>
            <ImageForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function ImageForm({ editing, isZh, onSave, onCancel }: { editing: ImageItem | null; isZh: boolean; onSave: (d: typeof emptyImage) => void; onCancel: () => void }) {
  const [form, setForm] = useState(editing ? { titleZh: editing.titleZh, titleEn: editing.titleEn, url: editing.url, descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn, published: editing.published } : { ...emptyImage });
  const update = (f: string, v: unknown) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "中文标题" : "Title (Chinese)"}</label><input type="text" value={form.titleZh} onChange={(e) => update("titleZh", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "英文标题" : "Title (English)"}</label><input type="text" value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
      </div>
      <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "图片 URL" : "Image URL"}</label><input type="text" value={form.url} onChange={(e) => update("url", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="https://..." /></div>
      {form.url && <img src={form.url} alt="Preview" className="max-h-48 rounded-lg object-contain" />}
      <div className="grid grid-cols-2 gap-4">
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "中文描述" : "Description (Chinese)"}</label><textarea value={form.descriptionZh} onChange={(e) => update("descriptionZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
        <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "英文描述" : "Description (English)"}</label><textarea value={form.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
