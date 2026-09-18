import { getT } from "@/lib/i18n/get-messages";

export function generateStaticParams() {
  return [{ locale: "zh" }, { locale: "en" }];
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getT(locale, "seo");
  return {
    title: t("aboutTitle"),
    description: t("aboutDescription"),
  };
}

export default async function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const t = await getT(locale, "about");

  const experiences = isZh
    ? [
        {
          year: "2023 - 至今",
          title: "高级AI产品经理",
          company: "某头部科技公司",
          desc: "负责多条AI产品线的规划与落地，主导大模型应用场景探索",
        },
        {
          year: "2020 - 2023",
          title: "AI产品经理",
          company: "AI创业公司",
          desc: "从0到1搭建AI产品体系，完成NLP、CV等多个AI方向的产品化",
        },
        {
          year: "2018 - 2020",
          title: "产品经理",
          company: "互联网公司",
          desc: "负责C端产品设计与迭代，积累扎实的产品方法论",
        },
      ]
    : [
        {
          year: "2023 - Present",
          title: "Senior AI Product Manager",
          company: "Leading Tech Company",
          desc: "Leading multiple AI product lines, driving LLM application exploration",
        },
        {
          year: "2020 - 2023",
          title: "AI Product Manager",
          company: "AI Startup",
          desc: "Built AI product system from scratch across NLP and CV domains",
        },
        {
          year: "2018 - 2020",
          title: "Product Manager",
          company: "Internet Company",
          desc: "Led C-end product design and iteration, building solid product methodology",
        },
      ];

  const skills = isZh
    ? [
        { name: "AI/大模型", level: 95 },
        { name: "产品策略", level: 90 },
        { name: "用户研究", level: 85 },
        { name: "数据分析", level: 88 },
        { name: "Prompt工程", level: 92 },
        { name: "产品设计", level: 87 },
      ]
    : [
        { name: "AI/LLM", level: 95 },
        { name: "Product Strategy", level: 90 },
        { name: "User Research", level: 85 },
        { name: "Data Analysis", level: 88 },
        { name: "Prompt Engineering", level: 92 },
        { name: "Product Design", level: 87 },
      ];

  return (
    <>
      <section className="relative overflow-hidden border-b border-slate-800 py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10" />
        <div className="container-site relative text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            {isZh
              ? "AI产品经理的一站式学习与产品体验平台"
              : "A one-stop learning platform for AI product managers"}
          </p>
        </div>
      </section>

      <section className="container-site py-16">
        <div className="mx-auto max-w-4xl">
          <div className="card flex flex-col items-center gap-8 sm:flex-row sm:items-start">
            <div className="h-36 w-36 flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                AI
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white">AI PM Bull</h2>
              <p className="mt-1 text-blue-400">
                {isZh ? "AI产品经理 / 创作者" : "AI Product Manager / Creator"}
              </p>
              <p className="mt-4 leading-relaxed text-slate-400">
                {t("intro")}
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
                <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-center">
                  <div className="text-2xl font-bold text-blue-400">10K+</div>
                  <div className="text-xs text-slate-500">
                    {isZh ? "服务用户" : "Users Served"}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-center">
                  <div className="text-2xl font-bold text-purple-400">50+</div>
                  <div className="text-xs text-slate-500">
                    {isZh ? "AI工具" : "AI Tools"}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-center">
                  <div className="text-2xl font-bold text-blue-400">200+</div>
                  <div className="text-xs text-slate-500">
                    {isZh ? "深度文章" : "Articles"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white">{t("experience")}</h2>
            <div className="mt-8 space-y-0">
              {experiences.map((exp, i) => (
                <div key={i} className="relative flex gap-6 pb-8">
                  <div className="flex flex-col items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 bg-slate-900 text-sm font-bold text-blue-400">
                      {i + 1}
                    </div>
                    {i < experiences.length - 1 && (
                      <div className="mt-2 w-px flex-1 bg-gradient-to-b from-blue-500/50 to-transparent" />
                    )}
                  </div>
                  <div className="card flex-1">
                    <time className="text-sm font-medium text-blue-400">
                      {exp.year}
                    </time>
                    <h3 className="mt-1 text-lg font-semibold text-white">
                      {exp.title}
                    </h3>
                    <p className="text-sm text-purple-400">{exp.company}</p>
                    <p className="mt-2 text-sm text-slate-400">{exp.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white">{t("skills")}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {skills.map((skill) => (
                <div key={skill.name} className="card">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-white">{skill.name}</span>
                    <span className="text-sm text-blue-400">{skill.level}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white">{t("contact")}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="card flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Email</div>
                  <div className="text-white">contact@aipmbull.com</div>
                </div>
              </div>
              <div className="card flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Website</div>
                  <div className="text-white">aipmbull.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
