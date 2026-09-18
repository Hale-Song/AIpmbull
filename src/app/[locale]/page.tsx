import Link from "next/link";
import { getT } from "@/lib/i18n/get-messages";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
  };
}

const articles = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    category: "featured",
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
    category: "featured",
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
    category: "featured",
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
    category: "featured",
    titleZh: "2026年AI编程工具横评：谁更适合产品经理？",
    titleEn: "2026 AI Coding Tools Comparison: Which is Best for PMs?",
    descriptionZh: "对比Cursor、Copilot、Claude Code等主流AI编程工具，从产品经理视角评估易用性和实用性。",
    descriptionEn: "Comparing Cursor, Copilot, Claude Code and other mainstream AI coding tools from a PM perspective on usability and practicality.",
    date: "2026-09-08",
    views: 5890,
  },
];

const products = [
  {
    id: 1,
    name: "ChatGPT",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?w=100&h=100&fit=crop",
    descriptionZh: "OpenAI推出的对话式AI助手，支持文本生成、代码编写、数据分析等多种任务。",
    descriptionEn: "OpenAI's conversational AI assistant supporting text generation, coding, data analysis and more.",
  },
  {
    id: 2,
    name: "Midjourney",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8d57fbe?w=100&h=100&fit=crop",
    descriptionZh: "领先的AI图像生成工具，擅长高质量艺术风格图片创作，适合产品原型和概念设计。",
    descriptionEn: "Leading AI image generation tool, excels at high-quality artistic images, ideal for product prototyping and concept design.",
  },
  {
    id: 3,
    name: "Cursor",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=100&h=100&fit=crop",
    descriptionZh: "AI驱动的代码编辑器，让非技术背景的产品经理也能快速搭建原型和工具。",
    descriptionEn: "AI-powered code editor enabling non-technical PMs to quickly build prototypes and tools.",
  },
  {
    id: 4,
    name: "Notion AI",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=100&h=100&fit=crop",
    descriptionZh: "集成在Notion中的AI助手，帮助产品经理高效管理文档、整理信息和协作。",
    descriptionEn: "AI assistant integrated in Notion, helping PMs efficiently manage documents, organize information and collaborate.",
  },
  {
    id: 5,
    name: "Runway",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=100&h=100&fit=crop",
    descriptionZh: "AI视频生成与编辑平台，支持文生视频、图生视频，适合产品演示和营销内容制作。",
    descriptionEn: "AI video generation and editing platform, supporting text-to-video and image-to-video, ideal for product demos and marketing content.",
  },
  {
    id: 6,
    name: "Claude",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop",
    descriptionZh: "Anthropic推出的AI助手，以长文本处理和安全可靠著称，适合深度分析任务。",
    descriptionEn: "Anthropic's AI assistant, known for long-text processing and safety, ideal for deep analysis tasks.",
  },
];

