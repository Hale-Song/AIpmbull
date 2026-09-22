import { getT } from "@/lib/i18n/get-messages";

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return { title: t("portfolioTitle"), description: t("portfolioDescription") };
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return children;
}
