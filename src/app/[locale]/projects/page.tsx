import Link from "next/link";
import { getT } from "@/lib/i18n/get-messages";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return {
    title: t("projectsTitle"),
    description: t("projectsDescription"),
  };
}

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

export default async function ProjectsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "projects");
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
        <h2 className="text-xl font-bold text-white">{t("allAgents")}</h2>
        <div className="mt-6 space-y-8">
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
                    {tool.usersTried.toLocaleString()} {isZh ? "人已体验" : "users tried"}
                  </span>
                  <Link href="#" className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300">
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
      </section>

      <section className="bg-slate-800/50 py-12">
        <div className="container-site">
          <h2 className="text-xl font-bold text-white">{t("allVideos")}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card group overflow-hidden p-0">
                <div className="relative aspect-video bg-slate-800">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/90 shadow-lg">
                      <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white group-hover:text-blue-400">
                    {isZh ? "演示视频" : "Demo Video"} {i}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {isZh ? "观看AI项目的详细演示" : "Watch a detailed demonstration of this AI project"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
