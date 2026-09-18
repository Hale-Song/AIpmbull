import Link from "next/link";
import { getT } from "@/lib/i18n/get-messages";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export default async function AdminDashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "admin");

  const menuItems = [
    { href: "/admin/articles", label: t("articles"), icon: "📝", count: 0 },
    { href: "/admin/videos", label: t("videos"), icon: "🎬", count: 0 },
    { href: "/admin/agents", label: t("agents"), icon: "🤖", count: 0 },
    { href: "/admin/images", label: t("images"), icon: "🖼️", count: 0 },
  ];

  return (
    <div className="container-site py-8">
      <h1 className="text-2xl font-bold text-white">{t("dashboard")}</h1>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="card flex items-center gap-4 group"
          >
            <span className="text-3xl">{item.icon}</span>
            <div>
              <h3 className="font-semibold text-white group-hover:text-blue-400">
                {item.label}
              </h3>
              <p className="text-sm text-slate-500">{item.count} {isZh ? "条内容" : "items"}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold text-white">
            {isZh ? "快捷操作" : "Quick Actions"}
          </h2>
          <div className="mt-4 space-y-2">
            <Link href="/admin/articles" className="btn-primary w-full">
              {t("create")} {t("articles")}
            </Link>
            <Link href="/admin/videos" className="btn-secondary w-full">
              {t("upload")} {t("videos")}
            </Link>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-white">
            {isZh ? "最近动态" : "Recent Activity"}
          </h2>
          <p className="mt-4 text-sm text-slate-500">
            {isZh ? "暂无动态" : "No recent activity"}
          </p>
        </div>
      </div>
    </div>
  );
}
