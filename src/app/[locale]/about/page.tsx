import { getT } from "@/lib/i18n/get-messages";
import AboutContact from "@/components/about/AboutContact";
import AboutProfile from "@/components/about/AboutProfile";
import ResumeCard from "@/components/about/ResumeCard";

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

  const philosophy = isZh
    ? [
        { title: "技术为骨，场景为魂", desc: "AI 产品的价值不在模型本身，而在于把模型能力精准嵌入真实业务场景，解决可被量化的问题。" },
        { title: "用评估驱动迭代", desc: "没有评估指标的 AI 功能等于盲飞。先定义召回、忠实度、满意度等指标，再谈优化与上线。" },
        { title: "诚实面对能力边界", desc: "清晰标注 AI 能做什么、不能做什么，用 Badcase 反推产品设计，比夸大宣传更能赢得用户信任。" },
      ]
    : [
        { title: "Tech as bones, scenarios as soul", desc: "The value of an AI product lies not in the model itself, but in embedding model capabilities precisely into real business scenarios to solve quantifiable problems." },
        { title: "Let evaluation drive iteration", desc: "An AI feature without metrics is flying blind. Define recall, faithfulness and satisfaction metrics before optimizing or shipping." },
        { title: "Be honest about capability boundaries", desc: "Clearly mark what AI can and cannot do, and let badcases inform product design — this earns more trust than overclaiming." },
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
          <AboutProfile
            locale={locale}
            intro={t("intro")}
            roleLabel={isZh ? "AI产品经理 / 创作者" : "AI Product Manager / Creator"}
          />

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
            <h2 className="text-2xl font-bold text-white">{isZh ? "产品理念" : "Philosophy"}</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {philosophy.map((p) => (
                <div key={p.title} className="card">
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white">{isZh ? "简历预览" : "Resume"}</h2>
            <div className="mt-8">
              <ResumeCard
                locale={locale}
                role={isZh ? "AI产品经理 / 创作者" : "AI Product Manager / Creator"}
                intro={t("intro")}
                experiences={experiences}
                skills={skills}
              />
            </div>
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white">{t("contact")}</h2>
            <AboutContact locale={locale} />
          </div>
        </div>
      </section>
    </>
  );
}
