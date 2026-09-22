import { getT } from "@/lib/i18n/get-messages";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return { title: t("linksTitle"), description: t("linksDescription") };
}

export default function LinksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
