import Link from "next/link";
import { getT } from "@/lib/i18n/get-messages";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return {
    title: t("articlesTitle"),
    description: t("articlesDescription"),
  };
}

const allArticles = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    categoryZh: "产品评测",
    categoryEn: "Product Review",
    titleZh: "GPT-5 发布：AI产品经理需要关注的5个核心变化",
    titleEn: "GPT-5 Release: 5 Core Changes AI Product Managers Need to Know",
    descriptionZh: "从产品视角解读GPT-5带来的能力升级，包括多模态增强、上下文窗口扩展和对产品设计的影响。",
    descriptionEn: "Interpreting GPT-5's capability upgrades from a product perspective, including multimodal enhancements, context window expansion, and impact on product design.",
    date: "2026-09-15",
    views: 3280,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?w=800&h=400&fit=crop",
    categoryZh: "行业洞察",
    categoryEn: "Industry Insights",
    titleZh: "深度解析：AI Agent 产品设计的核心原则",
    titleEn: "Deep Dive: Core Principles of AI Agent Product Design",
    descriptionZh: "探讨AI Agent产品设计中的关键决策点，包括自主性边界、用户信任建立和错误处理策略。",
    descriptionEn: "Exploring key decision points in AI Agent product design, including autonomy boundaries, user trust building, and error handling strategies.",
    date: "2026-09-12",
    views: 2150,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
    categoryZh: "实战教程",
    categoryEn: "Tutorial",
    titleZh: "从0到1：用AI工具搭建产品经理工作流",
    titleEn: "From 0 to 1: Building a PM Workflow with AI Tools",
    descriptionZh: "手把手教你如何用AI工具优化产品经理的日常工作流程，从需求分析到原型设计再到数据追踪。",
    descriptionEn: "Step-by-step guide on using AI tools to optimize PM daily workflows, from requirements analysis to prototyping to data tracking.",
    date: "2026-09-10",
    views: 4520,
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    categoryZh: "产品对比",
    categoryEn: "Comparison",
    titleZh: "2026年AI编程工具横评：谁更适合产品经理？",
    titleEn: "2026 AI Coding Tools Comparison: Which is Best for PMs?",
    descriptionZh: "对比Cursor、Copilot、Claude Code等主流AI编程工具，从产品经理视角评估易用性和实用性。",
    descriptionEn: "Comparing Cursor, Copilot, Claude Code and other mainstream AI coding tools from a PM perspective on usability and practicality.",
    date: "2026-09-08",
    views: 5890,
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=400&fit=crop",
    categoryZh: "产品评测",
    categoryEn: "Product Review",
    titleZh: "Runway Gen-4 深度体验：AI视频生成的新里程碑",
    titleEn: "Runway Gen-4 Deep Review: A New Milestone in AI Video Generation",
    descriptionZh: "全面体验Runway最新视频生成模型，分析其在产品演示、营销视频等场景的应用潜力。",
    descriptionEn: "Comprehensive review of Runway's latest video generation model, analyzing its potential in product demos and marketing video scenarios.",
    date: "2026-09-05",
    views: 3750,
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800&h=400&fit=crop",
    categoryZh: "行业洞察",
    categoryEn: "Industry Insights",
    titleZh: "AI产品经理必备技能清单：2026年版",
    titleEn: "Essential Skills for AI Product Managers: 2026 Edition",
    descriptionZh: "梳理AI产品经理在2026年需要掌握的核心技能，从技术理解到商业思维的全方位能力模型。",
    descriptionEn: "Mapping out the core skills AI product managers need in 2026, from technical understanding to business thinking.",
    date: "2026-09-02",
    views: 6120,
  },
];

const categories = ["all", "productReview", "productComparison", "industryInsights"];

export default async function ArticlesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "articles");
  const tProducts = await getT(locale, "products");

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-800 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="container-site relative text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-slate-400">{t("description")}</p>
        </div>
      </section>

      <section className="container-site py-12">
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                i === 0
                  ? "bg-blue-600 text-white"
                  : "border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-white"
              }`}
            >
              {cat === "all" ? (isZh ? "全部" : "All") : tProducts(cat)}
            </button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {allArticles.map((article) => (
            <article key={article.id} className="card-dark overflow-hidden p-0">
              <div className="aspect-video w-full overflow-hidden bg-slate-800">
                <img
                  src={article.image}
                  alt={isZh ? article.titleZh : article.titleEn}
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="p-6">
                <span className="badge-category">
                  {isZh ? article.categoryZh : article.categoryEn}
                </span>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {isZh ? article.titleZh : article.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {isZh ? article.descriptionZh : article.descriptionEn}
                </p>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                  <time>{article.date}</time>
                  <span>{article.views.toLocaleString()} {isZh ? "阅读" : "views"}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
