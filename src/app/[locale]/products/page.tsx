import { getT } from "@/lib/i18n/get-messages";
import ProductGrid from "@/components/products/ProductGrid";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return {
    title: t("productsTitle"),
    description: t("productsDescription"),
  };
}

export default async function ProductsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "products");

  const messages: Record<string, string> = {
    allCategories: t("allCategories"),
    llm: t("llm"),
    painting: t("painting"),
    writing: t("writing"),
    coding: t("coding"),
    office: t("office"),
    video: t("video"),
  };

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900 py-20">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1920')] bg-cover bg-center opacity-5" />
        <div className="container-site relative text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            AI Products
          </div>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
            {t("description")}
          </p>
        </div>
      </section>

      <ProductGrid locale={locale} messages={messages} />
    </>
  );
}
