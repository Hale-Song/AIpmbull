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
    featuredArticles: {
      title: t("featuredArticles.title"),
      subtitle: t("featuredArticles.subtitle"),
      viewMore: t("featuredArticles.viewMore"),
    },
    popularProducts: {
      title: t("popularProducts.title"),
      subtitle: t("popularProducts.subtitle"),
    },
    aiTools: {
      title: t("aiTools.title"),
      subtitle: t("aiTools.subtitle"),
      usersTried: t("aiTools.usersTried"),
      exploreMore: t("aiTools.exploreMore"),
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
            <p className="mt-2 text-lg text-slate-500">
              {t("hero.subtitleSecondary")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={`/${locale}/articles`} className="btn-primary w-full sm:w-auto">
                {t("hero.ctaPrimary")}
              </Link>
              <Link href={`/${locale}/projects`} className="btn-secondary w-full sm:w-auto">
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Content from Admin Store */}
      <HomeContent locale={locale} translations={translations} />

      {/* Stats Section */}
      <section className="border-t border-slate-800 bg-slate-900 py-16">
        <div className="container-site">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="text-center">
              <div className="stat-number">10,000+</div>
              <p className="mt-2 text-slate-400">{t("stats.usersServed")}</p>
            </div>
            <div className="text-center">
              <div className="stat-number">50+</div>
              <p className="mt-2 text-slate-400">{t("stats.toolsAvailable")}</p>
            </div>
            <div className="text-center">
              <div className="stat-number">200+</div>
              <p className="mt-2 text-slate-400">{t("stats.articlesPublished")}</p>
            </div>
            <div className="text-center">
              <div className="stat-number">100+</div>
              <p className="mt-2 text-slate-400">{t("stats.toolsReviewed")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
