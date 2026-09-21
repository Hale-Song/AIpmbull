"use client";

import { useSiteSettings } from "@/hooks/use-store-data";

export default function AboutProfile({ locale, intro, roleLabel }: { locale: string; intro: string; roleLabel: string }) {
  const { settings } = useSiteSettings();
  const isZh = locale === "zh";

  const siteName = isZh ? (settings?.siteName ?? "AI PM Bull") : (settings?.siteNameEn ?? "AI PM Bull");
  const logoText = settings?.logo ?? "AI";

  return (
    <div className="card flex flex-col items-center gap-8 sm:flex-row sm:items-start">
      <div className="h-36 w-36 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
          {logoText}
        </div>
      </div>
      <div className="text-center sm:text-left">
        <h2 className="text-2xl font-bold text-white">{siteName}</h2>
        <p className="mt-1 text-blue-400">{roleLabel}</p>
        <p className="mt-4 leading-relaxed text-slate-400">{intro}</p>
      </div>
    </div>
  );
}
