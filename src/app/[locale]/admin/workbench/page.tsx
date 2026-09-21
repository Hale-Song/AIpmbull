"use client";

import { useEffect, useState, useCallback } from "react";

interface TaskItem {
  id: string;
  titleZh: string;
  titleEn: string;
  done: boolean;
}

interface TaskPhase {
  id: string;
  titleZh: string;
  titleEn: string;
  icon: string;
  color: string;
  tasks: TaskItem[];
}

const initialPhases: TaskPhase[] = [
  {
    id: "phase-1",
    titleZh: "一、基础框架搭建",
    titleEn: "Phase 1: Core Framework",
    icon: "M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25a2.25 2.25 0 0 1-2.25-2.25v-2.25Z",
    color: "blue",
    tasks: [
      { id: "1-1", titleZh: "Next.js 14 项目初始化与目录结构", titleEn: "Next.js 14 project setup & structure", done: true },
      { id: "1-2", titleZh: "next-intl 中英双语国际化配置", titleEn: "next-intl bilingual i18n setup", done: true },
      { id: "1-3", titleZh: "Tailwind CSS 暗色主题全局样式", titleEn: "Tailwind CSS dark theme styling", done: true },
      { id: "1-4", titleZh: "响应式导航栏（顶部 Navbar）", titleEn: "Responsive top navigation bar", done: true },
      { id: "1-5", titleZh: "页脚组件（Footer）", titleEn: "Footer component", done: true },
      { id: "1-6", titleZh: "移动端适配与断点优化", titleEn: "Mobile responsive breakpoints", done: true },
    ],
  },
  {
    id: "phase-2",
    titleZh: "二、后台管理系统",
    titleEn: "Phase 2: Admin CMS Backend",
    icon: "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    color: "purple",
    tasks: [
      { id: "2-1", titleZh: "管理员登录页面（admin/123456）", titleEn: "Admin login page (admin/123456)", done: true },
      { id: "2-2", titleZh: "控制台仪表盘（数据统计卡片）", titleEn: "Dashboard with stats cards", done: true },
      { id: "2-3", titleZh: "文章管理（增删改查 + 编号）", titleEn: "Article CRUD with sequential IDs", done: true },
      { id: "2-4", titleZh: "产品管理（增删改查）", titleEn: "Product CRUD management", done: true },
      { id: "2-5", titleZh: "智能体管理（增删改查）", titleEn: "Agent CRUD management", done: true },
      { id: "2-6", titleZh: "视频管理（增删改查）", titleEn: "Video CRUD management", done: true },
      { id: "2-7", titleZh: "图片管理（上传与列表）", titleEn: "Image upload & management", done: true },
      { id: "2-8", titleZh: "网站设置（站点名称、Logo、社交链接）", titleEn: "Site settings (name, logo, socials)", done: true },
      { id: "2-9", titleZh: "localStorage 数据持久化", titleEn: "localStorage data persistence", done: true },
      { id: "2-10", titleZh: "Cloudflare KV 同步（syncAllToApi）", titleEn: "Cloudflare KV sync (syncAllToApi)", done: true },
    ],
  },
  {
    id: "phase-3",
    titleZh: "三、内容创作工具",
    titleEn: "Phase 3: Content Creation Tools",
    icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931ZM16.862 4.487 19.5 7.125",
    color: "emerald",
    tasks: [
      { id: "3-1", titleZh: "PDF 上传与解析（文本 + 图片提取）", titleEn: "PDF upload & parsing (text + images)", done: true },
      { id: "3-2", titleZh: "PDF 页面缩略图预览", titleEn: "PDF page thumbnail preview", done: true },
      { id: "3-3", titleZh: "Markdown 粘贴自动转 HTML", titleEn: "Markdown paste → HTML conversion", done: true },
      { id: "3-4", titleZh: "Markdown 文件上传解析", titleEn: "Markdown file upload & parsing", done: true },
      { id: "3-5", titleZh: "中文→英文自动翻译（MyMemory API）", titleEn: "Auto zh→en translation (MyMemory API)", done: true },
      { id: "3-6", titleZh: "SEO 标签自动提取建议", titleEn: "Auto SEO tag suggestions", done: true },
      { id: "3-7", titleZh: "封面图片上传与 URL 输入", titleEn: "Cover image upload & URL input", done: true },
      { id: "3-8", titleZh: "内容预览（可折叠展开）", titleEn: "Content preview (collapsible)", done: true },
      { id: "3-9", titleZh: "富文本编辑器（HTML 直接编辑）", titleEn: "Rich text editor (direct HTML editing)", done: true },
    ],
  },
  {
    id: "phase-4",
    titleZh: "四、前台展示页面",
    titleEn: "Phase 4: Frontend Pages",
    icon: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418",
    color: "amber",
    tasks: [
      { id: "4-1", titleZh: "首页（Hero + 精选内容展示）", titleEn: "Homepage (Hero + featured content)", done: true },
      { id: "4-2", titleZh: "文章列表页（分类筛选卡片）", titleEn: "Article list (category filter cards)", done: true },
      { id: "4-3", titleZh: "文章详情页（全文阅读）", titleEn: "Article detail (full reading view)", done: true },
      { id: "4-4", titleZh: "产品展示页（网格 + 分类筛选）", titleEn: "Product showcase (grid + filters)", done: true },
      { id: "4-5", titleZh: "智能体展示页", titleEn: "Agent showcase page", done: true },
      { id: "4-6", titleZh: "视频展示页", titleEn: "Video gallery page", done: true },
      { id: "4-7", titleZh: "关于页面", titleEn: "About page", done: true },
      { id: "4-8", titleZh: "项目展示页面", titleEn: "Projects showcase page", done: true },
      { id: "4-9", titleZh: "文章分类筛选交互（前端联动）", titleEn: "Article category filter (frontend)", done: false },
      { id: "4-10", titleZh: "产品对比功能", titleEn: "Product comparison feature", done: false },
      { id: "4-11", titleZh: "全局搜索功能", titleEn: "Global search functionality", done: false },
    ],
  },
  {
    id: "phase-5",
    titleZh: "五、SEO 与性能优化",
    titleEn: "Phase 5: SEO & Performance",
    icon: "M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6",
    color: "cyan",
    tasks: [
      { id: "5-1", titleZh: "页面 Meta 标签（title/description/OG）", titleEn: "Meta tags (title/description/OG)", done: true },
      { id: "5-2", titleZh: "Open Graph 社交分享标签", titleEn: "Open Graph social sharing tags", done: true },
      { id: "5-3", titleZh: "JSON-LD 结构化数据", titleEn: "JSON-LD structured data", done: false },
      { id: "5-4", titleZh: "sitemap.xml 站点地图", titleEn: "sitemap.xml generation", done: false },
      { id: "5-5", titleZh: "robots.txt 配置", titleEn: "robots.txt configuration", done: false },
      { id: "5-6", titleZh: "图片懒加载", titleEn: "Image lazy loading", done: false },
      { id: "5-7", titleZh: "页面加载性能优化（Core Web Vitals）", titleEn: "Performance optimization (CWV)", done: false },
      { id: "5-8", titleZh: "Google Analytics / 百度统计集成", titleEn: "Analytics integration (GA/Baidu)", done: false },
    ],
  },
  {
    id: "phase-6",
    titleZh: "六、用户增长与互动",
    titleEn: "Phase 6: Growth & Engagement",
    icon: "M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.97 5.97 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z",
    color: "rose",
    tasks: [
      { id: "6-1", titleZh: "社交分享按钮（微信/微博/Twitter）", titleEn: "Social sharing buttons", done: false },
      { id: "6-2", titleZh: "邮件订阅功能", titleEn: "Email newsletter subscription", done: false },
      { id: "6-3", titleZh: "文章阅读量统计", titleEn: "Article view counter", done: false },
      { id: "6-4", titleZh: "评论系统（第三方集成）", titleEn: "Comment system (3rd-party integration)", done: false },
      { id: "6-5", titleZh: "相关文章推荐", titleEn: "Related articles recommendation", done: false },
      { id: "6-6", titleZh: "RSS 订阅源", titleEn: "RSS feed generation", done: false },
    ],
  },
  {
    id: "phase-7",
    titleZh: "七、运营体验优化",
    titleEn: "Phase 7: Operations & UX",
    icon: "M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75",
    color: "indigo",
    tasks: [
      { id: "7-1", titleZh: "后台数据统计图表（趋势分析）", titleEn: "Admin analytics charts (trends)", done: false },
      { id: "7-2", titleZh: "文章批量管理（批量发布/删除）", titleEn: "Batch article management", done: false },
      { id: "7-3", titleZh: "草稿自动保存", titleEn: "Auto-save drafts", done: false },
      { id: "7-4", titleZh: "数据导入/导出（JSON）", titleEn: "Data import/export (JSON)", done: false },
      { id: "7-5", titleZh: "操作日志记录", titleEn: "Operation audit log", done: false },
      { id: "7-6", titleZh: "后台暗色/亮色主题切换", titleEn: "Admin theme toggle (dark/light)", done: false },
    ],
  },
  {
    id: "phase-8",
    titleZh: "八、部署上线与运维",
    titleEn: "Phase 8: Deployment & Ops",
    icon: "M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z",
    color: "teal",
    tasks: [
      { id: "8-1", titleZh: "Cloudflare Pages 配置与部署", titleEn: "Cloudflare Pages setup & deploy", done: true },
      { id: "8-2", titleZh: "GitHub 仓库管理", titleEn: "GitHub repository management", done: true },
      { id: "8-3", titleZh: "自定义域名绑定（aipmbull.com）", titleEn: "Custom domain (aipmbull.com)", done: true },
      { id: "8-4", titleZh: "HTTPS 证书（Cloudflare 自动）", titleEn: "HTTPS certificate (auto via CF)", done: true },
      { id: "8-5", titleZh: "CI/CD 自动部署（GitHub → Cloudflare）", titleEn: "CI/CD auto-deploy (GH → CF)", done: false },
      { id: "8-6", titleZh: "缓存策略与 CDN 优化", titleEn: "Cache strategy & CDN optimization", done: false },
      { id: "8-7", titleZh: "Cloudflare KV 数据备份方案", titleEn: "KV data backup strategy", done: false },
      { id: "8-8", titleZh: "错误监控与告警", titleEn: "Error monitoring & alerting", done: false },
    ],
  },
];

