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
  published: boolean;
  createdAt: string;
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
}

export interface AdminUser {
  username: string;
  passwordHash: string;
  role: "admin";
  createdAt: string;
}

type StoreKey = "articles" | "products" | "agents" | "videos" | "images" | "portfolio" | "settings";

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

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`aipmbull_${key}`, JSON.stringify(data));
}

function getSettingsStore(): SiteSettings {
  if (typeof window === "undefined") return defaultSettings();
  try {
    const data = localStorage.getItem("aipmbull_settings");
    return data ? JSON.parse(data) : defaultSettings();
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
      published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z",
    },
    {
      id: generateId(), titleZh: "多轮对话 Agent 智能助手", titleEn: "Multi-turn Conversational Agent Assistant",
      summaryZh: "设计具备工具调用与任务编排能力的 Agent 助手，覆盖查询、下单、售后等高频场景，降低人工介入率。", summaryEn: "Designed an agent assistant with tool-calling and task orchestration, covering high-frequency scenarios like search, ordering and after-sales to reduce manual handoff.",
      roleZh: "AI 产品经理 · 负责 Agent 能力边界、工具编排与对话体验", roleEn: "AI Product Manager · agent capability boundaries, tool orchestration & conversation UX",
      coverImage: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
      tags: ["Agent", "工具调用", "对话编排"], category: "agent",
      detailZh: "定义 Agent 的工具集合与调用时机，设计任务规划与失败回退机制，围绕多轮对话上下文管理打磨体验，形成可复用的 Agent 产品设计范式。", detailEn: "Defined the agent's toolset and invocation timing, designed task planning and fallback, refined multi-turn context management, and formed a reusable agent product design paradigm.",
      published: true, featured: true, createdAt: "2024-09-02T00:00:00Z", updatedAt: "2024-09-02T00:00:00Z",
    },
    {
      id: generateId(), titleZh: "AI 内容生成与运营平台", titleEn: "AI Content Generation & Operations Platform",
      summaryZh: "面向新媒体运营团队，构建从选题、生成到多平台分发的一体化内容工作流，大幅提升内容产出效率。", summaryEn: "For new-media ops teams, built an integrated workflow from topic selection and generation to multi-platform distribution, greatly boosting content throughput.",
      roleZh: "AI 产品经理 · 负责内容工作流、生成质量控制与数据闭环", roleEn: "AI Product Manager · content workflow, generation quality control & data loop",
      coverImage: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
      tags: ["内容生成", "AIGC", "运营提效"], category: "content",
      detailZh: "梳理内容生产全流程，设计模板化生成与人工审校结合的机制，建立选题—生成—发布—回流数据的闭环，量化各内容渠道的表现并反哺策略。", detailEn: "Mapped the full content pipeline, designed template-based generation with human review, built a topic-generate-publish-feedback data loop, and quantified channel performance to inform strategy.",
      published: true, featured: true, createdAt: "2024-09-03T00:00:00Z", updatedAt: "2024-09-03T00:00:00Z",
    },
  ];

  const demoAgents: Agent[] = [
    { id: generateId(), nameZh: "AI 产品顾问", nameEn: "AI Product Advisor", descriptionZh: "智能分析产品需求，提供决策建议", descriptionEn: "Intelligent product requirement analysis and decision support", imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400", agentUrl: "#", apiToken: "", projectId: "", category: "product", userCount: 2500, published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
    { id: generateId(), nameZh: "PRD 生成器", nameEn: "PRD Generator", descriptionZh: "自动生成产品需求文档", descriptionEn: "Auto-generate product requirement documents", imageUrl: "https://images.unsplash.com/photo-1531746790095-e5995f614585?w=400", agentUrl: "#", apiToken: "", projectId: "", category: "document", userCount: 1800, published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
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
