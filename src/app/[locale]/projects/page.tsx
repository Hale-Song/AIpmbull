import { getT } from "@/lib/i18n/get-messages";
import { ProjectContent } from "@/components/projects/ProjectContent";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return {
    title: t("projectsTitle"),
    description: t("projectsDescription"),
  };
}

export default async function ProjectsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "projects");
  const tCommon = await getT(locale, "common");

  const translations = {
    allAgents: t("allAgents"),
    allVideos: t("allVideos"),
    usersTried: isZh ? "人已体验" : "users tried",
    tryNow: tCommon("tryNow"),
  };

  return (
    <>
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
        <div className="container-site text-center">
          <h1 className="text-4xl font-bold text-white">{t("title")}</h1>
          <p className="mt-4 text-lg text-slate-400">{t("description")}</p>
        </div>
      </section>

      <ProjectContent locale={locale} translations={translations} />
    </>
  );
}
