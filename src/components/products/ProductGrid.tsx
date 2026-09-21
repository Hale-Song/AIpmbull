"use client";

import { useState } from "react";
import Link from "next/link";
import { usePublishedProducts } from "@/hooks/use-store-data";

const categories = ["all", "llm", "painting", "writing", "coding", "office", "video"] as const;
const categoryColors: Record<string, string> = {
  llm: "from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30",
  painting: "from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30",
  writing: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30",
  coding: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
  office: "from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30",
  video: "from-red-500/20 to-orange-500/20 text-red-300 border-red-500/30",
};

export default function ProductGrid({ locale, messages }: { locale: string; messages: Record<string, string> }) {
  const isZh = locale === "zh";
  const [active, setActive] = useState("all");
  const { products } = usePublishedProducts();

  const filtered = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <section className="container-site py-12">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = active === cat;
          const label = cat === "all" ? messages.allCategories : messages[cat];
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "border border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-slate-500">
        {isZh ? `共 ${filtered.length} 个产品` : `${filtered.length} products`}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/50 py-20 text-center">
          <p className="text-slate-500">{isZh ? "该分类暂无产品" : "No products in this category yet"}</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const colorClass = categoryColors[product.category] || "from-slate-500/20 to-slate-500/20 text-slate-300 border-slate-500/30";
            return (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
                  <img
                    src={product.imageUrl}
                    alt={isZh ? product.nameZh : product.nameEn}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className={`inline-flex items-center rounded-full border bg-gradient-to-r px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                      {messages[product.category]}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white transition-colors group-hover:text-blue-400">
                      {isZh ? product.nameZh : product.nameEn}
                    </h3>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {product.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400 line-clamp-2">
                    {isZh ? product.descriptionZh : product.descriptionEn}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      href={product.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-600/20"
                    >
                      {isZh ? "立即体验" : "Try Now"}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
