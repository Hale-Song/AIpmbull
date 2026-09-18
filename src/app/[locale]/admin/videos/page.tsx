import { getT } from "@/lib/i18n/get-messages";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default async function AdminVideosPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "admin");

  return (
    <div className="container-site py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t("videos")}</h1>
        <button className="btn-primary">{t("upload")}</button>
      </div>
      <div className="mt-6 card p-12 text-center text-sm text-slate-500">
        {isZh ? "暂无视频，上传第一个视频吧！" : "No videos yet. Upload your first video!"}
      </div>
    </div>
  );
}
