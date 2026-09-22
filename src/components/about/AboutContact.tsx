"use client";

import { useSiteSettings } from "@/hooks/use-store-data";

export default function AboutContact({ locale }: { locale: string }) {
  const { settings } = useSiteSettings();
  const isZh = locale === "zh";

  const email = settings?.email ?? "";
  const website = settings?.website ?? "";
  const github = settings?.github ?? "";
  const twitter = settings?.twitter ?? "";
  const wechat = settings?.wechat ?? "";

  const items = [
    ...(email ? [{ label: "Email", value: email, href: `mailto:${email}`, color: "bg-blue-500/10 text-blue-400" }] : []),
    ...(website ? [{ label: "Website", value: website, href: `https://${website}`, color: "bg-purple-500/10 text-purple-400" }] : []),
    ...(github ? [{ label: "GitHub", value: github, href: `https://github.com/${github}`, color: "bg-slate-700/40 text-slate-300" }] : []),
    ...(twitter ? [{ label: "Twitter / X", value: twitter.replace(/^@/, ""), href: `https://x.com/${twitter.replace(/^@/, "")}`, color: "bg-sky-500/10 text-sky-400" }] : []),
    ...(wechat ? [{ label: isZh ? "微信" : "WeChat", value: wechat, href: "", color: "bg-emerald-500/10 text-emerald-400" }] : []),
  ];

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="card flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${it.color}`}>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="text-sm text-slate-500">{it.label}</div>
            {it.href ? (
              <a href={it.href} target={it.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="block truncate text-white hover:text-blue-400">{it.value}</a>
            ) : (
              <div className="truncate text-white">{it.value}</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
