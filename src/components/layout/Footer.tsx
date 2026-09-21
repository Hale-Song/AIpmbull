"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useSiteSettings } from "@/hooks/use-store-data";

export function Footer() {
  const t = useTranslations("common");
  const tFooter = useTranslations("footer");
  const locale = useLocale();
  const { settings } = useSiteSettings();
  const isZh = locale === "zh";

  const siteName = isZh ? (settings?.siteName ?? "AI PM Bull") : (settings?.siteNameEn ?? "AI PM Bull");
  const logoText = settings?.logo ?? "AI";
  const email = settings?.email ?? "";
  const website = settings?.website ?? "";
  const wechat = settings?.wechat ?? "";
  const twitter = settings?.twitter ?? "";
  const github = settings?.github ?? "";

  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="container-site py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-2 text-lg font-bold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-sm text-white">
                {logoText}
              </span>
              {siteName}
            </Link>
            <p className="mt-4 max-w-md text-sm text-slate-400">
              {t("siteDescription")}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">{tFooter("quickLinks")}</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href={`/${locale}/products`} className="text-sm text-slate-400 hover:text-white">
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/projects`} className="text-sm text-slate-400 hover:text-white">
                  {t("nav.projects")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/articles`} className="text-sm text-slate-400 hover:text-white">
                  {t("nav.articles")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="text-sm text-slate-400 hover:text-white">
                  {t("nav.about")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">{tFooter("contactUs")}</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-400">
              {email && <li>Email: {email}</li>}
              {website && <li>Website: {website}</li>}
            </ul>
            <div className="mt-4 flex gap-3">
              {wechat && (
                <a href="#" className="text-slate-500 hover:text-slate-300" aria-label="WeChat">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.045c.134 0 .24-.11.24-.245 0-.06-.024-.12-.04-.178l-.325-1.233a.49.49 0 0 1 .177-.554C23.028 18.553 24 16.823 24 14.877c0-3.37-3.165-6.019-7.062-6.019zm-2.465 3.078c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982zm4.93 0c.535 0 .969.44.969.982a.976.976 0 0 1-.969.983.976.976 0 0 1-.969-.983c0-.542.434-.982.97-.982z" />
                  </svg>
                </a>
              )}
              {twitter && (
                <a href={`https://x.com/${twitter.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300" aria-label="Twitter">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              )}
              {github && (
                <a href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300" aria-label="GitHub">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          {tFooter("copyright")}
        </div>
      </div>
    </footer>
  );
}
