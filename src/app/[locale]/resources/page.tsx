"use client";

type Tpl = { id: string; zh: string; en: string; descZh: string; descEn: string; featured?: boolean; content?: (isZh: boolean) => string };

function skeleton(name: string, desc: string): string {
  return `# ${name}\n\n> ${desc}\n\n## 概述 / Overview\n（在此说明本模板的用途与适用场景 / Describe the purpose and applicable scenarios）\n\n## 关键要素 / Key Elements\n- \n- \n- \n\n## 执行步骤 / Steps\n1. \n2. \n3. \n\n## 检查清单 / Checklist\n- [ ] \n- [ ] \n\n## 备注 / Notes\n`;
}

const coreContent: Record<string, (isZh: boolean) => string> = {
  "ai-prd": (isZh) => isZh
    ? `# AI 产品 PRD：<产品/功能名称>\n\n## 1. 背景与目标\n- 业务背景：\n- 目标用户：\n- 要解决的核心问题：\n- 成功指标（北极星）：\n\n## 2. 需求范围\n- 本期范围（In Scope）：\n- 非目标（Out of Scope）：\n\n## 3. 场景与用户故事\n- 作为<角色>，我希望<能力>，以便<价值>\n\n## 4. 功能需求\n| 编号 | 功能 | 描述 | 优先级 | 验收标准 |\n|---|---|---|---|---|\n| F1 |  |  | P0 |  |\n\n## 5. AI 能力设计\n- 模型 / 技术选型：\n- 输入与输出定义：\n- Prompt / 检索策略：\n- 置信度与兜底（fallback）：\n- 人工介入（human-in-the-loop）时机：\n\n## 6. 数据与评估\n- 训练 / 评估数据来源：\n- 评估指标（准确率 / 召回 / 忠实度 / 满意度）：\n- Badcase 收集与迭代机制：\n\n## 7. 交互与原型\n- 关键流程：\n- 异常与空状态：\n\n## 8. 风险与合规\n- 幻觉 / 合规 / 隐私 / 成本风险与对策：\n\n## 9. 里程碑\n| 阶段 | 交付物 | 时间 |\n|---|---|---|\n`
    : `# AI Product PRD: <Product/Feature Name>\n\n## 1. Background & Goals\n- Business context:\n- Target users:\n- Core problem to solve:\n- Success metric (north star):\n\n## 2. Scope\n- In scope:\n- Out of scope:\n\n## 3. Scenarios & User Stories\n- As a <role>, I want <capability> so that <value>\n\n## 4. Functional Requirements\n| ID | Feature | Description | Priority | Acceptance |\n|---|---|---|---|---|\n| F1 |  |  | P0 |  |\n\n## 5. AI Capability Design\n- Model / tech selection:\n- Input & output definition:\n- Prompt / retrieval strategy:\n- Confidence & fallback:\n- Human-in-the-loop triggers:\n\n## 6. Data & Evaluation\n- Training / eval data sources:\n- Metrics (accuracy / recall / faithfulness / satisfaction):\n- Badcase collection & iteration:\n\n## 7. Interaction & Prototype\n- Key flows:\n- Error & empty states:\n\n## 8. Risk & Compliance\n- Hallucination / compliance / privacy / cost risks & mitigations:\n\n## 9. Milestones\n| Phase | Deliverable | Timing |\n|---|---|---|\n`,

  "rag-eval": (isZh) => isZh
    ? `# RAG 效果评估表：<系统名称>\n\n## 一、评估目标\n- 评估对象：检索 + 生成端到端\n- 评估集规模：__ 条真实问题\n\n## 二、检索质量指标\n| 指标 | 定义 | 目标值 | 实测 | 备注 |\n|---|---|---|---|---|\n| Recall@K | Top-K 命中相关文档比例 | ≥85% |  |  |\n| Precision@K | Top-K 中相关文档占比 |  |  |  |\n| MRR | 首个相关结果排名倒数均值 |  |  |  |\n| 命中率 | 至少召回 1 条相关文档的问题占比 |  |  |  |\n\n## 三、生成质量指标\n| 指标 | 定义 | 评分方式 | 目标 | 实测 |\n|---|---|---|---|---|\n| 忠实度 Faithfulness | 答案是否有检索证据支撑 | 1-5 人工/LLM | ≥4.2 |  |\n| 答案相关性 | 答案是否回应问题 | 1-5 | ≥4.0 |  |\n| 完整性 | 是否覆盖关键信息点 | 1-5 |  |  |\n| 幻觉率 | 无依据陈述占比 | 抽样统计 | ≤5% |  |\n\n## 四、Badcase 记录\n| 编号 | 问题 | 期望答案 | 实际答案 | 失败环节 | 根因 | 改进项 |\n|---|---|---|---|---|---|---|\n\n## 五、结论与迭代\n- 本轮结论：\n- 下一轮优化方向：\n`
    : `# RAG Evaluation Sheet: <System Name>\n\n## 1. Objective\n- Scope: end-to-end retrieval + generation\n- Eval set size: __ real questions\n\n## 2. Retrieval Metrics\n| Metric | Definition | Target | Actual | Notes |\n|---|---|---|---|---|\n| Recall@K | Relevant docs in Top-K | ≥85% |  |  |\n| Precision@K | Relevant ratio in Top-K |  |  |  |\n| MRR | Mean reciprocal rank of first hit |  |  |  |\n| Hit rate | % questions with ≥1 relevant doc |  |  |  |\n\n## 3. Generation Metrics\n| Metric | Definition | Scoring | Target | Actual |\n|---|---|---|---|---|\n| Faithfulness | Answer grounded in evidence | 1-5 human/LLM | ≥4.2 |  |\n| Relevance | Answer addresses the question | 1-5 | ≥4.0 |  |\n| Completeness | Covers key information points | 1-5 |  |  |\n| Hallucination rate | % unsupported statements | sampling | ≤5% |  |\n\n## 4. Badcase Log\n| ID | Question | Expected | Actual | Failed stage | Root cause | Fix |\n|---|---|---|---|---|---|---|\n\n## 5. Conclusion & Iteration\n- This round:\n- Next optimization:\n`,

  "ai-canvas": (isZh) => isZh
    ? `# AI 产品画布：<产品名称>\n\n> 一页纸梳理 AI 产品的价值、能力与风险。\n\n## 1. 问题与机会\n- 用户痛点：\n- 现有方案的不足：\n- 为什么是现在（Why now）：\n\n## 2. 目标用户与场景\n- 核心用户：\n- 高频场景：\n\n## 3. 价值主张\n- 我们提供的独特价值：\n\n## 4. AI 能力方案\n- 任务类型（生成 / 检索 / 分类 / 决策）：\n- 模型与技术选型：\n- 数据需求：\n- 人机协作方式：\n\n## 5. 评估与指标\n- 北极星指标：\n- AI 质量指标：\n- 业务指标：\n\n## 6. 风险与边界\n- 能力边界（不能做什么）：\n- 幻觉 / 合规 / 成本风险：\n- 兜底策略：\n\n## 7. 商业模式\n- 成本结构（推理 / 标注 / 维护）：\n- 收入 / 价值兑现：\n\n## 8. 路线图\n- MVP → 迭代 → 规模化：\n`
    : `# AI Product Canvas: <Product Name>\n\n> A one-page map of an AI product's value, capability and risk.\n\n## 1. Problem & Opportunity\n- User pain:\n- Gaps in current solutions:\n- Why now:\n\n## 2. Target Users & Scenarios\n- Core users:\n- High-frequency scenarios:\n\n## 3. Value Proposition\n- The unique value we deliver:\n\n## 4. AI Capability\n- Task type (generation / retrieval / classification / decision):\n- Model & tech selection:\n- Data needs:\n- Human-AI collaboration:\n\n## 5. Evaluation & Metrics\n- North-star metric:\n- AI quality metrics:\n- Business metrics:\n\n## 6. Risk & Boundaries\n- Capability boundaries (what it can't do):\n- Hallucination / compliance / cost risks:\n- Fallback strategy:\n\n## 7. Business Model\n- Cost structure (inference / labeling / maintenance):\n- Revenue / value capture:\n\n## 8. Roadmap\n- MVP → iterate → scale:\n`,

  "req-breakdown": (isZh) => isZh
    ? `# 需求拆解模板：<需求名称>\n\n## 1. 原始需求\n- 一句话需求：\n- 提出方 / 来源：\n- 背景与约束：\n\n## 2. 需求澄清\n- 目标用户是谁：\n- 要达成的业务目标：\n- 成功如何衡量：\n- 明确的非目标：\n\n## 3. 拆解为子需求\n| 编号 | 子需求 | 类型 | 优先级 | 依赖 | 预估工作量 |\n|---|---|---|---|---|---|\n\n## 4. AI 相关拆解（如适用）\n- 需要的模型能力：\n- 数据 / 标注需求：\n- 评估方式：\n- 兜底与人工介入：\n\n## 5. 验收标准\n- 功能验收：\n- 质量验收（指标阈值）：\n\n## 6. 风险与开放问题\n- 待确认问题：\n- 风险与对策：\n`
    : `# Requirement Breakdown: <Requirement Name>\n\n## 1. Original Requirement\n- One-liner:\n- Requester / source:\n- Context & constraints:\n\n## 2. Clarification\n- Who are the target users:\n- Business goal to achieve:\n- How success is measured:\n- Explicit non-goals:\n\n## 3. Break into Sub-requirements\n| ID | Sub-requirement | Type | Priority | Dependency | Estimate |\n|---|---|---|---|---|---|\n\n## 4. AI-specific Breakdown (if any)\n- Required model capability:\n- Data / labeling needs:\n- Evaluation approach:\n- Fallback & human-in-the-loop:\n\n## 5. Acceptance Criteria\n- Functional acceptance:\n- Quality acceptance (metric thresholds):\n\n## 6. Risks & Open Questions\n- To be confirmed:\n- Risks & mitigations:\n`,
};

