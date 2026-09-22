"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { store, type ImageItem, type SiteSettings } from "@/lib/admin/store";
import { syncAllToApi, syncFromApi } from "@/lib/api/client";
import { isGithubConfigured, uploadImageToGithub, deleteImageFromGithub, type UploadResult } from "@/lib/admin/github";
import { PageHeader, AdminModal, EmptyState, BilingualField, AdminInput, DeleteConfirm, FilterBar } from "@/components/admin";

type ViewMode = "grid" | "list";
type SourceFilter = "all" | "manual" | "article" | "upload";

export default function AdminImagesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<ImageItem[]>([]);
  const [editing, setEditing] = useState<ImageItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => { setItems(store.list<ImageItem>("images")); }, []);
  useEffect(() => { syncFromApi().then(() => load()); }, [load]);

  const githubReady = isGithubConfigured();

  const filtered = items.filter((item) => {
    if (sourceFilter !== "all" && item.sourceType !== sourceFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return item.titleZh.toLowerCase().includes(q) || item.titleEn.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    setUploading(true);
    const fileArr = Array.from(files);

    for (let i = 0; i < fileArr.length; i++) {
      const file = fileArr[i];
      setUploadProgress(isZh ? `上传中 ${i + 1}/${fileArr.length}: ${file.name}` : `Uploading ${i + 1}/${fileArr.length}: ${file.name}`);

      let finalUrl = URL.createObjectURL(file);
      let githubFilename = "";
      let githubUrl = "";

      if (githubReady) {
        const result: UploadResult = await uploadImageToGithub(file);
        if (result.success) {
          finalUrl = result.url;
          githubFilename = result.filename;
          githubUrl = result.url;
        }
      }

      const name = file.name.replace(/\.[^.]+$/, "");
      store.create<ImageItem>("images", {
        titleZh: name,
        titleEn: name,
        url: finalUrl,
        descriptionZh: "",
        descriptionEn: "",
        githubFilename,
        githubUrl,
        sourceType: "upload",
        sourceId: "",
        published: true,
      });
      load();
    }

    setUploading(false);
    setUploadProgress("");
    syncAllToApi();
  };

  const handleSyncToGithub = async (item: ImageItem) => {
    if (!githubReady || !item.url) return;
    setUploading(true);
    setUploadProgress(isZh ? `同步到 GitHub: ${item.titleZh}` : `Syncing to GitHub: ${item.titleEn}`);

    const result = await uploadImageToGithub(item.url);
    if (result.success) {
      store.update<ImageItem>("images", item.id, {
        githubFilename: result.filename,
        githubUrl: result.url,
        url: result.url,
      });
      load();
      syncAllToApi();
    } else {
      alert(isZh ? `同步失败: ${result.error}` : `Sync failed: ${result.error}`);
    }

    setUploading(false);
    setUploadProgress("");
  };

  const handleDelete = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (item?.githubFilename && githubReady) {
      await deleteImageFromGithub(item.githubFilename);
    }
    store.delete("images", id);
    setDeleteConfirm(null);
    load();
    syncAllToApi();
  };

  const handleCopyUrl = (item: ImageItem) => {
    const url = item.githubUrl || item.url;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 1500);
    });
  };

  const handleSave = (data: { titleZh: string; titleEn: string; url: string; descriptionZh: string; descriptionEn: string; published: boolean }) => {
    if (editing) {
      store.update<ImageItem>("images", editing.id, { ...editing, ...data });
    } else {
      store.create<ImageItem>("images", {
        ...data,
        githubFilename: "",
        githubUrl: "",
        sourceType: "manual",
        sourceId: "",
      });
    }
    setShowForm(false);
    setEditing(null);
    load();
    syncAllToApi();
  };

  const tabs = [
    { key: "all", label: isZh ? "全部" : "All", count: items.length },
    { key: "upload", label: isZh ? "上传" : "Upload", count: items.filter(i => i.sourceType === "upload").length },
    { key: "article", label: isZh ? "文章" : "Article", count: items.filter(i => i.sourceType === "article").length },
    { key: "manual", label: isZh ? "手动" : "Manual", count: items.filter(i => i.sourceType === "manual").length },
  ];

  const sourceLabel = (type: string) => {
    if (type === "upload") return isZh ? "上传" : "Upload";
    if (type === "article") return isZh ? "文章" : "Article";
    return isZh ? "手动" : "Manual";
  };

  const sourceColor = (type: string) => {
    if (type === "upload") return "bg-blue-500/10 text-blue-400";
    if (type === "article") return "bg-purple-500/10 text-purple-400";
    return "bg-slate-500/10 text-slate-400";
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "素材库" : "Asset Library"}
        subtitle={isZh ? `共 ${items.length} 个素材` : `${items.length} assets total`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-700 bg-slate-800 p-0.5">
              <button onClick={() => setViewMode("grid")} className={`rounded-md px-2 py-1 text-xs transition-colors ${viewMode === "grid" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25A2.25 2.25 0 0 1 8.25 10.5H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25A2.25 2.25 0 0 1 10.5 15.75V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z" /></svg>
              </button>
              <button onClick={() => setViewMode("list")} className={`rounded-md px-2 py-1 text-xs transition-colors ${viewMode === "list" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && handleFileUpload(e.target.files)} />
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
              {uploading ? (isZh ? "上传中..." : "Uploading...") : (isZh ? "上传素材" : "Upload")}
            </button>
            <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:text-white">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
              {isZh ? "链接导入" : "URL Import"}
            </button>
          </div>
        }
      />

      {!githubReady && (
        <div className="rounded-lg border border-amber-800/50 bg-amber-900/20 px-4 py-3 text-sm text-amber-300">
          {isZh ? "GitHub 未配置 — 素材仅保存在本地。请前往「站点设置」配置 GitHub Token 以启用持久化存储。" : "GitHub not configured — assets are stored locally only. Go to Site Settings to configure GitHub Token for persistent storage."}
        </div>
      )}

      {uploading && uploadProgress && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-800/50 bg-blue-900/20 px-4 py-3 text-sm text-blue-300">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          {uploadProgress}
        </div>
      )}

      <FilterBar
        tabs={tabs}
        activeTab={sourceFilter}
        onTabChange={(k) => setSourceFilter(k as SourceFilter)}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={isZh ? "搜索素材..." : "Search assets..."}
      />

      {filtered.length === 0 ? (
        <EmptyState
          message={isZh ? "暂无素材" : "No assets yet"}
          action={
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary text-sm">
              {isZh ? "上传素材" : "Upload Asset"}
            </button>
          }
        />
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((item) => (
            <div key={item.id} className="group relative rounded-xl border border-slate-800 bg-slate-900 overflow-hidden hover:border-slate-700 transition-colors">
              {item.url ? (
                <img src={item.url} alt={isZh ? item.titleZh : item.titleEn} className="aspect-square w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-slate-800">
                  <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${sourceColor(item.sourceType)}`}>{sourceLabel(item.sourceType)}</span>
              </div>
              {item.githubUrl && (
                <div className="absolute top-2 right-2">
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">GitHub</span>
                </div>
              )}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-full p-3">
                  <p className="truncate text-xs font-medium text-white">{isZh ? item.titleZh : item.titleEn}</p>
                  <div className="mt-2 flex gap-1">
                    <button onClick={() => handleCopyUrl(item)} className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm hover:bg-white/30 transition-colors" title={isZh ? "复制链接" : "Copy URL"}>
                      {copiedId === item.id ? (
                        <svg className="h-3.5 w-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
                      )}
                    </button>
                    <button onClick={() => { setEditing(item); setShowForm(true); }} className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm hover:bg-white/30 transition-colors" title={isZh ? "编辑" : "Edit"}>
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                    </button>
                    {!item.githubUrl && githubReady && (
                      <button onClick={() => handleSyncToGithub(item)} className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm hover:bg-white/30 transition-colors" title={isZh ? "同步到 GitHub" : "Sync to GitHub"}>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                      </button>
                    )}
                    {deleteConfirm === item.id ? (
                      <DeleteConfirm
                        onConfirm={() => handleDelete(item.id)}
                        onCancel={() => setDeleteConfirm(null)}
                        confirmLabel={isZh ? "确认" : "Yes"}
                        cancelLabel={isZh ? "取消" : "No"}
                      />
                    ) : (
                      <button onClick={() => setDeleteConfirm(item.id)} className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm hover:bg-red-600/80 transition-colors" title={isZh ? "删除" : "Delete"}>
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-4 py-3">{isZh ? "预览" : "Preview"}</th>
                <th className="px-4 py-3">{isZh ? "标题" : "Title"}</th>
                <th className="px-4 py-3 hidden sm:table-cell">{isZh ? "来源" : "Source"}</th>
                <th className="px-4 py-3 hidden md:table-cell">{isZh ? "存储" : "Storage"}</th>
                <th className="px-4 py-3 hidden lg:table-cell">{isZh ? "日期" : "Date"}</th>
                <th className="px-4 py-3 text-right">{isZh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-2">
                    {item.url ? (
                      <img src={item.url} alt={isZh ? item.titleZh : item.titleEn} className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-800">
                        <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159" /></svg>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <p className="truncate text-sm font-medium text-white max-w-[200px]">{isZh ? item.titleZh : item.titleEn}</p>
                  </td>
                  <td className="px-4 py-2 hidden sm:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceColor(item.sourceType)}`}>{sourceLabel(item.sourceType)}</span>
                  </td>
                  <td className="px-4 py-2 hidden md:table-cell">
                    {item.githubUrl ? (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400">GitHub</span>
                    ) : (
                      <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-slate-500">{isZh ? "本地" : "Local"}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-400 hidden lg:table-cell">{new Date(item.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US")}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleCopyUrl(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" title={isZh ? "复制链接" : "Copy URL"}>
                        {copiedId === item.id ? (
                          <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        ) : (
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" /></svg>
                        )}
                      </button>
                      <button onClick={() => { setEditing(item); setShowForm(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" title={isZh ? "编辑" : "Edit"}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>
                      </button>
                      {!item.githubUrl && githubReady && (
                        <button onClick={() => handleSyncToGithub(item)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" title={isZh ? "同步到 GitHub" : "Sync to GitHub"}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" /></svg>
                        </button>
                      )}
                      {deleteConfirm === item.id ? (
                        <DeleteConfirm
                          onConfirm={() => handleDelete(item.id)}
                          onCancel={() => setDeleteConfirm(null)}
                          confirmLabel={isZh ? "确认" : "Yes"}
                          cancelLabel={isZh ? "取消" : "No"}
                        />
                      ) : (
                        <button onClick={() => setDeleteConfirm(item.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-colors" title={isZh ? "删除" : "Delete"}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AdminModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditing(null); }}
        title={editing ? (isZh ? "编辑素材" : "Edit Asset") : (isZh ? "链接导入" : "URL Import")}
        width="md"
      >
        <ImageForm editing={editing} isZh={isZh} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
      </AdminModal>
    </div>
  );
}

function ImageForm({ editing, isZh, onSave, onCancel }: {
  editing: ImageItem | null;
  isZh: boolean;
  onSave: (d: { titleZh: string; titleEn: string; url: string; descriptionZh: string; descriptionEn: string; published: boolean }) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(editing ? {
    titleZh: editing.titleZh, titleEn: editing.titleEn, url: editing.url,
    descriptionZh: editing.descriptionZh, descriptionEn: editing.descriptionEn,
    published: editing.published,
  } : { titleZh: "", titleEn: "", url: "", descriptionZh: "", descriptionEn: "", published: true });
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
      <AdminInput
        label={isZh ? "图片 URL" : "Image URL"}
        value={form.url}
        onChange={(v) => update("url", v)}
        placeholder="https://..."
      />
      {form.url && <img src={form.url} alt="Preview" className="max-h-48 rounded-lg object-contain" />}
      <BilingualField
        label={isZh ? "描述" : "Description"}
        valueZh={form.descriptionZh}
        valueEn={form.descriptionEn}
        onChangeZh={(v) => update("descriptionZh", v)}
        onChangeEn={(v) => update("descriptionEn", v)}
        type="textarea"
        rows={2}
      />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="published" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="rounded border-slate-600" />
        <label htmlFor="published" className="text-sm text-slate-300">{isZh ? "已发布" : "Published"}</label>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">{isZh ? "取消" : "Cancel"}</button>
        <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
      </div>
    </div>
  );
}
