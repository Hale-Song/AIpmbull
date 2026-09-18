import { getT } from "@/lib/i18n/get-messages";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default async function AdminAgentsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "admin");

  return (
    <div className="container-site py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t("agents")}</h1>
        <button className="btn-primary">{t("create")}</button>
      </div>
      <div className="mt-6 card p-12 text-center text-sm text-slate-500">
        {isZh ? "暂无智能体，添加第一个AI智能体吧！" : "No agents yet. Add your first AI agent!"}
      </div>
    </div>
  );
}
