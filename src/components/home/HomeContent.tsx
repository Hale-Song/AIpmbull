"use client";

import Link from "next/link";
import { usePublishedArticles, usePublishedProducts, usePublishedAgents } from "@/hooks/use-store-data";

export function HomeContent({ locale, translations }: {
  locale: string;
  translations: {
    featuredArticles: { title: string; subtitle: string; viewMore: string };
    popularProducts: { title: string; subtitle: string };
    aiTools: { title: string; subtitle: string; usersTried: string; exploreMore: string };
    common: { featured: string; tryNow: string };
  };
}) {
  const isZh = locale === "zh";
  const { articles } = usePublishedArticles();
  const { products } = usePublishedProducts();
  const { agents } = usePublishedAgents();

  const featuredArticles = articles.filter(a => a.featured).slice(0, 4);
  const displayProducts = products.slice(0, 6);
  const displayAgents = agents.filter(a => a.featured).slice(0, 3);

  return (
    <>
      {/* Featured Articles Section */}
      <section className="bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-12">
            <h2 className="section-title">{translations.featuredArticles.title}</h2>
            <p className="mt-2 text-slate-400">{translations.featuredArticles.subtitle}</p>
          </div>
          <div className="space-y-8">
            {featuredArticles.map((article) => (
              <article key={article.id} className="card-dark overflow-hidden p-0">
                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                  <img
                    src={article.coverImage}
                    alt={isZh ? article.titleZh : article.titleEn}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="badge-category">{translations.common.featured}</span>
                  <h3 className="mt-3 text-xl font-bold text-white">
                    {isZh ? article.titleZh : article.titleEn}
                  </h3>
                  <p className="mt-2 text-slate-400">
                    {isZh ? article.summaryZh : article.summaryEn}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <time>{new Date(article.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US")}</time>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href={`/${locale}/articles`} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
              {translations.featuredArticles.viewMore}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-12 text-center">
            <h2 className="section-title">{translations.popularProducts.title}</h2>
            <p className="mt-2 text-slate-400">{translations.popularProducts.subtitle}</p>
          </div>
          <div className="space-y-4">
            {displayProducts.map((product) => (
              <div key={product.id} className="card flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-700">
                  <img
                    src={product.imageUrl}
                    alt={isZh ? product.nameZh : product.nameEn}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{isZh ? product.nameZh : product.nameEn}</h3>
                    <span className="flex items-center gap-1 text-amber-400">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {product.rating}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-400">
                    {isZh ? product.descriptionZh : product.descriptionEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Tools Experience Section */}
      <section className="bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-12 text-center">
            <h2 className="section-title">{translations.aiTools.title}</h2>
            <p className="mt-2 text-slate-400">{translations.aiTools.subtitle}</p>
          </div>
          <div className="space-y-8">
            {displayAgents.map((agent) => (
              <div key={agent.id} className="card-dark overflow-hidden p-0">
                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                  <img
                    src={agent.imageUrl}
                    alt={isZh ? agent.nameZh : agent.nameEn}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="badge-category">
                    {agent.category}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-white">
                    {isZh ? agent.nameZh : agent.nameEn}
                  </h3>
                  <p className="mt-2 text-slate-400">
                    {isZh ? agent.descriptionZh : agent.descriptionEn}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {agent.userCount.toLocaleString()} {translations.aiTools.usersTried}
                    </span>
                    <Link href={`/${locale}/projects`} className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300">
                      {translations.common.tryNow}
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href={`/${locale}/projects`} className="btn-primary">
              {translations.aiTools.exploreMore}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
