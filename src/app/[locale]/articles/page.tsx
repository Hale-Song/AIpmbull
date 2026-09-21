import { getT } from "@/lib/i18n/get-messages";
import { ArticleList } from "@/components/articles/ArticleList";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return {
    title: t("articlesTitle"),
    description: t("articlesDescription"),
  };
}

export default async function ArticlesPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "articles");

  const translations = {
    categoryLabels: {
      productReview: t("productReview"),
      productComparison: t("productComparison"),
      industryInsights: t("industryInsights"),
      aiProductManager: t("aiProductManager"),
    },
    readLabel: locale === "zh" ? "阅读" : "views",
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-800 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="container-site relative text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-slate-400">{t("description")}</p>
        </div>
      </section>

      <ArticleList locale={locale} translations={translations} />
    </>
  );
}
