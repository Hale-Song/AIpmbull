import { getT } from "@/lib/i18n/get-messages";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return { title: t("resourcesTitle"), description: t("resourcesDescription") };
}

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