const STORAGE_KEY = "aipmbull_workbench";

const colorMap: Record<string, { bg: string; text: string; border: string; badge: string; progress: string; check: string }> = {
  blue:    { bg: "bg-blue-500/5",   text: "text-blue-400",   border: "border-blue-500/20",   badge: "bg-blue-500/10 text-blue-400",   progress: "bg-blue-500",   check: "text-blue-400" },
  purple:  { bg: "bg-purple-500/5",  text: "text-purple-400",  border: "border-purple-500/20",  badge: "bg-purple-500/10 text-purple-400",  progress: "bg-purple-500",  check: "text-purple-400" },
  emerald: { bg: "bg-emerald-500/5", text: "text-emerald-400", border: "border-emerald-500/20", badge: "bg-emerald-500/10 text-emerald-400", progress: "bg-emerald-500", check: "text-emerald-400" },
  amber:   { bg: "bg-amber-500/5",   text: "text-amber-400",   border: "border-amber-500/20",   badge: "bg-amber-500/10 text-amber-400",   progress: "bg-amber-500",   check: "text-amber-400" },
  cyan:    { bg: "bg-cyan-500/5",    text: "text-cyan-400",    border: "border-cyan-500/20",    badge: "bg-cyan-500/10 text-cyan-400",    progress: "bg-cyan-500",    check: "text-cyan-400" },
  rose:    { bg: "bg-rose-500/5",    text: "text-rose-400",    border: "border-rose-500/20",    badge: "bg-rose-500/10 text-rose-400",    progress: "bg-rose-500",    check: "text-rose-400" },
  indigo:  { bg: "bg-indigo-500/5",  text: "text-indigo-400",  border: "border-indigo-500/20",  badge: "bg-indigo-500/10 text-indigo-400",  progress: "bg-indigo-500",  check: "text-indigo-400" },
  teal:    { bg: "bg-teal-500/5",    text: "text-teal-400",    border: "border-teal-500/20",    badge: "bg-teal-500/10 text-teal-400",    progress: "bg-teal-500",    check: "text-teal-400" },
};

