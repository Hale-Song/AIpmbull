export interface Article {
  id: string;
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

type StoreKey = "articles" | "products" | "agents" | "videos" | "images" | "settings";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
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
  if (localStorage.getItem("aipmbull_seeded")) return;

  const demoArticles: Article[] = [
    {
      id: generateId(), titleZh: "ChatGPT 产品深度评测", titleEn: "ChatGPT In-Depth Review",
      summaryZh: "全面解析 ChatGPT 的产品能力、局限性与应用场景", summaryEn: "Comprehensive analysis of ChatGPT capabilities and limitations",
      contentZh: "", contentEn: "", coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600",
      category: "productReview", tags: ["ChatGPT", "LLM"], published: true, featured: true,
      createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z",
    },
    {
      id: generateId(), titleZh: "Midjourney vs DALL-E 对比", titleEn: "Midjourney vs DALL-E Comparison",
      summaryZh: "两大 AI 绘画工具的全面对比分析", summaryEn: "Full comparison of two major AI image generation tools",
      contentZh: "", contentEn: "", coverImage: "https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=600",
      category: "productComparison", tags: ["Midjourney", "DALL-E"], published: true, featured: true,
      createdAt: "2024-08-28T00:00:00Z", updatedAt: "2024-08-28T00:00:00Z",
    },
    {
      id: generateId(), titleZh: "AI 产品经理必备技能", titleEn: "Essential Skills for AI PMs",
      summaryZh: "成为优秀 AI 产品经理需要掌握的核心技能", summaryEn: "Core skills needed to excel as an AI product manager",
      contentZh: "", contentEn: "", coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600",
      category: "industryInsights", tags: ["AI PM", "Skills"], published: true, featured: false,
      createdAt: "2024-08-25T00:00:00Z", updatedAt: "2024-08-25T00:00:00Z",
    },
  ];

  const demoProducts: Product[] = [
    { id: generateId(), nameZh: "ChatGPT", nameEn: "ChatGPT", descriptionZh: "OpenAI 开发的智能对话助手", descriptionEn: "AI conversational assistant by OpenAI", imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400", websiteUrl: "https://chat.openai.com", category: "llm", rating: 4.8, published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
    { id: generateId(), nameZh: "Midjourney", nameEn: "Midjourney", descriptionZh: "领先的 AI 图像生成工具", descriptionEn: "Leading AI image generation tool", imageUrl: "https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=400", websiteUrl: "https://midjourney.com", category: "painting", rating: 4.7, published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
    { id: generateId(), nameZh: "Cursor", nameEn: "Cursor", descriptionZh: "AI 驱动的智能代码编辑器", descriptionEn: "AI-powered intelligent code editor", imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400", websiteUrl: "https://cursor.sh", category: "coding", rating: 4.9, published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
  ];

  const demoAgents: Agent[] = [
    { id: generateId(), nameZh: "AI 产品顾问", nameEn: "AI Product Advisor", descriptionZh: "智能分析产品需求，提供决策建议", descriptionEn: "Intelligent product requirement analysis and decision support", imageUrl: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400", agentUrl: "#", category: "product", userCount: 2500, published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
    { id: generateId(), nameZh: "PRD 生成器", nameEn: "PRD Generator", descriptionZh: "自动生成产品需求文档", descriptionEn: "Auto-generate product requirement documents", imageUrl: "https://images.unsplash.com/photo-1531746790095-e5995f614585?w=400", agentUrl: "#", category: "document", userCount: 1800, published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
  ];

  const demoVideos: Video[] = [
    { id: generateId(), titleZh: "AI 产品设计入门", titleEn: "Introduction to AI Product Design", descriptionZh: "从零开始学习 AI 产品设计方法论", descriptionEn: "Learn AI product design methodology from scratch", videoUrl: "", thumbnail: "https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400", duration: "15:30", category: "tutorial", published: true, featured: true, createdAt: "2024-09-01T00:00:00Z", updatedAt: "2024-09-01T00:00:00Z" },
  ];

  setStore("articles", demoArticles);
  setStore("products", demoProducts);
  setStore("agents", demoAgents);
  setStore("videos", demoVideos);
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
