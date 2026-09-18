import { getT } from "@/lib/i18n/get-messages";
import Link from "next/link";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default async function AdminArticlesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "admin");

  return (
    <div className="container-site py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">{t("articles")}</h1>
        <button className="btn-primary">{t("create")}</button>
      </div>

      <div className="mt-6 card overflow-hidden p-0">
        <table className="min-w-full divide-y divide-slate-700">
          <thead className="bg-slate-800/80">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                {isZh ? "标题" : "Title"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                {isZh ? "状态" : "Status"}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-slate-400">
                {isZh ? "日期" : "Date"}
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-slate-400">
                {isZh ? "操作" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            <tr>
              <td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-500">
                {isZh ? "暂无文章，创建第一篇文章吧！" : "No articles yet. Create your first article!"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
