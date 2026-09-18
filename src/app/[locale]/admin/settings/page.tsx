"use client";

import { useEffect, useState, useCallback } from "react";
import { store, type SiteSettings } from "@/lib/admin/store";

export default function AdminSettingsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(() => {
    const items = store.list<SiteSettings>("settings");
    setSettings(items[0] || null);
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = (field: string, value: string) => {
    setSettings((prev) => prev ? { ...prev, [field]: value } : prev);
    setSaved(false);
  };

  const handleSave = () => {
    if (!settings) return;
    store.update("settings", "settings", settings as unknown as { id: string });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{isZh ? "站点设置" : "Site Settings"}</h2>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-sm">
          {saved ? (
            <>
              <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              {isZh ? "已保存" : "Saved"}
            </>
          ) : (isZh ? "保存设置" : "Save Settings")}
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase text-slate-400">{isZh ? "基本信息" : "Basic Info"}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "站点名称（中文）" : "Site Name (Chinese)"}</label><input type="text" value={settings.siteName} onChange={(e) => update("siteName", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "站点名称（英文）" : "Site Name (English)"}</label><input type="text" value={settings.siteNameEn} onChange={(e) => update("siteNameEn", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            </div>
            <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "Logo 文字" : "Logo Text"}</label><input type="text" value={settings.logo} onChange={(e) => update("logo", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "站点描述（中文）" : "Description (Chinese)"}</label><textarea value={settings.descriptionZh} onChange={(e) => update("descriptionZh", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
              <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "站点描述（英文）" : "Description (English)"}</label><textarea value={settings.descriptionEn} onChange={(e) => update("descriptionEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" /></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase text-slate-400">{isZh ? "联系方式" : "Contact"}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "邮箱" : "Email"}</label><input type="email" value={settings.email} onChange={(e) => update("email", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
              <div><label className="mb-1 block text-xs text-slate-400">{isZh ? "网站" : "Website"}</label><input type="text" value={settings.website} onChange={(e) => update("website", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" /></div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="mb-4 text-sm font-semibold uppercase text-slate-400">{isZh ? "社交媒体" : "Social Media"}</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-slate-400">{isZh ? "微信" : "WeChat"}</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.11.24-.245 0-.06-.024-.12-.04-.178l-.325-1.233a.492.492 0 0 1 .177-.554C23.028 18.553 24 16.823 24 14.867c0-3.01-2.916-5.833-7.062-6.01zM14.58 13.82c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.97-.983zm4.844 0c.535 0 .969.44.969.983a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.983.97-.983z" /></svg>
                  <input type="text" value={settings.wechat} onChange={(e) => update("wechat", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder={isZh ? "微信号" : "WeChat ID"} />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Twitter / X</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  <input type="text" value={settings.twitter} onChange={(e) => update("twitter", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="@username" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">GitHub</label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                  <input type="text" value={settings.github} onChange={(e) => update("github", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 py-2 pl-9 pr-3 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="username" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