const templates: Tpl[] = [
  { id: "ai-prd", zh: "AI 产品 PRD 模板", en: "AI Product PRD Template", descZh: "面向大模型/RAG 场景的产品需求文档结构，含 AI 能力设计与评估", descEn: "PRD structure for LLM/RAG scenarios with AI capability design and evaluation", featured: true, content: coreContent["ai-prd"] },
  { id: "rag-eval", zh: "RAG 效果评估表", en: "RAG Evaluation Sheet", descZh: "召回率、忠实度、幻觉率等量化评估模板 + Badcase 记录表", descEn: "Quantify recall, faithfulness and hallucination rate, plus a badcase log", featured: true, content: coreContent["rag-eval"] },
  { id: "ai-canvas", zh: "AI 产品画布", en: "AI Product Canvas", descZh: "一页纸梳理 AI 产品的价值、能力、指标、风险与商业模式", descEn: "One-page map of value, capability, metrics, risk and business model", featured: true, content: coreContent["ai-canvas"] },
  { id: "req-breakdown", zh: "需求拆解模板", en: "Requirement Breakdown", descZh: "把模糊需求澄清并拆解为可交付子需求与验收标准", descEn: "Clarify vague requirements into deliverable sub-tasks and acceptance criteria", featured: true, content: coreContent["req-breakdown"] },
  { id: "review-checklist", zh: "需求评审 Checklist", en: "Requirement Review Checklist", descZh: "上线前逐项确认的需求评审清单", descEn: "Pre-launch itemized review checklist" },
  { id: "agent-design", zh: "Agent 能力设计文档", en: "Agent Capability Design Doc", descZh: "工具集合、调用时机与失败回退设计", descEn: "Toolset, invocation timing and fallback design" },
  { id: "competitive", zh: "竞品分析模板", en: "Competitive Analysis Template", descZh: "AI 产品竞品拆解与对标框架", descEn: "Framework to break down AI product competitors" },
  { id: "interview", zh: "用户访谈提纲", en: "User Interview Guide", descZh: "面向 AI 产品用户调研的访谈问题库", descEn: "Question bank for AI product user research" },
  { id: "prompt-spec", zh: "Prompt 工程规范", en: "Prompt Engineering Spec", descZh: "生产级 Prompt 编写与版本管理约定", descEn: "Production prompt writing and versioning conventions" },
  { id: "annotation", zh: "数据标注指南", en: "Data Annotation Guide", descZh: "标注标准、质检流程与一致性校验", descEn: "Labeling standards, QC flow and consistency checks" },
  { id: "metrics", zh: "AI 产品指标体系", en: "AI Product Metrics System", descZh: "从北极星到过程指标的搭建模板", descEn: "From north-star to process metrics" },
  { id: "canary", zh: "灰度发布计划表", en: "Canary Release Plan", descZh: "AI 功能灰度节奏与回滚预案", descEn: "Rollout cadence and rollback plan for AI features" },
  { id: "cost", zh: "成本测算表", en: "Cost Estimation Sheet", descZh: "Token/推理成本估算与定价参考", descEn: "Token/inference cost estimation and pricing reference" },
  { id: "retro", zh: "产品复盘模板", en: "Product Retrospective Template", descZh: "项目上线后的结构化复盘框架", descEn: "Structured post-launch retrospective framework" },
];

