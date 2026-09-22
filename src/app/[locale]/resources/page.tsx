"use client";

const templatesZh = [
  { name: "AI 产品 PRD 模板", desc: "面向大模型/RAG 场景的产品需求文档结构" },
  { name: "需求评审 Checklist", desc: "上线前逐项确认的需求评审清单" },
  { name: "RAG 效果评估表", desc: "召回率、忠实度、答案质量量化评估模板" },
  { name: "Agent 能力设计文档", desc: "工具集合、调用时机与失败回退设计" },
  { name: "竞品分析模板", desc: "AI 产品竞品拆解与对标框架" },
  { name: "用户访谈提纲", desc: "面向 AI 产品用户调研的访谈问题库" },
  { name: "Prompt 工程规范", desc: "生产级 Prompt 编写与版本管理约定" },
  { name: "数据标注指南", desc: "标注标准、质检流程与一致性校验" },
  { name: "AI 产品指标体系", desc: "从北极星到过程指标的搭建模板" },
  { name: "灰度发布计划表", desc: "AI 功能灰度节奏与回滚预案" },
  { name: "成本测算表", desc: "Token/推理成本估算与定价参考" },
  { name: "产品复盘模板", desc: "项目上线后的结构化复盘框架" },
];

const templatesEn = [
  { name: "AI Product PRD Template", desc: "PRD structure for LLM/RAG scenarios" },
  { name: "Requirement Review Checklist", desc: "Pre-launch itemized review checklist" },
  { name: "RAG Evaluation Sheet", desc: "Quantify recall, faithfulness and answer quality" },
  { name: "Agent Capability Design Doc", desc: "Toolset, invocation timing and fallback design" },
  { name: "Competitive Analysis Template", desc: "Framework to break down AI product competitors" },
  { name: "User Interview Guide", desc: "Question bank for AI product user research" },
  { name: "Prompt Engineering Spec", desc: "Production prompt writing and versioning conventions" },
  { name: "Data Annotation Guide", desc: "Labeling standards, QC flow and consistency checks" },
  { name: "AI Product Metrics System", desc: "From north-star to process metrics" },
  { name: "Canary Release Plan", desc: "Rollout cadence and rollback plan for AI features" },
  { name: "Cost Estimation Sheet", desc: "Token/inference cost estimation and pricing reference" },
  { name: "Product Retrospective Template", desc: "Structured post-launch retrospective framework" },
];

export default function ResourcesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const templates = isZh ? templatesZh : templatesEn;

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "资源模板" : "Resources & Templates"}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {isZh
              ? "沉淀可复用的 AI 产品经理工作模板，覆盖需求、设计、评估与复盘全流程。持续更新中。"
              : "Reusable working templates for AI product managers, covering requirements, design, evaluation and retrospectives. Continuously updated."}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => (
            <div key={tpl.name} className="card-dark flex items-start gap-3 p-5">
              <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </span>
              <div>
                <h2 className="font-semibold text-white">{tpl.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{tpl.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-slate-500">
          {isZh ? "模板文件即将开放下载，敬请期待。" : "Downloadable files coming soon."}
        </p>
      </div>
    </div>
  );
}
