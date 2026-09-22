"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api/client";
import type { PortfolioProject } from "@/lib/admin/store";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-slate-800 pt-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
        <span className="h-4 w-1 rounded-full bg-blue-500" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bullets({ text }: { text: string }) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  return (
    <ul className="space-y-1.5">
      {lines.map((l, i) => (
        <li key={i} className="flex gap-2 text-slate-300">
          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
          <span className="whitespace-pre-line">{l}</span>
        </li>
      ))}
    </ul>
  );
}

function PortfolioContent({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "";
  const isZh = locale === "zh";
  const t = useTranslations("portfolio");
  const [item, setItem] = useState<PortfolioProject | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); return; }
    apiClient.getById<PortfolioProject>("portfolio", id).then((found) => {
      if (found && found.published) setItem(found);
      else setNotFound(true);
    });
  }, [id]);

  if (notFound) {
    return (
      <div className="container-site flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold text-white">{t("notFound")}</h1>
        <p className="mt-2 text-slate-400">{t("notFoundDesc")}</p>
        <a href={`/${locale}/portfolio/`} className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {t("backToList")}
        </a>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const title = isZh ? item.titleZh : item.titleEn;
  const summary = isZh ? item.summaryZh : item.summaryEn;
  const role = isZh ? item.roleZh : item.roleEn;
  const overview = isZh ? item.detailZh : item.detailEn;
  const background = isZh ? item.backgroundZh : item.backgroundEn;
  const pain = isZh ? item.painZh : item.painEn;
  const selection = isZh ? item.selectionZh : item.selectionEn;
  const flow = isZh ? item.flowZh : item.flowEn;
  const metrics = isZh ? item.metricsZh : item.metricsEn;
  const badcase = isZh ? item.badcaseZh : item.badcaseEn;
  const retro = isZh ? item.retroZh : item.retroEn;
  const hasTemplate = !!(background || pain || selection || flow || metrics || badcase || retro);

  return (
    <article className="container-site max-w-3xl py-12">
      <a href={`/${locale}/portfolio/`} className="mb-8 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-blue-400 transition-colors">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" /></svg>
        {t("backToList")}
      </a>

      {item.coverImage && (
        <div className="mb-8 overflow-hidden rounded-xl">
          <img src={item.coverImage} alt={title} className="h-auto w-full object-cover" />
        </div>
      )}

      <header className="mb-8">
        {item.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">{tag}</span>
            ))}
          </div>
        )}
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {role && <p className="mt-3 text-sm text-blue-400">{t("role")}：{role}</p>}
        {summary && <p className="mt-4 text-lg leading-relaxed text-slate-400">{summary}</p>}
      </header>

      <div className="space-y-6">
        {overview && (
          <Section title={t("overview")}>
            <p className="whitespace-pre-line leading-relaxed text-slate-300">{overview}</p>
          </Section>
        )}

        {hasTemplate ? (
          <>
            {background && (
              <Section title={t("background")}>
                <p className="whitespace-pre-line leading-relaxed text-slate-300">{background}</p>
              </Section>
            )}
            {pain && (
              <Section title={t("pain")}>
                <Bullets text={pain} />
              </Section>
            )}
            {selection && (
              <Section title={t("selection")}>
                <p className="whitespace-pre-line leading-relaxed text-slate-300">{selection}</p>
              </Section>
            )}
            {flow && (
              <Section title={t("flow")}>
                <p className="whitespace-pre-line leading-relaxed text-slate-300">{flow}</p>
              </Section>
            )}
            {metrics && (
              <Section title={t("metrics")}>
                <div className="grid gap-3 sm:grid-cols-2">
                  {metrics.split("\n").map((l) => l.trim()).filter(Boolean).map((line, i) => {
                    const [label, value] = line.includes("：") ? line.split("：") : line.split(":");
                    return (
                      <div key={i} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                        <p className="text-xs text-slate-500">{(label || line).trim()}</p>
                        {value && <p className="mt-1 text-sm font-semibold text-emerald-400">{value.trim()}</p>}
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}
            {badcase && (
              <Section title={t("badcase")}>
                <Bullets text={badcase} />
              </Section>
            )}
            {retro && (
              <Section title={t("retro")}>
                <p className="whitespace-pre-line leading-relaxed text-slate-300">{retro}</p>
              </Section>
            )}
          </>
        ) : null}
      </div>

      <footer className="mt-12 border-t border-slate-800 pt-8">
        <a href={`/${locale}/portfolio/`} className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300">
          ← {t("backToList")}
        </a>
      </footer>
    </article>
  );
}

export default function PortfolioViewPage({ params: { locale } }: { params: { locale: string } }) {
  return (
    <Suspense fallback={
      <div className="container-site flex min-h-[60vh] items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    }>
      <PortfolioContent locale={locale} />
    </Suspense>
  );
}
