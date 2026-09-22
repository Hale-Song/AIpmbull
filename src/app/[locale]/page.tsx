import Link from "next/link";
import { getT } from "@/lib/i18n/get-messages";
import { HomeContent } from "@/components/home/HomeContent";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "home");
  const tCommon = await getT(locale, "common");

  const translations = {
    featuredPortfolio: {
      title: t("featuredPortfolio.title"),
      subtitle: t("featuredPortfolio.subtitle"),
      viewAll: t("featuredPortfolio.viewAll"),
      role: t("featuredPortfolio.role"),
    },
    featuredArticles: {
      title: t("featuredArticles.title"),
      subtitle: t("featuredArticles.subtitle"),
      viewMore: t("featuredArticles.viewMore"),
    },
    aiTools: {
      title: t("aiTools.title"),
      subtitle: t("aiTools.subtitle"),
      usersTried: t("aiTools.usersTried"),
      exploreMore: t("aiTools.exploreMore"),
      external: t("aiTools.external"),
      demo: t("aiTools.demo"),
      boundary: t("aiTools.boundary"),
    },
    resources: {
      title: t("resources.title"),
      subtitle: t("resources.subtitle"),
      cta: t("resources.cta"),
      desc: t("resources.desc"),
    },
    common: {
      featured: tCommon("featured"),
      tryNow: tCommon("tryNow"),
    },
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
        <div className="container-site relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="badge mx-auto mb-8 w-fit">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t("hero.title")}
              <br />
              <span className="gradient-text">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              {t("hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              {[t("hero.tag1"), t("hero.tag2"), t("hero.tag3"), t("hero.tag4")].map((tag) => (
                <span key={tag} className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-sm text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href={`/${locale}/portfolio`} className="btn-primary w-full sm:w-auto">
                {t("hero.ctaPortfolio")}
              </Link>
              <Link href={`/${locale}/articles`} className="btn-secondary w-full sm:w-auto">
                {t("hero.ctaArticles")}
              </Link>
              <Link href={`/${locale}/resources`} className="btn-secondary w-full sm:w-auto">
                {t("hero.ctaResources")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Content-output Stats */}
      <section className="border-y border-slate-800 bg-slate-900/60 py-10">
        <div className="container-site">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="stat-number">200+</div>
              <p className="mt-1 text-sm text-slate-400">{t("stats.articles")}</p>
            </div>
            <div>
              <div className="stat-number">12</div>
              <p className="mt-1 text-sm text-slate-400">{t("stats.templates")}</p>
            </div>
            <div>
              <div className="stat-number">6</div>
              <p className="mt-1 text-sm text-slate-400">{t("stats.projects")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content: 精选项目 → 最新文章 → 精选工具 → 模板资源 */}
      <HomeContent locale={locale} translations={translations} />
    </>
  );
}
