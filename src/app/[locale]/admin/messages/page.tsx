"use client";

import { useEffect, useState, useCallback } from "react";
import { store, seedDemoData, type Message } from "@/lib/admin/store";
import { syncAllToApi, syncFromApi } from "@/lib/api/client";
import {
  PageHeader, EmptyState, DeleteConfirm, FilterBar,
} from "@/components/admin";

export default function AdminMessagesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [items, setItems] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(() => { seedDemoData(); setItems(store.list<Message>("messages")); }, []);
  useEffect(() => { syncFromApi().then(() => { load(); setLoading(false); }); }, [load]);

  const handleDelete = (id: string) => { store.delete("messages", id); setDeleteConfirm(null); load(); };
  const handleSync = async () => { await syncAllToApi(); };

  const filtered = [...items]
    .filter((i) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return i.name.toLowerCase().includes(q) || i.email.toLowerCase().includes(q) || i.phone.includes(q) || i.content.toLowerCase().includes(q);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <PageHeader
        title={isZh ? "留言管理" : "Messages"}
        subtitle={isZh ? `共 ${items.length} 条留言` : `${items.length} messages`}
        actions={
          <button onClick={handleSync} className="btn-secondary flex items-center gap-2 text-sm">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.348H4.03a8.25 8.25 0 0 1 13.803-3.7l3.18 3.182" /></svg>
            {isZh ? "同步到云端" : "Sync to Cloud"}
          </button>
        }
      />

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-slate-900/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <svg className="h-8 w-8 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm text-slate-400">{isZh ? "加载中…" : "Loading…"}</span>
            </div>
          </div>
        )}

        <FilterBar
          tabs={[{ key: "all", label: isZh ? "全部" : "All", count: items.length }]}
          activeTab="all"
          onTabChange={() => {}}
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder={isZh ? "搜索姓名、邮箱、电话或内容..." : "Search name, email, phone or content..."}
        />

        {filtered.length === 0 ? (
          <EmptyState message={isZh ? "暂无留言" : "No messages yet"} />
        ) : (
          <div className="space-y-2">
            {filtered.map((item) => (
              <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">{item.name}</span>
                      <span className="text-xs text-slate-500">{item.email}</span>
                      <span className="text-xs text-slate-500">|</span>
                      <span className="text-xs text-slate-500">{item.phone}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300 whitespace-pre-wrap">{item.content}</p>
                    <p className="mt-2 text-[11px] text-slate-600">
                      {new Date(item.createdAt).toLocaleString(isZh ? "zh-CN" : "en-US")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
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
      </div>
    </div>
  );
}