const aiTools = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1684369175833-4b445ad6bfb5?w=800&h=400&fit=crop",
    categoryZh: "智能体对话",
    categoryEn: "Agent Chat",
    titleZh: "AI产品顾问",
    titleEn: "AI Product Advisor",
    descriptionZh: "模拟资深AI产品经理，提供产品策略建议、竞品分析和功能优先级评估。",
    descriptionEn: "Simulates a senior AI PM, providing product strategy advice, competitive analysis and feature prioritization.",
    usersTried: 8520,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
    categoryZh: "AI写作",
    categoryEn: "AI Writing",
    titleZh: "需求文档生成器",
    titleEn: "PRD Generator",
    descriptionZh: "输入产品想法，自动生成结构化的PRD文档框架，包含用户故事、功能列表和优先级建议。",
    descriptionEn: "Input product ideas, automatically generate structured PRD document framework with user stories, feature lists and priority suggestions.",
    usersTried: 6340,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    categoryZh: "代码生成",
    categoryEn: "Code Generation",
    titleZh: "AI原型助手",
    titleEn: "AI Prototype Assistant",
    descriptionZh: "用自然语言描述页面需求，快速生成可交互的前端原型代码，加速产品验证。",
    descriptionEn: "Describe page requirements in natural language, quickly generate interactive frontend prototype code to accelerate product validation.",
    usersTried: 4210,
  },
];

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "home");
  const tCommon = await getT(locale, "common");

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-900" />
        <div className="container-site relative">
          <div className="mx-auto max-w-3xl text-center">
            <div className="badge mx-auto mb-8 w-fit">
              <span className="h-2 w-2 rounded-full bg-blue-400" />
              {t("hero.badge")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              {t("hero.title")}
              <br />
              <span className="gradient-text">{t("hero.titleHighlight")}</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400">
              {t("hero.subtitle")}
            </p>
            <p className="mt-2 text-lg text-slate-500">
              {t("hero.subtitleSecondary")}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={`/${locale}/articles`} className="btn-primary w-full sm:w-auto">
                {t("hero.ctaPrimary")}
              </Link>
              <Link href={`/${locale}/projects`} className="btn-secondary w-full sm:w-auto">
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="bg-slate-900 py-16">
        <div className="container-site">
          <div className="mb-12">
            <h2 className="section-title">{t("featuredArticles.title")}</h2>
            <p className="mt-2 text-slate-400">{t("featuredArticles.subtitle")}</p>
          </div>
          <div className="space-y-8">
            {articles.map((article) => (
              <article key={article.id} className="card-dark overflow-hidden p-0">
                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                  <img
                    src={article.image}
                    alt={isZh ? article.titleZh : article.titleEn}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="badge-category">{tCommon("featured")}</span>
                  <h3 className="mt-3 text-xl font-bold text-white">
                    {isZh ? article.titleZh : article.titleEn}
                  </h3>
                  <p className="mt-2 text-slate-400">
                    {isZh ? article.descriptionZh : article.descriptionEn}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <time>{article.date}</time>
                    <span>{article.views} {isZh ? "阅读" : "views"}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href={`/${locale}/articles`} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
              {t("featuredArticles.viewMore")}
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
            <h2 className="section-title">{t("popularProducts.title")}</h2>
            <p className="mt-2 text-slate-400">{t("popularProducts.subtitle")}</p>
          </div>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="card flex items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-700">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{product.name}</h3>
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
            <h2 className="section-title">{t("aiTools.title")}</h2>
            <p className="mt-2 text-slate-400">{t("aiTools.subtitle")}</p>
          </div>
          <div className="space-y-8">
            {aiTools.map((tool) => (
              <div key={tool.id} className="card-dark overflow-hidden p-0">
                <div className="aspect-video w-full overflow-hidden bg-slate-800">
                  <img
                    src={tool.image}
                    alt={isZh ? tool.titleZh : tool.titleEn}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="badge-category">
                    {isZh ? tool.categoryZh : tool.categoryEn}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-white">
                    {isZh ? tool.titleZh : tool.titleEn}
                  </h3>
                  <p className="mt-2 text-slate-400">
                    {isZh ? tool.descriptionZh : tool.descriptionEn}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm text-slate-500">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {tool.usersTried.toLocaleString()} {t("aiTools.usersTried")}
                    </span>
                    <Link href={`/${locale}/projects`} className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300">
                      {tCommon("tryNow")}
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
              {t("aiTools.exploreMore")}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t border-slate-800 bg-slate-900 py-16">
        <div className="container-site">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            <div className="text-center">
              <div className="stat-number">10,000+</div>
              <p className="mt-2 text-slate-400">{t("stats.usersServed")}</p>
            </div>
            <div className="text-center">
              <div className="stat-number">50+</div>
              <p className="mt-2 text-slate-400">{t("stats.toolsAvailable")}</p>
            </div>
            <div className="text-center">
              <div className="stat-number">200+</div>
              <p className="mt-2 text-slate-400">{t("stats.articlesPublished")}</p>
            </div>
            <div className="text-center">
              <div className="stat-number">100+</div>
              <p className="mt-2 text-slate-400">{t("stats.toolsReviewed")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
