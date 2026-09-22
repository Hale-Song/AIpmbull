import { getT } from "@/lib/i18n/get-messages";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return { title: t("slidesTitle"), description: t("slidesDescription") };
}

export default function SlidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
