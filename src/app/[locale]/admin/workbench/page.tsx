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
    id: "phase-p0",
    titleZh: "一、P0 紧急优化（第 1-3 天 · 现有页面整改）",
    titleEn: "P0: Urgent Fixes (Days 1-3, existing pages)",
    icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
    color: "rose",
    tasks: [
      { id: "p0-1", titleZh: "重构顶部主导航：首页｜作品集｜资讯专栏｜AI 工具库｜资源模板｜关于我｜联系我", titleEn: "Rebuild top nav: Home | Portfolio | Articles | AI Tools | Templates | About | Contact", done: true },
      { id: "p0-2", titleZh: "重写 Hero 区：一句话定位 + 个人能力标签 + 3 个 CTA 按钮", titleEn: "Rewrite Hero: positioning line + skill tags + 3 CTA buttons", done: true },
      { id: "p0-3", titleZh: "替换或删除首页虚高统计数字模块", titleEn: "Replace or remove inflated homepage stats block", done: true },
      { id: "p0-4", titleZh: "精选资讯卡片标准化：标题 + 标签 + 摘要 + 发布时间", titleEn: "Standardize news cards: title + tags + summary + date", done: true },
      { id: "p0-5", titleZh: "资讯列表页增加标签筛选与「查看更多」按钮", titleEn: "Add tag filter & \"view more\" to article list page", done: true },
      { id: "p0-6", titleZh: "热门 AI 产品卡片补充 PM 视角分析：适用场景/优缺点/设计借鉴点", titleEn: "Add PM-perspective analysis to product cards (scenarios, pros/cons, design takeaways)", done: true },
      { id: "p0-7", titleZh: "AI 工具卡片标注外部跳转/本站 Demo + 能力边界说明", titleEn: "Label tools as external/demo + add capability-boundary notes", done: true },
      { id: "p0-8", titleZh: "增设「探索更多 AI 工具」按钮跳转完整工具库页", titleEn: "Add \"Explore more AI tools\" button linking to full tool library", done: true },
      { id: "p0-9", titleZh: "重构首页区块顺序：Hero→精选项目→最新文章→精选工具→模板入口→页脚", titleEn: "Reorder homepage: Hero → projects → articles → tools → templates → footer", done: true },
      { id: "p0-10", titleZh: "完善页脚：版权声明/邮箱/社交账号/隐私声明入口", titleEn: "Complete footer: copyright, email, social links, privacy entry", done: true },
    ],
  },
  {
    id: "phase-p1",
    titleZh: "二、P1 迭代优化（第 4-10 天 · 内容深化）",
    titleEn: "P1: Content Iteration (Days 4-10)",
    icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99",
    color: "amber",
    tasks: [
      { id: "p1-1", titleZh: "建立全站统一标签池：RAG/Agent/大模型产品设计/模型评测/Prompt工程/AI-PRD/行业分析/求职作品集", titleEn: "Create unified tag pool (RAG, Agent, LLM design, eval, prompt, AI-PRD, industry, portfolio)", done: true },
      { id: "p1-2", titleZh: "统一文章详情模板：目录导航 + 上一篇/下一篇 + 相关推荐", titleEn: "Unified article template: TOC nav, prev/next, related posts", done: true },
      { id: "p1-3", titleZh: "存量文章补齐配图：流程图/架构示意图/原型截图", titleEn: "Add diagrams to existing articles (flows, architecture, prototypes)", done: true },
      { id: "p1-4", titleZh: "AI 工具库按 PM 工作流分类：原型设计｜Prompt 工具｜向量库 & RAG｜模型评测｜文档 & PRD", titleEn: "Categorize tool library by PM workflow (5 groups)", done: true },
      { id: "p1-5", titleZh: "工具条目标准化：名称/跳转链接/适用场景/PM 使用建议/优缺点", titleEn: "Standardize tool entries: name, link, scenario, PM tips, pros/cons", done: true },
      { id: "p1-6", titleZh: "所有页面配置独立 title 与 meta 描述（核心关键词）", titleEn: "Per-page SEO titles & meta descriptions with core keywords", done: true },
      { id: "p1-7", titleZh: "全部图片补充 alt 描述", titleEn: "Add alt text to all images", done: true },
    ],
  },
  {
    id: "phase-p2",
    titleZh: "三、P2 新增核心模块（第 11-25 天 · 核心竞争力）",
    titleEn: "P2: Core New Modules (Days 11-25)",
    icon: "M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0",
    color: "blue",
    tasks: [
      { id: "p2-1", titleZh: "作品集列表页 + 项目统一模板：背景→痛点→选型→流程&原型→评估指标→Badcase→复盘", titleEn: "Portfolio list page + unified case template (background → metrics → badcases → recap)", done: true },
      { id: "p2-2", titleZh: "项目案例 1：RAG 知识库产品（脱敏模拟数据）", titleEn: "Case 1: RAG knowledge-base product (anonymized mock data)", done: true },
      { id: "p2-3", titleZh: "项目案例 2：Agent 智能助手", titleEn: "Case 2: Agent assistant", done: true },
      { id: "p2-4", titleZh: "项目案例 3：AI 内容生成 / AI 数据分析", titleEn: "Case 3: AI content generation / data analysis", done: true },
      { id: "p2-5", titleZh: "首页放置 3 个精选项目卡片跳转入口", titleEn: "Homepage: 3 featured project cards linking to portfolio", done: true },
      { id: "p2-6", titleZh: "资源模板下载页：AI-PRD/RAG 评估表/AI 产品画布/需求拆解", titleEn: "Resources page: AI-PRD, RAG eval sheet, AI canvas, requirement breakdown templates", done: true },
      { id: "p2-7", titleZh: "关于我页面：职业经历/擅长领域/理念/简历预览 + PDF 下载/社交账号", titleEn: "About page: career, expertise, resume preview + PDF download, socials", done: true },
      { id: "p2-8", titleZh: "联系页面：邮箱/社交账号/留言表单", titleEn: "Contact page: email, socials, optional message form", done: true },
      { id: "p2-9", titleZh: "隐私声明页面", titleEn: "Privacy policy page", done: true },
    ],
  },
  {
    id: "phase-p3",
    titleZh: "四、P3 长期增值（P0-P2 完成后持续迭代）",
    titleEn: "P3: Long-term Additions (ongoing after P0-P2)",
    icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "cyan",
    tasks: [
      { id: "p3-1", titleZh: "嵌入可运行 Demo：Prompt 调试工具/简易模型评测小工具", titleEn: "Embed runnable demos: prompt debugger, mini model-eval tool", done: true },
      { id: "p3-2", titleZh: "读书笔记 & 学习日志栏目", titleEn: "Reading notes & learning log section", done: true },
      { id: "p3-3", titleZh: "PPT 分享页面", titleEn: "PPT sharing page", done: true },
      { id: "p3-4", titleZh: "友链板块", titleEn: "Friend-links section", done: true },
      { id: "p3-5", titleZh: "问答专区：读者提问收集与回复", titleEn: "Q&A section: collect and answer reader questions", done: true },
    ],
  },
  {
    id: "phase-accept",
    titleZh: "六、阶段自查验收清单",
    titleEn: "Stage Acceptance Checklist",
    icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    color: "emerald",
    tasks: [
      { id: "ac-1", titleZh: "首页 3 秒看懂：你是谁/擅长方向/可查看内容", titleEn: "Homepage passes 3-second clarity check (who / focus / content)", done: true },
      { id: "ac-2", titleZh: "作品集含 AI PM 核心要素：技术选型/量化指标/Badcase/方案权衡", titleEn: "Portfolio covers AI-PM elements: tech choices, metrics, badcases, trade-offs", done: true },
      { id: "ac-3", titleZh: "全部文章带标签，支持标签筛选", titleEn: "All articles tagged with working tag filter", done: true },
      { id: "ac-4", titleZh: "网站具备可下载 AI-PM 实战模板", titleEn: "Downloadable AI-PM templates available on site", done: true },
      { id: "ac-5", titleZh: "导航全部链接正常跳转，页脚信息完整", titleEn: "All nav links work and footer is complete", done: true },
      { id: "ac-6", titleZh: "每个页面配置独立 SEO 标题与描述", titleEn: "Every page has unique SEO title & description", done: true },
    ],
  },
  {
    id: "phase-p4",
    titleZh: "五、P4 后台增强 · 素材库与 GitHub 图片托管",
    titleEn: "P4: Admin Enhancements — Asset Library & GitHub Image Hosting",
    icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z",
    color: "purple",
    tasks: [
      { id: "p4-1", titleZh: "新建素材库管理页面：支持手动添加、上传、编辑图片元数据", titleEn: "Asset library page: manual add, upload, edit image metadata", done: true },
      { id: "p4-2", titleZh: "接入 GitHub Contents API，图片以 base64 推送到仓库持久化存储", titleEn: "GitHub Contents API integration: push images as base64 to repo", done: true },
      { id: "p4-3", titleZh: "素材库支持按来源筛选（手动/上传/文章提取）", titleEn: "Asset library filter by source (manual/upload/article)", done: true },
      { id: "p4-4", titleZh: "文章编辑器：封面图片支持从文章内容中选择", titleEn: "Article editor: cover image picker from article content", done: true },
      { id: "p4-5", titleZh: "文章保存时自动将非 GitHub 图片上传并替换为 GitHub 链接", titleEn: "Auto-upload non-GitHub images on article save, replace URLs", done: true },
      { id: "p4-6", titleZh: "上传成功的图片自动存入素材库，关联文章来源", titleEn: "Uploaded images auto-saved to asset library with article source", done: true },
      { id: "p4-7", titleZh: "构建部署验证通过", titleEn: "Build & deploy verification passed", done: true },
      { id: "p4-8", titleZh: "批量迁移：一键将所有文章图片推送到 GitHub 并替换链接", titleEn: "Bulk migrate: one-click push all article images to GitHub & replace URLs", done: true },
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
            done: task.done || (doneMap[task.id] ?? false),
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
            {isZh ? "站点优化需求规划 V1.0：P0 紧急整改 → P1 内容迭代 → P2 核心模块 → P3 长期增值" : "Optimization roadmap V1.0: P0 urgent fixes → P1 content iteration → P2 core modules → P3 long-term additions"}
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