export default function AdminWorkbenchPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const [phases, setPhases] = useState<TaskPhase[]>(initialPhases);
  const [expandedPhase, setExpandedPhase] = useState<Set<string>>(new Set(initialPhases.map(p => p.id)));
  const [pushStatus, setPushStatus] = useState<"idle" | "loading" | "done">("idle");
  const [deployStatus, setDeployStatus] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const doneMap: Record<string, boolean> = JSON.parse(saved);
        setPhases(prev => prev.map(phase => ({
          ...phase,
          tasks: phase.tasks.map(task => ({
            ...task,
            done: doneMap[task.id] ?? task.done,
          })),
        })));
      }
    } catch {}
  }, []);

  const saveProgress = useCallback((updated: TaskPhase[]) => {
    const doneMap: Record<string, boolean> = {};
    for (const phase of updated) {
      for (const task of phase.tasks) {
        doneMap[task.id] = task.done;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(doneMap));
  }, []);

  const toggleTask = (taskId: string) => {
    setPhases(prev => {
      const updated = prev.map(phase => ({
        ...phase,
        tasks: phase.tasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t),
      }));
      saveProgress(updated);
      return updated;
    });
  };

  const togglePhase = (phaseId: string) => {
    setExpandedPhase(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const doneTasks = phases.reduce((sum, p) => sum + p.tasks.filter(t => t.done).length, 0);
  const overallPercent = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const handlePush = () => {
    setPushStatus("loading");
    window.open("https://github.com/Hale-Song/AIpmbull", "_blank");
    setTimeout(() => setPushStatus("done"), 1000);
    setTimeout(() => setPushStatus("idle"), 3000);
  };

  const handleDeploy = () => {
    setDeployStatus("loading");
    window.open("https://dash.cloudflare.com/28d6b99b2ba8282b01574797476498ae/pages/view/aipmbull", "_blank");
    setTimeout(() => setDeployStatus("done"), 1000);
    setTimeout(() => setDeployStatus("idle"), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{isZh ? "任务工作台" : "Task Workbench"}</h1>
          <p className="mt-1 text-sm text-slate-400">
            {isZh ? "网站搭建全流程任务清单，与 AI 协作逐步完成" : "Full website build checklist — collaborate with AI step by step"}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePush}
            disabled={pushStatus === "loading"}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-600 hover:text-white disabled:opacity-50"
          >
            {pushStatus === "loading" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-1.5" /></svg>
            )}
            {pushStatus === "done" ? (isZh ? "已打开 GitHub" : "GitHub opened") : (isZh ? "推送" : "Push")}
          </button>
          <button
            onClick={handleDeploy}
            disabled={deployStatus === "loading"}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            {deployStatus === "loading" ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" /></svg>
            )}
            {deployStatus === "done" ? (isZh ? "已打开部署面板" : "Deploy panel opened") : (isZh ? "部署" : "Deploy")}
          </button>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
            </div>
            <div>
              <p className="text-sm text-slate-400">{isZh ? "总体进度" : "Overall Progress"}</p>
              <p className="text-2xl font-bold text-white">{overallPercent}%</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">{isZh ? "已完成" : "Completed"}</p>
            <p className="text-lg font-semibold text-white">{doneTasks} <span className="text-sm font-normal text-slate-500">/ {totalTasks}</span></p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {phases.map(phase => {
            const done = phase.tasks.filter(t => t.done).length;
            const total = phase.tasks.length;
            const c = colorMap[phase.color];
            return (
              <button
                key={phase.id}
                onClick={() => togglePhase(phase.id)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${done === total ? c.badge : "bg-slate-800 text-slate-500 hover:text-slate-300"}`}
              >
                {isZh ? phase.titleZh : phase.titleEn} {done}/{total}
              </button>
            );
          })}
        </div>
      </div>

      {/* Phase Cards */}
      <div className="space-y-3">
        {phases.map(phase => {
          const done = phase.tasks.filter(t => t.done).length;
          const total = phase.tasks.length;
          const percent = total > 0 ? Math.round((done / total) * 100) : 0;
          const isExpanded = expandedPhase.has(phase.id);
          const c = colorMap[phase.color];
          const allDone = done === total;

          return (
            <div key={phase.id} className={`rounded-xl border transition-colors ${allDone ? "border-slate-700 bg-slate-900/50" : "border-slate-800 bg-slate-900"}`}>
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="flex w-full items-center gap-4 p-5 text-left"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${c.bg} ${c.border} border`}>
                  <svg className={`h-5 w-5 ${c.text}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={phase.icon} />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{isZh ? phase.titleZh : phase.titleEn}</h3>
                    {allDone && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">{isZh ? "已完成" : "Done"}</span>
                    )}
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div className={`h-full rounded-full ${c.progress} transition-all duration-500`} style={{ width: `${percent}%` }} />
                    </div>
                    <span className="shrink-0 text-xs text-slate-500">{done}/{total}</span>
                  </div>
                </div>
                <svg className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Task List */}
              {isExpanded && (
                <div className="border-t border-slate-800 px-5 pb-4">
                  <div className="space-y-1 pt-2">
                    {phase.tasks.map(task => (
                      <label
                        key={task.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-800/50"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTask(task.id)}
                          className="h-4 w-4 shrink-0 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm ${task.done ? "text-slate-500 line-through" : "text-slate-300"}`}>
                          {isZh ? task.titleZh : task.titleEn}
                        </span>
                        {task.done && (
                          <svg className={`h-4 w-4 shrink-0 ${c.check}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <h3 className="mb-3 text-sm font-semibold text-white">{isZh ? "操作说明" : "Instructions"}</h3>
        <div className="grid gap-4 text-sm text-slate-400 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
            <span>{isZh ? "勾选已完成的任务，进度自动保存" : "Check off completed tasks — progress auto-saves"}</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25Z" /></svg>
            <span>{isZh ? "点击「推送」打开 GitHub 仓库页面" : "Click Push to open GitHub repo page"}</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 18.189c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977v-8.123ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 12.75 16.811V8.69Z" /></svg>
            <span>{isZh ? "点击「部署」打开 Cloudflare 部署面板" : "Click Deploy to open Cloudflare deploy panel"}</span>
          </div>
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.18 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
            <span>{isZh ? "告诉 AI 需要完成哪个任务，AI 会帮你实现" : "Tell AI which task to work on — it will implement it"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
