import Link from "next/link";
import { getT } from "@/lib/i18n/get-messages";

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

const products = [
  {
    id: 1,
    name: "ChatGPT",
    rating: 4.8,
    category: "productReview",
    image: "https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?w=400&h=300&fit=crop",
    descriptionZh: "OpenAI推出的对话式AI助手，支持文本生成、代码编写、数据分析等多种任务。",
    descriptionEn: "OpenAI's conversational AI assistant supporting text generation, coding, data analysis and more.",
  },
  {
    id: 2,
    name: "Midjourney",
    rating: 4.7,
    category: "productReview",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop",
    descriptionZh: "领先的AI图像生成工具，擅长高质量艺术风格图片创作，适合产品原型和概念设计。",
    descriptionEn: "Leading AI image generation tool, excels at high-quality artistic images, ideal for product prototyping and concept design.",
  },
  {
    id: 3,
    name: "Cursor",
    rating: 4.6,
    category: "productComparison",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=300&fit=crop",
    descriptionZh: "AI驱动的代码编辑器，让非技术背景的产品经理也能快速搭建原型和工具。",
    descriptionEn: "AI-powered code editor enabling non-technical PMs to quickly build prototypes and tools.",
  },
  {
    id: 4,
    name: "Notion AI",
    rating: 4.5,
    category: "productReview",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400&h=300&fit=crop",
    descriptionZh: "集成在Notion中的AI助手，帮助产品经理高效管理文档、整理信息和协作。",
    descriptionEn: "AI assistant integrated in Notion, helping PMs efficiently manage documents, organize information and collaborate.",
  },
  {
    id: 5,
    name: "Runway",
    rating: 4.4,
    category: "industryInsights",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=400&h=300&fit=crop",
    descriptionZh: "AI视频生成与编辑平台，支持文生视频、图生视频，适合产品演示和营销内容制作。",
    descriptionEn: "AI video generation and editing platform, supporting text-to-video and image-to-video, ideal for product demos and marketing content.",
  },
  {
    id: 6,
    name: "Claude",
    rating: 4.7,
    category: "productComparison",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop",
    descriptionZh: "Anthropic推出的AI助手，以长文本处理和安全可靠著称，适合深度分析任务。",
    descriptionEn: "Anthropic's AI assistant, known for long-text processing and safety, ideal for deep analysis tasks.",
  },
];

export default async function ProductsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "products");
  const tCommon = await getT(locale, "common");

  return (
    <>
      <section className="bg-gradient-to-b from-slate-800 to-slate-900 py-16">
        <div className="container-site text-center">
          <h1 className="text-4xl font-bold text-white">{t("title")}</h1>
          <p className="mt-4 text-lg text-slate-400">{t("description")}</p>
        </div>
      </section>

      <section className="container-site py-12">
        <div className="flex flex-wrap gap-2">
          <button className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            {t("allCategories")}
          </button>
          <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
            {t("productReview")}
          </button>
          <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
            {t("productComparison")}
          </button>
          <button className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white">
            {t("industryInsights")}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product.id} className="card group overflow-hidden p-0">
              <div className="aspect-video w-full overflow-hidden bg-slate-800">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2">
                  <span className="badge-category">{t(product.category)}</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {product.rating}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white group-hover:text-blue-400">
                  {product.name}
                </h3>
                <p className="mt-2 text-sm text-slate-400 line-clamp-2">
                  {isZh ? product.descriptionZh : product.descriptionEn}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                  <Link href="#" className="text-blue-400 hover:text-blue-300">
                    {tCommon("readMore")} →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
