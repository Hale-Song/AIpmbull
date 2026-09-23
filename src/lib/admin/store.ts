export interface Article {
  id: string;
  articleNo?: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  contentZh: string;
  contentEn: string;
  coverImage: string;
  category: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  imageUrl: string;
  websiteUrl: string;
  category: string;
  rating: number;
  pmScenarioZh?: string;
  pmScenarioEn?: string;
  pmProsZh?: string;
  pmProsEn?: string;
  pmConsZh?: string;
  pmConsEn?: string;
  pmTakeawayZh?: string;
  pmTakeawayEn?: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioProject {
  id: string;
  titleZh: string;
  titleEn: string;
  summaryZh: string;
  summaryEn: string;
  roleZh: string;
  roleEn: string;
  coverImage: string;
  tags: string[];
  category: string;
  detailZh: string;
  detailEn: string;
  backgroundZh?: string;
  backgroundEn?: string;
  painZh?: string;
  painEn?: string;
  selectionZh?: string;
  selectionEn?: string;
  flowZh?: string;
  flowEn?: string;
  metricsZh?: string;
  metricsEn?: string;
  badcaseZh?: string;
  badcaseEn?: string;
  retroZh?: string;
  retroEn?: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  imageUrl: string;
  agentUrl: string;
  apiToken: string;
  projectId: string;
  category: string;
  workflow?: string;
  scenarioZh?: string;
  scenarioEn?: string;
  pmTipsZh?: string;
  pmTipsEn?: string;
  prosZh?: string;
  prosEn?: string;
  consZh?: string;
  consEn?: string;
  boundaryZh?: string;
  boundaryEn?: string;
  userCount: number;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Video {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  category: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImageItem {
  id: string;
  titleZh: string;
  titleEn: string;
  url: string;
  descriptionZh: string;
  descriptionEn: string;
  githubFilename: string;
  githubUrl: string;
  sourceType: "manual" | "article" | "upload";
  sourceId: string;
  published: boolean;
  createdAt: string;
}

export interface Note {
  id: string;
  type: "book" | "log";
  titleZh: string;
  titleEn: string;
  sourceZh: string;
  sourceEn: string;
  coverImage: string;
  rating: number;
  tags: string[];
  summaryZh: string;
  summaryEn: string;
  contentZh: string;
  contentEn: string;
  takeawayZh: string;
  takeawayEn: string;
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Slide {
  id: string;
  titleZh: string;
  titleEn: string;
  descriptionZh: string;
  descriptionEn: string;
  coverImage: string;
  topic: string;
  slidesCount: number;
  viewUrl: string;
  downloadUrl: string;
  tags: string[];
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FriendLink {
  id: string;
  nameZh: string;
  nameEn: string;
  url: string;
  descriptionZh: string;
  descriptionEn: string;
  logo: string;
  category: string;
  order: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QA {
  id: string;
  questionZh: string;
  questionEn: string;
  askerName: string;
  answerZh: string;
  answerEn: string;
  status: "pending" | "answered";
  tags: string[];
  published: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LabTemplate {
  id: string;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  template: string;
  variables: string;
  category: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  phone: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettings {
  siteName: string;
  siteNameEn: string;
  logo: string;
  descriptionZh: string;
  descriptionEn: string;
  email: string;
  website: string;
  wechat: string;
  twitter: string;
  github: string;
  githubToken: string;
  githubRepo: string;
  githubBranch: string;
  githubImagePath: string;
}

export interface AdminUser {
  username: string;
  passwordHash: string;
  role: "admin";
  createdAt: string;
}

type StoreKey = "articles" | "products" | "agents" | "videos" | "images" | "portfolio" | "notes" | "slides" | "links" | "qa" | "labs" | "messages" | "settings";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateArticleNo(): string {
  const items = getStore<Article>("articles");
  let maxNum = 0;
  for (const item of items) {
    const match = item.articleNo?.match(/^ART-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `ART-${String(maxNum + 1).padStart(3, "0")}`;
}

function migrateArticleNos(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("aipmbull_article_no_migrated_v2")) return;
  const items = getStore<Article>("articles");
  if (items.length === 0) {
    localStorage.setItem("aipmbull_article_no_migrated_v2", "true");
    return;
  }
  const sorted = [...items].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  for (let i = 0; i < sorted.length; i++) {
    sorted[i].articleNo = `ART-${String(i + 1).padStart(3, "0")}`;
  }
  setStore("articles", sorted);
  localStorage.setItem("aipmbull_article_no_migrated_v2", "true");
}

function getStore<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(`aipmbull_${key}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function migratePortfolio(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("aipmbull_portfolio_seeded_v1")) return;
  const existing = getStore<PortfolioProject>("portfolio");
  if (existing.length === 0) {
    const now = new Date().toISOString();
    const seed: PortfolioProject[] = [
      {
        id: generateId(), titleZh: "企业级 RAG 知识库问答系统", titleEn: "Enterprise RAG Knowledge Base Q&A",
        summaryZh: "面向内部客服与知识管理场景，搭建基于检索增强生成的问答系统，将文档命中率与答复准确率显著提升。", summaryEn: "A retrieval-augmented generation Q&A system for internal support and knowledge management, markedly improving document hit-rate and answer accuracy.",
        roleZh: "AI 产品经理 · 负责需求定义、检索策略与效果评估", roleEn: "AI Product Manager · requirements, retrieval strategy & evaluation",
        coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800",
        tags: ["RAG", "知识库", "向量检索"], category: "rag",
        detailZh: "从 0 到 1 主导企业知识库问答产品：拆解客服真实问题分布，设计文档切分与向量召回策略，制定检索命中、答案忠实度的评估指标体系，推动多轮迭代上线。", detailEn: "Led an enterprise knowledge-base Q&A product from 0 to 1: analyzed real support question distribution, designed chunking and vector recall strategy, defined hit-rate and faithfulness metrics, and drove multiple iterations to launch.",
        published: true, featured: true, createdAt: now, updatedAt: now,
      },
      {
        id: generateId(), titleZh: "多轮对话 Agent 智能助手", titleEn: "Multi-turn Conversational Agent Assistant",
        summaryZh: "设计具备工具调用与任务编排能力的 Agent 助手，覆盖查询、下单、售后等高频场景，降低人工介入率。", summaryEn: "Designed an agent assistant with tool-calling and task orchestration, covering high-frequency scenarios like search, ordering and after-sales to reduce manual handoff.",
        roleZh: "AI 产品经理 · 负责 Agent 能力边界、工具编排与对话体验", roleEn: "AI Product Manager · agent capability boundaries, tool orchestration & conversation UX",
        coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
        tags: ["Agent", "工具调用", "对话编排"], category: "agent",
        detailZh: "定义 Agent 的工具集合与调用时机，设计任务规划与失败回退机制，围绕多轮对话上下文管理打磨体验，形成可复用的 Agent 产品设计范式。", detailEn: "Defined the agent's toolset and invocation timing, designed task planning and fallback, refined multi-turn context management, and formed a reusable agent product design paradigm.",
        published: true, featured: true, createdAt: now, updatedAt: now,
      },
      {
        id: generateId(), titleZh: "AI 内容生成与运营平台", titleEn: "AI Content Generation & Operations Platform",
        summaryZh: "面向新媒体运营团队，构建从选题、生成到多平台分发的一体化内容工作流，大幅提升内容产出效率。", summaryEn: "For new-media ops teams, built an integrated workflow from topic selection and generation to multi-platform distribution, greatly boosting content throughput.",
        roleZh: "AI 产品经理 · 负责内容工作流、生成质量控制与数据闭环", roleEn: "AI Product Manager · content workflow, generation quality control & data loop",
        coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
        tags: ["内容生成", "AIGC", "运营提效"], category: "content",
        detailZh: "梳理内容生产全流程，设计模板化生成与人工审校结合的机制，建立选题—生成—发布—回流数据的闭环，量化各内容渠道的表现并反哺策略。", detailEn: "Mapped the full content pipeline, designed template-based generation with human review, built a topic-generate-publish-feedback data loop, and quantified channel performance to inform strategy.",
        published: true, featured: true, createdAt: now, updatedAt: now,
      },
    ];
    setStore("portfolio", seed);
  }
  localStorage.setItem("aipmbull_portfolio_seeded_v1", "true");
}

function migrateP3Content(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("aipmbull_p3_seeded_v1")) return;
  const now = new Date().toISOString();

  if (getStore<LabTemplate>("labs").length === 0) {
    const labs: LabTemplate[] = [
      {
        id: generateId(), nameZh: "RAG 答案生成", nameEn: "RAG Answer Generation",
        descriptionZh: "基于检索到的上下文回答用户问题，强制无依据则拒答。", descriptionEn: "Answer using retrieved context; refuse when unsupported.",
        template: "你是严谨的知识库助手。仅依据下列上下文回答问题，若上下文不足以回答，请回复「根据现有资料无法回答」，不要编造。\n\n【上下文】\n{{context}}\n\n【问题】\n{{question}}\n\n请给出答案，并在句末标注引用的上下文编号。",
        variables: "context, question", category: "rag", published: true, createdAt: now, updatedAt: now,
      },
      {
        id: generateId(), nameZh: "需求拆解", nameEn: "Requirement Breakdown",
        descriptionZh: "把模糊需求拆解为可交付子需求与验收标准。", descriptionEn: "Break a vague requirement into deliverable sub-items with acceptance criteria.",
        template: "你是资深 AI 产品经理。请把下面的需求拆解为可交付的子需求，并为每条给出验收标准与优先级。\n\n【目标用户】{{user_role}}\n【原始需求】{{feature}}\n\n输出格式：\n1. 子需求 | 验收标准 | 优先级(P0/P1/P2)",
        variables: "user_role, feature", category: "prd", published: true, createdAt: now, updatedAt: now,
      },
      {
        id: generateId(), nameZh: "模型回答质量打分", nameEn: "Response Quality Scoring",
        descriptionZh: "按准确性/完整性/相关性/安全性对模型回答打分并说明理由。", descriptionEn: "Score a model response on accuracy/completeness/relevance/safety with rationale.",
        template: "你是模型评测专家。请依据评分标准，对给定回答在「准确性、完整性、相关性、安全性」四个维度各打 1-5 分，并简述理由与改进建议。\n\n【指令】{{instruction}}\n【模型回答】{{response}}\n【评分标准】{{criteria}}",
        variables: "instruction, response, criteria", category: "eval", published: true, createdAt: now, updatedAt: now,
      },
    ];
    setStore("labs", labs);
  }

  if (getStore<Note>("notes").length === 0) {
    const notes: Note[] = [
      {
        id: generateId(), type: "book", titleZh: "《大模型应用开发极简入门》读书笔记", titleEn: "Notes: LLM App Development Starter",
        sourceZh: "书籍 · 大模型应用开发", sourceEn: "Book · LLM App Development",
        coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800", rating: 4,
        tags: ["大模型", "读书笔记", "应用开发"],
        summaryZh: "梳理大模型应用开发的核心链路：Prompt 工程、向量检索、LangChain 编排与上线评估，适合建立全局认知。", summaryEn: "Maps the core LLM app pipeline: prompt engineering, vector retrieval, LangChain orchestration and evaluation.",
        contentZh: "一、Prompt 工程：结构化指令 + Few-shot + 思维链，控制输出稳定性。\n二、向量检索：文本切分策略决定召回质量，chunk 大小需按语义边界而非固定长度。\n三、编排框架：LangChain 适合快速原型，生产环境需关注可观测性与失败兜底。\n四、评估：离线用标注集跑指标，线上用真实反馈闭环。", contentEn: "1. Prompt engineering: structured instructions + few-shot + CoT for stable output.\n2. Retrieval: chunking strategy drives recall quality — chunk on semantic boundaries, not fixed length.\n3. Orchestration: LangChain for rapid prototyping; watch observability and fallback in production.\n4. Evaluation: offline metrics on labeled sets, online feedback loop.",
        takeawayZh: "对 PM 的最大启发：大模型应用的护城河不在模型，而在「数据切分 + 检索质量 + 评估闭环」。", takeawayEn: "Key takeaway for PMs: the moat isn't the model but data chunking, retrieval quality and the evaluation loop.",
        published: true, featured: true, createdAt: "2026-09-10T00:00:00Z", updatedAt: "2026-09-10T00:00:00Z",
      },
      {
        id: generateId(), type: "book", titleZh: "论文精读：Retrieval-Augmented Generation", titleEn: "Paper Notes: Retrieval-Augmented Generation",
        sourceZh: "论文 · RAG (Lewis et al., 2020)", sourceEn: "Paper · RAG (Lewis et al., 2020)",
        coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800", rating: 5,
        tags: ["RAG", "论文", "向量检索"],
        summaryZh: "RAG 原始论文精读：把参数化记忆（seq2seq）与非参数化记忆（向量检索）结合，缓解知识密集型任务幻觉。", summaryEn: "Notes on the original RAG paper: combining parametric (seq2seq) and non-parametric (retrieval) memory to reduce hallucination.",
        contentZh: "核心思想：生成前先检索 Top-K 相关文档，将其作为条件输入生成模型。\n关键结论：RAG 在开放域问答上超过纯参数模型，且知识更新只需替换索引，无需重新训练。\n局限：检索质量是天花板；多跳推理与长文档聚合仍是难点。", contentEn: "Core idea: retrieve Top-K relevant docs before generation and condition the generator on them.\nFindings: RAG beats parametric-only models on open-domain QA; knowledge updates only need re-indexing.\nLimits: retrieval quality is the ceiling; multi-hop reasoning and long-doc aggregation remain hard.",
        takeawayZh: "产品视角：RAG 把「知识更新」从训练问题变成索引问题，这是它能落地的根本原因。", takeawayEn: "Product view: RAG turns knowledge updates from a training problem into an indexing problem — the root reason it ships.",
        published: true, featured: true, createdAt: "2026-09-12T00:00:00Z", updatedAt: "2026-09-12T00:00:00Z",
      },
      {
        id: generateId(), type: "log", titleZh: "学习日志｜向量数据库选型对比", titleEn: "Learning Log: Vector DB Comparison",
        sourceZh: "学习日志 · 2026-09", sourceEn: "Learning Log · Sep 2026",
        coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800", rating: 0,
        tags: ["向量库", "选型", "学习日志"],
        summaryZh: "对比 Milvus、Pinecone、Weaviate、pgvector 在规模、成本、运维与生态上的差异，形成选型决策表。", summaryEn: "Comparing Milvus, Pinecone, Weaviate and pgvector on scale, cost, ops and ecosystem into a decision table.",
        contentZh: "Milvus：开源、可扩展、功能全，但运维重。\nPinecone：全托管、上手快，成本随规模上升、数据出境需评估。\nWeaviate：带混合检索与模块化，社区活跃。\npgvector：与现有 Postgres 一体，中小规模最省心。", contentEn: "Milvus: open-source, scalable, feature-rich but ops-heavy.\nPinecone: fully managed, fast start; cost grows with scale, data-residency review needed.\nWeaviate: hybrid search + modular, active community.\npgvector: fits existing Postgres, easiest for small-mid scale.",
        takeawayZh: "选型结论：数据量 < 千万级且已有 Postgres，优先 pgvector；需要极致召回与规模再上 Milvus/托管方案。", takeawayEn: "Conclusion: under ~10M vectors with existing Postgres, prefer pgvector; go Milvus/managed for extreme recall and scale.",
        published: true, featured: false, createdAt: "2026-09-15T00:00:00Z", updatedAt: "2026-09-15T00:00:00Z",
      },
    ];
    setStore("notes", notes);
  }

  if (getStore<Slide>("slides").length === 0) {
    const slides: Slide[] = [
      {
        id: generateId(), titleZh: "AI 产品经理入门分享", titleEn: "Intro to AI Product Management",
        descriptionZh: "面向转行者的 AI PM 能力模型、工作流与成长路径分享。", descriptionEn: "AI-PM competency model, workflow and growth path for career switchers.",
        coverImage: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800", topic: "career", slidesCount: 24,
        viewUrl: "", downloadUrl: "", tags: ["AI PM", "入门", "分享"],
        published: true, featured: true, createdAt: "2026-09-05T00:00:00Z", updatedAt: "2026-09-05T00:00:00Z",
      },
      {
        id: generateId(), titleZh: "RAG 系统设计实践", titleEn: "RAG System Design in Practice",
        descriptionZh: "从召回、精排到拒答策略的 RAG 系统设计要点与踩坑复盘。", descriptionEn: "RAG design essentials from recall and rerank to refusal policy, with pitfalls.",
        coverImage: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800", topic: "rag", slidesCount: 18,
        viewUrl: "", downloadUrl: "", tags: ["RAG", "系统设计"],
        published: true, featured: true, createdAt: "2026-09-08T00:00:00Z", updatedAt: "2026-09-08T00:00:00Z",
      },
      {
        id: generateId(), titleZh: "大模型评测方法论", titleEn: "LLM Evaluation Methodology",
        descriptionZh: "如何为 AI 功能建立可量化的评估指标体系与自动化评测流程。", descriptionEn: "Building quantifiable metrics and an automated eval pipeline for AI features.",
        coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800", topic: "eval", slidesCount: 16,
        viewUrl: "", downloadUrl: "", tags: ["模型评测", "方法论"],
        published: true, featured: false, createdAt: "2026-09-11T00:00:00Z", updatedAt: "2026-09-11T00:00:00Z",
      },
    ];
    setStore("slides", slides);
  }

  if (getStore<FriendLink>("links").length === 0) {
    const links: FriendLink[] = [
      { id: generateId(), nameZh: "人人都是产品经理", nameEn: "Woshipm", url: "https://www.woshipm.com", descriptionZh: "产品经理社区，需求/运营/设计干货聚集地。", descriptionEn: "PM community with product, ops and design resources.", logo: "", category: "community", order: 1, published: true, createdAt: now, updatedAt: now },
      { id: generateId(), nameZh: "Hugging Face", nameEn: "Hugging Face", url: "https://huggingface.co", descriptionZh: "开源模型与数据集平台，AI 产品选型必看。", descriptionEn: "Open-source models & datasets hub — essential for AI product sourcing.", logo: "", category: "tool", order: 2, published: true, createdAt: now, updatedAt: now },
      { id: generateId(), nameZh: "少数派", nameEn: "SSPAI", url: "https://sspai.com", descriptionZh: "高质量数字生活与效率工具内容社区。", descriptionEn: "High-quality digital-life and productivity content community.", logo: "", category: "blog", order: 3, published: true, createdAt: now, updatedAt: now },
    ];
    setStore("links", links);
  }

  if (getStore<QA>("qa").length === 0) {
    const qa: QA[] = [
      {
        id: generateId(), questionZh: "转行 AI 产品经理需要准备什么？", questionEn: "What should I prepare to switch into AI PM?",
        askerName: "读者 A", answerZh: "三件事：① 建立大模型能力边界的体感（多动手用 Prompt/RAG 跑通 demo）；② 补齐评估思维（任何 AI 功能都要能定义「好」的量化标准）；③ 做一个能讲的作品集案例，突出技术选型与权衡，而非只写文档。", answerEn: "Three things: (1) build intuition for LLM capability boundaries by running prompt/RAG demos; (2) develop an evaluation mindset — define quantifiable 'good' for any AI feature; (3) ship a portfolio case that highlights tech selection and trade-offs, not just docs.",
        status: "answered", tags: ["求职", "转行"], published: true, featured: true, createdAt: "2026-09-14T00:00:00Z", updatedAt: "2026-09-14T00:00:00Z",
      },
      {
        id: generateId(), questionZh: "RAG 和微调（Fine-tuning）该怎么选？", questionEn: "How to choose between RAG and fine-tuning?",
        askerName: "读者 B", answerZh: "看知识是否频繁更新与是否需要溯源：知识频繁变化、需要引用出处 → 选 RAG；要固化风格/格式/领域语感、且知识相对稳定 → 考虑微调。多数企业知识问答场景 RAG 性价比更高，两者也可组合（微调打底 + RAG 补时效）。", answerEn: "Depends on update frequency and traceability: frequently-changing knowledge needing citations → RAG; fixing style/format/domain feel with stable knowledge → fine-tuning. For most enterprise QA, RAG is more cost-effective; they can also be combined.",
        status: "answered", tags: ["RAG", "微调", "选型"], published: true, featured: true, createdAt: "2026-09-16T00:00:00Z", updatedAt: "2026-09-16T00:00:00Z",
      },
      {
        id: generateId(), questionZh: "没有技术背景能做 AI 产品经理吗？", questionEn: "Can I be an AI PM without a technical background?",
        askerName: "读者 C", answerZh: "可以，但要补「技术判断力」而非写代码能力：理解模型能做什么/不能做什么、成本与延迟的量级、评估指标怎么定。你不需要自己训模型，但要能和工程师就方案可行性与边界对话。", answerEn: "Yes — but build technical judgment, not coding skill: understand what models can/can't do, the order of magnitude of cost and latency, and how to set metrics. You won't train models, but you must discuss feasibility and boundaries with engineers.",
        status: "answered", tags: ["求职", "AI PM"], published: true, featured: false, createdAt: "2026-09-18T00:00:00Z", updatedAt: "2026-09-18T00:00:00Z",
      },
    ];
    setStore("qa", qa);
  }

  localStorage.setItem("aipmbull_p3_seeded_v1", "true");
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`aipmbull_${key}`, JSON.stringify(data));
}

const CATEGORY_TO_WORKFLOW: Record<string, string> = {
  product: "prototype",
  design: "prototype",
  document: "doc",
  analysis: "eval",
  other: "prompt",
};

function migrateAgentWorkflow(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("aipmbull_agent_workflow_v1")) return;
  const agents = getStore<Agent>("agents");
  if (agents.length > 0) {
    let changed = false;
    for (const a of agents) {
      if (!a.workflow) {
        a.workflow = CATEGORY_TO_WORKFLOW[a.category] || "other";
        changed = true;
      }
    }
    if (changed) setStore("agents", agents);
  }
  localStorage.setItem("aipmbull_agent_workflow_v1", "true");
}

function migrateImageItemFields(): void {
  if (typeof window === "undefined") return;
  if (localStorage.getItem("aipmbull_image_fields_v1")) return;
  const items = getStore<ImageItem>("images");
  if (items.length > 0) {
    for (const item of items) {
      if (!item.githubFilename) item.githubFilename = "";
      if (!item.githubUrl) item.githubUrl = "";
      if (!item.sourceType) item.sourceType = "manual";
      if (!item.sourceId) item.sourceId = "";
    }
    setStore("images", items);
  }
  localStorage.setItem("aipmbull_image_fields_v1", "true");
}

function getSettingsStore(): SiteSettings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const data = localStorage.getItem("aipmbull_settings");
    if (!data) return defaultSettings();
    const parsed = JSON.parse(data);
    return { ...defaultSettings(), ...parsed };
  } catch {
    return defaultSettings();
  }
}

function defaultSettings(): SiteSettings {
  return {
    siteName: "AI PM Bull",
    siteNameEn: "AI PM Bull",
    logo: "AI",
    descriptionZh: "AI产品经理的学习平台，探索AI产品设计与实践",
    descriptionEn: "Learning platform for AI Product Managers",
    email: "contact@aipmbull.com",
    website: "aipmbull.com",
    wechat: "",
    twitter: "",
    github: "",
    githubToken: "",
    githubRepo: "Hale-Song/AIpmbull",
    githubBranch: "main",
    githubImagePath: "public/assets/images",
  };
}

export const store = {
  list<T>(key: StoreKey): T[] {
    if (key === "settings") return [getSettingsStore()] as unknown as T[];
    return getStore<T>(key);
  },

  getById<T extends { id: string }>(key: StoreKey, id: string): T | undefined {
    if (key === "settings") return getSettingsStore() as unknown as T;
    const items = getStore<T>(key);
    return items.find((item) => item.id === id);
  },

  create<T extends { id?: string; createdAt?: string; updatedAt?: string }>(key: StoreKey, data: Omit<T, "id" | "createdAt" | "updatedAt">): T {
    const id = generateId();
    const now = new Date().toISOString();
    const item = { ...data, id, createdAt: now, updatedAt: now } as T;

    if (key === "settings") {
      localStorage.setItem("aipmbull_settings", JSON.stringify(data));
      return item;
    }

    if (key === "articles") {
      (item as unknown as Article).articleNo = generateArticleNo();
    }

    const items = getStore<T & { id: string }>(key);
    items.unshift(item as T & { id: string });
    setStore(key, items);
    return item;
  },

  update<T extends { id: string }>(key: StoreKey, id: string, data: Partial<T>): T | undefined {
    if (key === "settings") {
      const current = getSettingsStore();
      const updated = { ...current, ...data };
      localStorage.setItem("aipmbull_settings", JSON.stringify(updated));
      return updated as unknown as T;
    }

    const items = getStore<T>(key);
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    setStore(key, items);
    return items[index];
  },

  delete(key: StoreKey, id: string): boolean {
    if (key === "settings") return false;
    const items = getStore<{ id: string }>(key);
    const filtered = items.filter((item) => item.id !== id);
    if (filtered.length === items.length) return false;
    setStore(key, filtered);
    return true;
  },

  count(key: StoreKey): number {
    if (key === "settings") return 1;
    return getStore(key).length;
  },
};

export function seedDemoData(): void {
  if (typeof window === "undefined") return;
  migrateArticleNos();
  migratePortfolio();
  migrateP3Content();
  migrateAgentWorkflow();
  migrateImageItemFields();
  if (localStorage.getItem("aipmbull_seeded")) return;

  const demoArticles: Article[] = [
    {
      id: generateId(), articleNo: "ART-001", titleZh: "AI 产品经理必备技能", titleEn: "Essential Skills for AI PMs",
      summaryZh: "成为优秀 AI 产品经理需要掌握的核心技能", summaryEn: "Core skills needed to excel as an AI product manager",
      contentZh: "", contentEn: "", coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600",
      category: "industryInsights", tags: ["AI PM", "Skills"], published: true, featured: false,
      createdAt: "2024-08-25T00:00:00Z", updatedAt: "2024-08-25T00:00:00Z",
    },
    {
      id: generateId(), articleNo: "ART-002", titleZh: "Midjourney vs DALL-E 对比", titleEn: "Midjourney vs DALL-E Comparison",
      summaryZh: "两大 AI 绘画工具的全面对比分析", summaryEn: "Full comparison of two major AI image generation tools",
      contentZh: "", contentEn: "", coverImage: "https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=600",
      category: "productComparison", tags: ["Midjourney", "DALL-E"], published: true, featured: true,
      createdAt: "2024-08-28T00:00:00Z", updatedAt: "2024-08-28T00:00:00Z",
    },
    {
      id: generateId(), articleNo: "ART-003", titleZh: "ChatGPT 产品深度评测", titleEn: "ChatGPT In-Depth Review",
      summaryZh: "全面解析 ChatGPT 的产品能力、局限性与应用场景", summaryEn: "Comprehensive analysis of ChatGPT capabilities and limitations",
      contentZh: "", contentEn: "", coverImage: "https://images.unsplash.com/photo-1677442136019-21780ec5995?w=600",
      category: "productReview", tags: ["ChatGPT", "LLM"], published: true, featured: true,
      createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z",
    },
  ];

  const demoProducts: Product[] = [
    { id: generateId(), nameZh: "ChatGPT", nameEn: "ChatGPT", descriptionZh: "OpenAI 开发的智能对话助手", descriptionEn: "AI conversational assistant by OpenAI", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400", websiteUrl: "https://chat.openai.com", category: "llm", rating: 4.8, pmScenarioZh: "通用问答、文案生成、代码辅助，适合快速搭建对话式功能原型", pmScenarioEn: "General Q&A, copywriting, code assist — good for rapid conversational prototypes", pmProsZh: "生态成熟、多模态能力强、API 稳定", pmProsEn: "Mature ecosystem, strong multimodal ability, stable API", pmConsZh: "长上下文成本高、幻觉需二次校验", pmConsEn: "High cost on long context; hallucinations need verification", pmTakeawayZh: "对话式产品的基线选型，可作为 RAG 的生成层", pmTakeawayEn: "Baseline choice for conversational products; works as the generation layer in RAG", published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
    { id: generateId(), nameZh: "Midjourney", nameEn: "Midjourney", descriptionZh: "领先的 AI 图像生成工具", descriptionEn: "Leading AI image generation tool", imageUrl: "https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=400", websiteUrl: "https://midjourney.com", category: "painting", rating: 4.7, pmScenarioZh: "营销视觉、概念图、封面设计等高质量图像产出", pmScenarioEn: "Marketing visuals, concept art, covers — high-quality image output", pmProsZh: "出图审美高、社区 prompt 生态活跃", pmProsEn: "High aesthetic quality; active community prompt ecosystem", pmConsZh: "缺乏开放 API、精细控制弱", pmConsEn: "No open API; weak fine-grained control", pmTakeawayZh: "适合内容运营侧提效，工程集成需绕道第三方", pmTakeawayEn: "Great for content ops; engineering integration needs third-party workarounds", published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
    { id: generateId(), nameZh: "Cursor", nameEn: "Cursor", descriptionZh: "AI 驱动的智能代码编辑器", descriptionEn: "AI-powered intelligent code editor", imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400", websiteUrl: "https://cursor.sh", category: "coding", rating: 4.9, pmScenarioZh: "研发提效、代码补全与重构，PM 可用其快速验证技术方案", pmScenarioEn: "Dev productivity, code completion & refactor; PMs can prototype technical ideas", pmProsZh: "深度代码库理解、交互体验优秀", pmProsEn: "Deep codebase understanding; excellent UX", pmConsZh: "订阅成本较高、企业合规需评估", pmConsEn: "Higher subscription cost; enterprise compliance needs review", pmTakeawayZh: "AI 编码工具的交互范式标杆，值得借鉴其上下文设计", pmTakeawayEn: "Interaction-paradigm benchmark for AI coding tools; worth studying its context design", published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
  ];

  const demoPortfolio: PortfolioProject[] = [
    {
      id: generateId(), titleZh: "企业级 RAG 知识库问答系统", titleEn: "Enterprise RAG Knowledge Base Q&A",
      summaryZh: "面向内部客服与知识管理场景，搭建基于检索增强生成的问答系统，将文档命中率与答复准确率显著提升。", summaryEn: "A retrieval-augmented generation Q&A system for internal support and knowledge management, markedly improving document hit-rate and answer accuracy.",
      roleZh: "AI 产品经理 · 负责需求定义、检索策略与效果评估", roleEn: "AI Product Manager · requirements, retrieval strategy & evaluation",
      coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800",
      tags: ["RAG", "知识库", "向量检索"], category: "rag",
      detailZh: "从 0 到 1 主导企业知识库问答产品：拆解客服真实问题分布，设计文档切分与向量召回策略，制定检索命中、答案忠实度的评估指标体系，推动多轮迭代上线。", detailEn: "Led an enterprise knowledge-base Q&A product from 0 to 1: analyzed real support question distribution, designed chunking and vector recall strategy, defined hit-rate and faithfulness metrics, and drove multiple iterations to launch.",
      backgroundZh: "公司内部文档散落在 Wiki、PDF、工单系统，客服新人查资料平均耗时 8 分钟/次，知识复用率低。目标是做一个能「问答即得」的内部知识助手，覆盖 80% 高频客服问题。", backgroundEn: "Internal docs were scattered across Wiki, PDFs and ticketing systems; new support agents spent ~8 min per lookup. Goal: an internal Q&A assistant answering 80% of high-frequency support questions instantly.",
      painZh: "1. 文档格式异构、表格与截图多，直接切分语义断裂；\n2. 用户问法口语化，与文档书面语差异大，向量召回 Top-K 命中低；\n3. 大模型幻觉：无依据也会编造答案，客服场景不可接受。", painEn: "1. Heterogeneous docs with many tables/screenshots — naive chunking breaks semantics;\n2. Colloquial queries diverge from formal doc wording, lowering Top-K recall;\n3. LLM hallucination — fabricating answers is unacceptable in support.",
      selectionZh: "对比了纯向量检索、BM25、以及向量+关键词混合召回。最终选型：混合召回（向量 + BM25）+ Rerank 精排 + 引用溯源。生成层选用可控温度的对话模型，强制「无依据则拒答并转人工」。权衡点：混合召回索引成本更高，但命中率提升明显，值得。", selectionEn: "Compared pure vector search, BM25, and hybrid recall. Final choice: hybrid (vector + BM25) + rerank + citation grounding. Generation used a temperature-controlled chat model forced to refuse-and-escalate when unsupported. Trade-off: hybrid indexing costs more, but the recall gain justified it.",
      flowZh: "问题理解（改写/扩展）→ 混合召回 Top-50 → Rerank 取 Top-5 → 组装带引用的 Prompt → 生成答案 + 出处 → 置信度低于阈值则转人工。原型阶段用 30 条真实问题跑通全链路，再逐步扩量。", flowEn: "Query understanding (rewrite/expand) → hybrid recall Top-50 → rerank to Top-5 → citation-aware prompt → answer + sources → escalate to human if confidence below threshold. Prototyped on 30 real questions end-to-end before scaling.",
      metricsZh: "文档命中率 Recall@5：62% → 89%\n答案忠实度（人工抽检）：71% → 95%\n平均查资料耗时：8 分钟 → 40 秒\n高频问题自助解决率：0 → 78%", metricsEn: "Recall@5: 62% → 89%\nFaithfulness (manual audit): 71% → 95%\nAvg lookup time: 8 min → 40 s\nHigh-freq self-serve resolution: 0 → 78%",
      badcaseZh: "① 跨文档聚合类问题（「A 和 B 政策有何不同」）召回不全，答非所问 → 增加多路召回与问题拆解；\n② 含最新时效的问题命中过期文档 → 引入文档版本与时间过滤；\n③ 表格内数值问答错位 → 表格单独结构化入库。", badcaseEn: "(1) Cross-doc aggregation questions recalled incompletely → added multi-route recall + query decomposition; (2) time-sensitive questions hit stale docs → added versioning & time filters; (3) table-value answers misaligned → stored tables as structured records.",
      retroZh: "最大收获：RAG 产品的核心不在模型，而在「检索质量 + 拒答策略」。评估指标体系要在立项时就定义，否则迭代无方向。若重来，会更早引入真实客服标注数据，而非依赖合成问题。", retroEn: "Key lesson: a RAG product hinges on retrieval quality + refusal policy, not the model. Define the metric system at kickoff or iterations lose direction. In hindsight, involve real agent-annotated data earlier instead of synthetic queries.",
      published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z",
    },
    {
      id: generateId(), titleZh: "多轮对话 Agent 智能助手", titleEn: "Multi-turn Conversational Agent Assistant",
      summaryZh: "设计具备工具调用与任务编排能力的 Agent 助手，覆盖查询、下单、售后等高频场景，降低人工介入率。", summaryEn: "Designed an agent assistant with tool-calling and task orchestration, covering high-frequency scenarios like search, ordering and after-sales to reduce manual handoff.",
      roleZh: "AI 产品经理 · 负责 Agent 能力边界、工具编排与对话体验", roleEn: "AI Product Manager · agent capability boundaries, tool orchestration & conversation UX",
      coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
      tags: ["Agent", "工具调用", "对话编排"], category: "agent",
      detailZh: "定义 Agent 的工具集合与调用时机，设计任务规划与失败回退机制，围绕多轮对话上下文管理打磨体验，形成可复用的 Agent 产品设计范式。", detailEn: "Defined the agent's toolset and invocation timing, designed task planning and fallback, refined multi-turn context management, and formed a reusable agent product design paradigm.",
      backgroundZh: "电商场景下用户咨询高度重复（物流查询、退换货、改地址），人工客服成本高、夜间无覆盖。需要一个能自主完成多步任务的 Agent，而非只会闲聊的机器人。", backgroundEn: "In e-commerce, user inquiries are highly repetitive (order tracking, returns, address changes); human support is costly with no night coverage. We needed an agent that autonomously completes multi-step tasks, not just small talk.",
      painZh: "1. 工具调用时机判断难，模型常过早/过晚调用或选错工具；\n2. 多轮上下文膨胀导致意图漂移、token 成本上升；\n3. 失败无兜底，一旦工具报错对话就卡死，用户体验差。", painEn: "1. Hard to judge when to call tools — the model calls too early/late or picks the wrong one;\n2. growing multi-turn context causes intent drift and rising token cost;\n3. no fallback — a tool error stalls the conversation.",
      selectionZh: "对比 ReAct、Plan-and-Execute、以及状态机编排。选型：轻量 Plan-and-Execute + 显式状态机兜底。工具层用 JSON Schema 约束参数，关键操作（下单/退款）加二次确认。权衡：状态机牺牲部分灵活性，换取可控性与可观测性。", selectionEn: "Compared ReAct, Plan-and-Execute, and state-machine orchestration. Chose lightweight Plan-and-Execute + an explicit state machine as fallback. Tools constrained by JSON Schema; critical actions (order/refund) require confirmation. Trade-off: the state machine sacrifices some flexibility for controllability and observability.",
      flowZh: "意图识别 → 任务规划（拆解子步骤）→ 工具调用（带参数校验）→ 结果观察 → 判断是否完成/需澄清/需转人工 → 回复。每步埋点，失败三次自动降级到人工并带上完整上下文。", flowEn: "Intent recognition → task planning (sub-steps) → tool call (with param validation) → observe result → decide done / clarify / escalate → reply. Each step instrumented; after 3 failures it degrades to a human with full context.",
      metricsZh: "任务自主完成率：0 → 71%\n人工介入率：100% → 29%\n平均对话轮次（完成一个任务）：6.2 → 3.8\n工具调用准确率：78% → 94%", metricsEn: "Autonomous task completion: 0 → 71%\nHuman handoff rate: 100% → 29%\nAvg turns per completed task: 6.2 → 3.8\nTool-call accuracy: 78% → 94%",
      badcaseZh: "① 用户一句话含多个意图（「查物流顺便改地址」）时只处理第一个 → 增加意图多路解析；\n② 长对话后忘记早期约束（如已说明的订单号）→ 引入结构化记忆槽位；\n③ 工具超时被当成失败反复重试 → 区分超时与业务失败。", badcaseEn: "(1) multi-intent utterances only handled the first → added multi-intent parsing; (2) forgot early constraints (e.g. order id) in long chats → introduced structured memory slots; (3) tool timeouts treated as failures and retried → separated timeout from business failure.",
      retroZh: "Agent 产品的关键不是「更聪明」，而是「更可控」：清晰的工具边界、显式的失败兜底、关键操作的人工确认，比堆模型能力更能提升可用性。可观测性（每步埋点）是持续迭代的前提。", retroEn: "The key to an agent product is controllability, not cleverness: clear tool boundaries, explicit fallbacks, and human confirmation on critical actions matter more than raw model power. Observability (per-step instrumentation) is the precondition for iteration.",
      published: true, featured: true, createdAt: "2024-09-02T00:00:00Z", updatedAt: "2024-09-02T00:00:00Z",
    },
    {
      id: generateId(), titleZh: "AI 内容生成与运营平台", titleEn: "AI Content Generation & Operations Platform",
      summaryZh: "面向新媒体运营团队，构建从选题、生成到多平台分发的一体化内容工作流，大幅提升内容产出效率。", summaryEn: "For new-media ops teams, built an integrated workflow from topic selection and generation to multi-platform distribution, greatly boosting content throughput.",
      roleZh: "AI 产品经理 · 负责内容工作流、生成质量控制与数据闭环", roleEn: "AI Product Manager · content workflow, generation quality control & data loop",
      coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
      tags: ["内容生成", "AIGC", "运营提效"], category: "content",
      detailZh: "梳理内容生产全流程，设计模板化生成与人工审校结合的机制，建立选题—生成—发布—回流数据的闭环，量化各内容渠道的表现并反哺策略。", detailEn: "Mapped the full content pipeline, designed template-based generation with human review, built a topic-generate-publish-feedback data loop, and quantified channel performance to inform strategy.",
      backgroundZh: "新媒体团队每周需产出 30+ 篇多平台内容，人工撰写+排版+分发耗时长、风格不统一。希望用 AI 把重复劳动自动化，让运营聚焦创意与策略。", backgroundEn: "The new-media team needed 30+ multi-platform pieces weekly; manual writing, layout and distribution were slow and inconsistent in style. Goal: automate repetitive work so ops can focus on creativity and strategy.",
      painZh: "1. 纯 AI 生成内容同质化、易踩平台违规词；\n2. 各平台格式/字数/语气差异大，一稿多发效果差；\n3. 缺乏数据回流，无法知道哪类选题真正有效。", painEn: "1. Pure AI output is homogeneous and risks platform-banned words;\n2. platforms differ in format/length/tone, so one-draft-fits-all performs poorly;\n3. no data feedback loop to know which topics actually work.",
      selectionZh: "选型：模板化 Prompt + 品牌语料微调风格 + 人工审校关卡（human-in-the-loop）。分发层做平台适配规则引擎。质量控制引入违规词库 + 查重。权衡：保留人工审校降低效率但守住质量与合规底线。", selectionEn: "Chose templated prompts + brand-corpus style tuning + a human-in-the-loop review gate. Distribution used a platform-adaptation rule engine; QC added a banned-word lexicon + duplication check. Trade-off: keeping human review lowers throughput but protects quality and compliance.",
      flowZh: "选题库（数据驱动）→ 选择模板 → AI 生成初稿 → 人工审校/改写 → 平台适配（格式/字数/话题标签）→ 一键多平台分发 → 数据回流看板 → 反哺选题库。", flowEn: "Data-driven topic library → pick template → AI draft → human review/rewrite → platform adaptation (format/length/hashtags) → one-click multi-platform distribution → feedback dashboard → inform the topic library.",
      metricsZh: "单篇内容生产耗时：3 小时 → 45 分钟\n周产出量：30 篇 → 80 篇\n平台违规/驳回率：12% → 3%\n内容平均互动率：+35%", metricsEn: "Per-piece production time: 3 h → 45 min\nWeekly output: 30 → 80 pieces\nPlatform violation/rejection rate: 12% → 3%\nAvg engagement rate: +35%",
      badcaseZh: "① 热点类选题生成内容滞后于时效 → 接入实时热点源并缩短审校 SLA；\n② 品牌语气偶尔跑偏成「营销腔」→ 补充负样本与语气约束；\n③ 数据回流口径不一致导致选题误判 → 统一各平台指标定义。", badcaseEn: "(1) trending-topic content lagged behind → wired real-time trend sources and shortened review SLA; (2) brand tone sometimes drifted into 'marketing speak' → added negative samples and tone constraints; (3) inconsistent feedback metrics caused bad topic calls → unified metric definitions across platforms.",
      retroZh: "AIGC 落地的价值不在「替代人」，而在「重构工作流」：把人的精力从重复劳动转移到创意与审校。数据闭环是内容产品的护城河——没有回流数据，生成再多也只是产能堆砌。", retroEn: "The value of AIGC isn't replacing people but re-engineering the workflow: shifting human effort from repetitive labor to creativity and review. The data loop is the moat — without feedback, more output is just piled capacity.",
      published: true, featured: true, createdAt: "2024-09-03T00:00:00Z", updatedAt: "2024-09-03T00:00:00Z",
    },
  ];

  const demoAgents: Agent[] = [
    { id: generateId(), nameZh: "AI 产品顾问", nameEn: "AI Product Advisor", descriptionZh: "智能分析产品需求，提供决策建议", descriptionEn: "Intelligent product requirement analysis and decision support", imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400", agentUrl: "#", apiToken: "", projectId: "", category: "product", workflow: "prototype", scenarioZh: "需求评审前的思路梳理、方案可行性初判", scenarioEn: "Idea sorting before review; early feasibility checks", pmTipsZh: "把背景、约束、目标一次性说清，追问「有哪些风险」效果更好", pmTipsEn: "State context, constraints and goals up front; ask 'what are the risks' for better output", prosZh: "结构化输出、可快速产出多方案对比", prosEn: "Structured output; fast multi-option comparison", consZh: "结论需人工校验，易泛泛而谈", consEn: "Needs human validation; can be generic", boundaryZh: "仅辅助决策，不替代真实用户调研", boundaryEn: "Decision aid only; not a substitute for real user research", userCount: 2500, published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
    { id: generateId(), nameZh: "PRD 生成器", nameEn: "PRD Generator", descriptionZh: "自动生成产品需求文档", descriptionEn: "Auto-generate product requirement documents", imageUrl: "https://images.unsplash.com/photo-1531746790095-e5995f614585?w=400", agentUrl: "#", apiToken: "", projectId: "", category: "document", workflow: "doc", scenarioZh: "快速起草 PRD 框架、补齐需求条目", scenarioEn: "Draft PRD skeleton quickly; fill in requirement items", pmTipsZh: "先给一句话需求与目标用户，再让它扩写各章节", pmTipsEn: "Give a one-line requirement and target users first, then expand sections", prosZh: "省去从零搭结构的时间、覆盖常见章节", prosEn: "Saves structuring time; covers common sections", consZh: "细节与边界条件仍需 PM 补全", consEn: "Details and edge cases still need PM input", boundaryZh: "产出为初稿，不可直接作为交付文档", boundaryEn: "Output is a draft, not a final deliverable", userCount: 1800, published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
  ];

  const demoVideos: Video[] = [
    { id: generateId(), titleZh: "AI 产品设计入门", titleEn: "Introduction to AI Product Design", descriptionZh: "从零开始学习 AI 产品设计方法论", descriptionEn: "Learn AI product design methodology from scratch", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400", duration: "15:30", category: "tutorial", published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
  ];

  setStore("articles", demoArticles);
  setStore("products", demoProducts);
  setStore("agents", demoAgents);
  setStore("videos", demoVideos);
  setStore("portfolio", demoPortfolio);
  localStorage.setItem("aipmbull_seeded", "true");
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function initAdminAccount(): void {
  if (typeof window === "undefined") return;
  const existing = localStorage.getItem("aipmbull_admin");
  if (existing) return;

  const admin: AdminUser = {
    username: "admin",
    passwordHash: simpleHash("123456"),
    role: "admin",
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem("aipmbull_admin", JSON.stringify(admin));
}

export function login(username: string, password: string): boolean {
  if (typeof window === "undefined") return false;
  initAdminAccount();

  const adminData = localStorage.getItem("aipmbull_admin");
  if (!adminData) return false;

  const admin = JSON.parse(adminData) as AdminUser;
  if (admin.username === username && admin.passwordHash === simpleHash(password)) {
    localStorage.setItem("aipmbull_session", JSON.stringify({
      username: admin.username,
      role: admin.role,
      loginAt: new Date().toISOString(),
    }));
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("aipmbull_session");
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("aipmbull_session");
}

export function getSession(): { username: string; role: string; loginAt: string } | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("aipmbull_session");
  return data ? JSON.parse(data) : null;
}
