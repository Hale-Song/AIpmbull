import { getT } from "@/lib/i18n/get-messages";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return { title: t("qaTitle"), description: t("qaDescription") };
}

export default function QALayout({ children }: { children: React.ReactNode }) {
  return children;
}
