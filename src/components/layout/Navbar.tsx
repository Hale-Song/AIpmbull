"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { locales } from "@/lib/i18n/config";
import { useSiteSettings } from "@/hooks/use-store-data";
import { useAuth } from "@/hooks/use-auth";

export function Navbar() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { settings } = useSiteSettings();
  const { loggedIn, logout } = useAuth();
  const isZh = locale === "zh";

  const siteName = isZh ? (settings?.siteName ?? "AI PM Bull") : (settings?.siteNameEn ?? "AI PM Bull");
  const logoText = settings?.logo ?? "AI";

  const mainNavItems = [
    { href: `/${locale}`, label: t("nav.home") },
    { href: `/${locale}/portfolio`, label: t("nav.portfolio") },
    { href: `/${locale}/articles`, label: t("nav.articles") },
    { href: `/${locale}/projects`, label: t("nav.tools") },
    { href: `/${locale}/resources`, label: t("nav.resources") },
  ];

  const secondaryNavItems = [
    { href: `/${locale}/labs`, label: t("nav.labs") },
    { href: `/${locale}/notes`, label: t("nav.notes") },
    { href: `/${locale}/slides`, label: t("nav.slides") },
    { href: `/${locale}/qa`, label: t("nav.qa") },
    { href: `/${locale}/links`, label: t("nav.links") },
    { href: `/${locale}/about`, label: t("nav.about") },
    { href: `/${locale}/contact`, label: t("nav.contact") },
  ];

  const allNavItems = [...mainNavItems, ...secondaryNavItems];

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    const hasLocale = locales.includes(segments[1] as "zh" | "en");
    if (hasLocale) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    return segments.join("/") || "/";
  };

  const linkCls = (href: string) =>
    cn(
      "rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
      pathname === href
        ? "bg-slate-800 text-blue-400"
        : "text-slate-400 hover:bg-slate-800 hover:text-white"
    );

  const secLinkCls = (href: string) =>
    cn(
      "rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
      pathname === href
        ? "bg-slate-800/80 text-blue-400"
        : "text-slate-500 hover:bg-slate-800/60 hover:text-slate-300"
    );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      {/* Primary bar */}
      <nav className="container-site flex h-14 items-center justify-between gap-4">
        <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm text-white">
            {logoText}
          </span>
          <span className="hidden sm:inline">{siteName}</span>
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {mainNavItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkCls(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="flex rounded-lg border border-slate-700 text-sm">
            {locales.map((l) => (
              <Link
                key={l}
                href={switchLocale(l)}
                className={cn(
                  "px-2.5 py-1.5 transition-colors",
                  locale === l
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {l === "zh" ? "中" : "EN"}
              </Link>
            ))}
          </div>

          {loggedIn ? (
            <>
              <Link href={`/${locale}/admin`} className="hidden items-center gap-1.5 rounded-lg bg-blue-600/10 px-3 py-1.5 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-600/20 sm:inline-flex">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {isZh ? "管理后台" : "Admin"}
              </Link>
              <button onClick={logout} className="hidden items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-400 transition-colors hover:border-slate-600 hover:text-white sm:inline-flex">
                {isZh ? "退出" : "Logout"}
              </button>
            </>
          ) : (
            <Link href={`/${locale}/admin/login`} className="hidden items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white sm:inline-flex">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {t("login")}
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Secondary nav bar — desktop only */}
      <div className="hidden border-t border-slate-800/50 bg-slate-900/80 lg:block">
        <div className="container-site flex items-center gap-0.5 py-1">
          {secondaryNavItems.map((item) => (
            <Link key={item.href} href={item.href} className={secLinkCls(item.href)}>
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-900 lg:hidden">
          <div className="container-site space-y-1 py-3">
            {allNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={linkCls(item.href)}
              >
                {item.label}
              </Link>
            ))}
            {loggedIn ? (
              <>
                <Link
                  href={`/${locale}/admin`}
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary mt-2 w-full"
                >
                  {isZh ? "管理后台" : "Admin Console"}
                </Link>
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="mt-1 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white"
                >
                  {isZh ? "退出登录" : "Logout"}
                </button>
              </>
            ) : (
              <Link
                href={`/${locale}/admin/login`}
                onClick={() => setMobileOpen(false)}
                className="btn-primary mt-2 w-full"
              >
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
