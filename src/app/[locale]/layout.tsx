import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { locales } from "@/lib/i18n/config";
import { routing } from "@/lib/i18n/routing";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export function generateMetadata({ params: { locale } }: Props): Metadata {
  const isZh = locale === "zh";

  return {
    title: {
      default: isZh ? "AI产品牛 - AI产品经理的学习平台" : "AIPMBull - Learning Platform for AI Product Managers",
      template: isZh ? `%s - AI产品牛` : `%s - AIPMBull`,
    },
    description: isZh
      ? "aipmbull.com - 深度解析AI产品，体验前沿AI项目，助力AI产品经理成长。提供AI产品评测、行业洞察、智能体体验等内容。"
      : "aipmbull.com - In-depth AI product analysis, cutting-edge AI project experiences. AI product reviews, industry insights, and agent experiences.",
    keywords: isZh
      ? ["AI产品经理", "AI产品", "人工智能", "AI学习", "智能体", "AI评测"]
      : ["AI product manager", "AI products", "artificial intelligence", "AI learning", "AI agents", "AI reviews"],
    metadataBase: new URL("https://aipmbull.com"),
    alternates: {
      languages: {
        zh: "/zh",
        en: "/en",
      },
    },
    openGraph: {
      type: "website",
      locale: isZh ? "zh_CN" : "en_US",
      url: "https://aipmbull.com",
      siteName: isZh ? "AI产品牛" : "AIPMBull",
    },
    twitter: {
      card: "summary_large_image",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  if (!locales.includes(locale as "zh" | "en")) {
    notFound();
  }

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