function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ResourcesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";

  const handleDownload = (tpl: Tpl) => {
    const name = isZh ? tpl.zh : tpl.en;
    const desc = isZh ? tpl.descZh : tpl.descEn;
    const text = tpl.content ? tpl.content(isZh) : skeleton(name, desc);
    download(`${tpl.id}.md`, text);
  };

  const featured = templates.filter((t) => t.featured);
  const others = templates.filter((t) => !t.featured);

  const DownloadIcon = (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
  );

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "资源模板" : "Resources & Templates"}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {isZh
              ? "沉淀可复用的 AI 产品经理工作模板，覆盖需求、设计、评估与复盘全流程。点击即可下载 Markdown 文件。"
              : "Reusable working templates for AI product managers, covering requirements, design, evaluation and retrospectives. Click to download the Markdown file."}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {featured.map((tpl) => (
            <div key={tpl.id} className="card-dark flex flex-col border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </span>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{isZh ? "核心模板" : "Core"}</span>
              </div>
              <h2 className="mt-4 text-lg font-bold text-white">{isZh ? tpl.zh : tpl.en}</h2>
              <p className="mt-2 flex-1 text-sm text-slate-400">{isZh ? tpl.descZh : tpl.descEn}</p>
              <button onClick={() => handleDownload(tpl)} className="btn-primary mt-5 inline-flex items-center justify-center gap-2 text-sm">
                {DownloadIcon}
                {isZh ? "下载模板" : "Download"}
              </button>
            </div>
          ))}
        </div>

        <h2 className="mt-14 text-xl font-bold text-white">{isZh ? "更多模板" : "More Templates"}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((tpl) => (
            <div key={tpl.id} className="card-dark flex items-start gap-3 p-5">
              <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-white">{isZh ? tpl.zh : tpl.en}</h3>
                <p className="mt-1 text-sm text-slate-400">{isZh ? tpl.descZh : tpl.descEn}</p>
                <button onClick={() => handleDownload(tpl)} className="mt-3 inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300">
                  {DownloadIcon}
                  {isZh ? "下载" : "Download"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
