"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { locales } from "@/lib/i18n/config";

export function Navbar() {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { href: "/", label: t("nav.home") },
    { href: "/products", label: t("nav.products") },
    { href: "/projects", label: t("nav.projects") },
    { href: "/articles", label: t("nav.articles") },
    { href: "/about", label: t("nav.about") },
  ];

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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <nav className="container-site flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm text-white">
            AI
          </span>
          <span className="hidden sm:inline">AI PM Bull</span>
        </Link>

        <div className="hidden md:flex md:items-center md:gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-slate-800 text-blue-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
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

          <Link href="/admin/login" className="hidden items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:text-white sm:inline-flex">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {t("login")}
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
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

      {mobileOpen && (
        <div className="border-t border-slate-800 bg-slate-900 md:hidden">
          <div className="container-site space-y-1 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-slate-800 text-blue-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/admin/login"
              onClick={() => setMobileOpen(false)}
              className="btn-primary mt-2 w-full"
            >
              {t("login")}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
