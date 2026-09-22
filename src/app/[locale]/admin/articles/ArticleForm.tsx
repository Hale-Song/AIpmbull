"use client";

import { useState, useRef } from "react";
import { store, type Article, type ImageItem } from "@/lib/admin/store";
import { parsePdf, buildContentHtml, type PdfParseResult } from "@/lib/admin/pdf-parser";
import { parseMarkdown } from "@/lib/admin/md-parser";
import { TAG_POOL } from "@/lib/tags";
import { extractImagesFromHtml, replaceImageSrcInHtml, getUniqueImageUrls } from "@/lib/admin/image-utils";
import { isGithubConfigured, uploadMultipleToGithub } from "@/lib/admin/github";
import ContentEditor from "./ContentEditor";

const emptyArticle: Omit<Article, "id" | "articleNo" | "createdAt" | "updatedAt"> = {
  titleZh: "", titleEn: "", summaryZh: "", summaryEn: "", contentZh: "", contentEn: "",
  coverImage: "", category: "", tags: [], published: false, featured: false,
};

const categories = [
  { value: "productReview", zh: "产品评测", en: "Product Review" },
  { value: "productComparison", zh: "产品对比", en: "Product Comparison" },
  { value: "industryInsights", zh: "行业洞察", en: "Industry Insights" },
  { value: "aiProductManager", zh: "AI产品经理", en: "AI Product Manager" },
];

export default function ArticleForm({ article, isZh, onSave, onCancel }: {
  article: Article | null;
  isZh: boolean;
  onSave: (data: Omit<Article, "id" | "articleNo" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(article ? {
    titleZh: article.titleZh, titleEn: article.titleEn,
    summaryZh: article.summaryZh, summaryEn: article.summaryEn,
    contentZh: article.contentZh, contentEn: article.contentEn,
    coverImage: article.coverImage, category: article.category,
    tags: article.tags, published: article.published, featured: article.featured,
  } : { ...emptyArticle });

  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfProgress, setPdfProgress] = useState("");
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [pdfError, setPdfError] = useState("");
  const [mdParsing, setMdParsing] = useState(false);
  const [mdError, setMdError] = useState("");
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showContentCoverPicker, setShowContentCoverPicker] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);
  const [previewExpanded, setPreviewExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mdFileInputRef = useRef<HTMLInputElement>(null);

  const update = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  const translateField = async (text: string, from: string, to: string): Promise<string> => {
    if (!text.trim()) return "";
    try {
      const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}&de=aipmbull@example.com`;
      const resp = await fetch(mmUrl);
      if (resp.ok) {
        const data = await resp.json();
        const translated = data?.responseData?.translatedText;
        if (translated && translated !== text) return translated;
      }
    } catch {}
    try {
      const resp = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, from, to }),
      });
      if (!resp.ok) return "";
      const data = await resp.json();
      return data.translated || "";
    } catch {
      return "";
    }
  };

  const handleTitleZhBlur = async () => {
    if (form.titleZh && !form.titleEn) {
      const translated = await translateField(form.titleZh, "zh", "en");
      if (translated) update("titleEn", translated);
    }
  };

  const handleSummaryZhBlur = async () => {
    if (form.summaryZh && !form.summaryEn) {
      const translated = await translateField(form.summaryZh, "zh", "en");
      if (translated) update("summaryEn", translated);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setPdfError(isZh ? "请选择 PDF 文件" : "Please select a PDF file");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setPdfError(isZh ? "文件大小不能超过 50MB" : "File size must be under 50MB");
      return;
    }

    setPdfParsing(true);
    setPdfError("");
    setPdfProgress(isZh ? "正在解析 PDF..." : "Parsing PDF...");

    try {
      setPdfProgress(isZh ? "正在提取文本内容..." : "Extracting text content...");
      const result: PdfParseResult = await parsePdf(file);

      setPdfProgress(isZh ? "正在生成文章内容..." : "Generating article content...");

      const contentHtml = buildContentHtml(result.pageTexts, result.pageImages);

      setForm((prev) => ({
        ...prev,
        titleZh: result.title || prev.titleZh,
        titleEn: result.title || prev.titleEn,
        summaryZh: result.summary || prev.summaryZh,
        summaryEn: result.summary || prev.summaryEn,
        contentZh: contentHtml,
        contentEn: contentHtml,
        coverImage: result.firstImage || prev.coverImage,
        tags: result.tags.length > 0 ? result.tags : prev.tags,
      }));

      setPdfPages(result.pageImages.filter(Boolean));
      setContentVersion((v) => v + 1);
      setPdfProgress(isZh ? "解析完成！" : "Parsing complete!");
    } catch (err) {
      console.error("PDF parse error:", err);
      setPdfError(isZh ? "PDF 解析失败，请重试" : "Failed to parse PDF, please try again");
    } finally {
      setPdfParsing(false);
      setTimeout(() => setPdfProgress(""), 2000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".md") && !file.name.toLowerCase().endsWith(".markdown")) {
      setMdError(isZh ? "请选择 Markdown 文件（.md）" : "Please select a Markdown file (.md)");
      return;
    }

    setMdParsing(true);
    setMdError("");

    try {
      const text = await file.text();
      const result = parseMarkdown(text);

      setForm((prev) => ({
        ...prev,
        titleZh: result.title || prev.titleZh,
        titleEn: result.title || prev.titleEn,
        summaryZh: result.summary || prev.summaryZh,
        summaryEn: result.summary || prev.summaryEn,
        contentZh: result.contentHtml,
        contentEn: result.contentHtml,
        coverImage: result.firstImage || prev.coverImage,
        tags: result.tags.length > 0 ? result.tags : prev.tags,
      }));

      setContentVersion((v) => v + 1);
    } catch (err) {
      console.error("Markdown parse error:", err);
      setMdError(isZh ? "Markdown 解析失败，请重试" : "Failed to parse Markdown, please try again");
    } finally {
      setMdParsing(false);
    }

    if (mdFileInputRef.current) {
      mdFileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const githubOn = isGithubConfigured();
    let finalForm = { ...form };

    if (githubOn) {
      const allUrls = [
        ...getUniqueImageUrls(form.contentZh),
        ...getUniqueImageUrls(form.contentEn),
        ...(form.coverImage ? [form.coverImage] : []),
      ];
      const uniqueUrls = Array.from(new Set(allUrls));
      const nonGithubUrls = uniqueUrls.filter((u) => !u.includes("raw.githubusercontent.com"));

      if (nonGithubUrls.length > 0) {
        setSaveProgress(isZh ? `步骤 1/3：正在上传 ${nonGithubUrls.length} 张图片到 GitHub...` : `Step 1/3: Uploading ${nonGithubUrls.length} images to GitHub...`);
        const results = await uploadMultipleToGithub(nonGithubUrls, (done, total) => {
          setSaveProgress(isZh ? `步骤 1/3：上传中 ${done}/${total}...` : `Step 1/3: Uploading ${done}/${total}...`);
        });

        setSaveProgress(isZh ? "步骤 2/3：正在保存图片到素材库..." : "Step 2/3: Saving images to asset library...");
        const replacements = new Map<string, string>();
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          if (r.success) {
            replacements.set(nonGithubUrls[i], r.url);
            store.create<ImageItem>("images", {
              titleZh: `文章配图 ${r.filename}`,
              titleEn: `Article image ${r.filename}`,
              url: r.url,
              descriptionZh: "",
              descriptionEn: "",
              githubFilename: r.filename,
              githubUrl: r.url,
              sourceType: "article",
              sourceId: article?.id || "",
              published: true,
            });
          }
        }

        if (replacements.size > 0) {
          setSaveProgress(isZh ? "步骤 3/3：正在替换文章中的图片链接..." : "Step 3/3: Replacing image URLs in article...");
          finalForm.contentZh = replaceImageSrcInHtml(form.contentZh, replacements);
          finalForm.contentEn = replaceImageSrcInHtml(form.contentEn, replacements);
          if (form.coverImage && replacements.has(form.coverImage)) {
            finalForm.coverImage = replacements.get(form.coverImage)!;
          }
        }
      }
    }

    setSaveProgress(isZh ? "正在保存文章..." : "Saving article...");
    onSave(finalForm);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10" onClick={saving ? undefined : onCancel}>
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {saving && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-slate-900/90 backdrop-blur-sm">
            <svg className="h-10 w-10 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="mt-4 text-sm font-medium text-white">{saveProgress || (isZh ? "处理中..." : "Processing...")}</p>
          </div>
        )}
        <div className="mb-6 flex items-center gap-3">
          <h2 className="text-lg font-semibold text-white">{article ? (isZh ? "编辑文章" : "Edit Article") : (isZh ? "新建文章" : "New Article")}</h2>
          {article?.articleNo && (
            <span className="rounded bg-blue-500/10 px-2 py-0.5 font-mono text-sm text-blue-400">{article.articleNo}</span>
          )}
        </div>

        <div className="space-y-5">
          {/* PDF Upload Zone */}
          <div className="rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 p-5 transition-colors hover:border-blue-500/50">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white">{isZh ? "上传 PDF 文件" : "Upload PDF File"}</p>
                <p className="mt-1 text-xs text-slate-400">{isZh ? "自动提取标题、摘要、标签和内容（支持文字和图片）" : "Auto-extract title, summary, tags and content (text & images)"}</p>
              </div>
              <label className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700">
                {pdfParsing ? (isZh ? "解析中..." : "Parsing...") : (isZh ? "选择 PDF 文件" : "Choose PDF File")}
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" onChange={handlePdfUpload} className="hidden" disabled={pdfParsing} />
              </label>
              {pdfProgress && (
                <div className="flex items-center gap-2 text-sm text-blue-400">
                  {pdfParsing && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
                  <span>{pdfProgress}</span>
                </div>
              )}
              {pdfError && <p className="text-sm text-red-400">{pdfError}</p>}
            </div>
          </div>

          {/* Markdown Upload Zone */}
          <div className="rounded-xl border-2 border-dashed border-slate-600 bg-slate-800/50 p-4 transition-colors hover:border-emerald-500/50">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <svg className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{isZh ? "导入 Markdown 文件" : "Import Markdown File"}</p>
                <p className="text-xs text-slate-400">{isZh ? "解析 .md 文件中的标题、摘要、图片和内容" : "Parse title, summary, images and content from .md file"}</p>
              </div>
              <label className="cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700">
                {mdParsing ? (isZh ? "解析中..." : "Parsing...") : (isZh ? "选择 .md 文件" : "Choose .md File")}
                <input ref={mdFileInputRef} type="file" accept=".md,.markdown,text/markdown" onChange={handleMdUpload} className="hidden" disabled={mdParsing} />
              </label>
            </div>
            {mdError && <p className="mt-2 text-sm text-red-400">{mdError}</p>}
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "封面图片" : "Cover Image"}</label>
            <div className="flex items-start gap-3">
              {form.coverImage && (
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-700">
                  <img src={form.coverImage} alt="Cover" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input type="text" value={form.coverImage} onChange={(e) => update("coverImage", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder="https://..." />
                <div className="flex gap-3">
                  {pdfPages.length > 0 && (
                    <button type="button" onClick={() => { setShowCoverPicker(!showCoverPicker); setShowContentCoverPicker(false); }} className="text-xs text-blue-400 hover:text-blue-300">
                      {isZh ? "从 PDF 页面选择" : "From PDF pages"}
                    </button>
                  )}
                  {getUniqueImageUrls(form.contentZh).length > 0 && (
                    <button type="button" onClick={() => { setShowContentCoverPicker(!showContentCoverPicker); setShowCoverPicker(false); }} className="text-xs text-emerald-400 hover:text-emerald-300">
                      {isZh ? "从文章内容选择" : "From article content"}
                    </button>
                  )}
                </div>
              </div>
            </div>
            {showCoverPicker && pdfPages.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
                {pdfPages.map((page, i) => (
                  <button key={i} type="button" onClick={() => { update("coverImage", page); setShowCoverPicker(false); }} className={`overflow-hidden rounded-lg border-2 transition-colors ${form.coverImage === page ? "border-blue-500" : "border-transparent hover:border-slate-600"}`}>
                    <img src={page} alt={`Page ${i + 1}`} className="h-16 w-full object-cover" />
                    <span className="block py-0.5 text-[10px] text-slate-400">P{i + 1}</span>
                  </button>
                ))}
              </div>
            )}
            {showContentCoverPicker && (
              <ContentCoverPicker
                contentZh={form.contentZh}
                contentEn={form.contentEn}
                currentCover={form.coverImage}
                onSelect={(url) => { update("coverImage", url); setShowContentCoverPicker(false); }}
              />
            )}
          </div>

          {/* Titles */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "中文标题" : "Title (Chinese)"}</label>
              <input type="text" value={form.titleZh} onChange={(e) => update("titleZh", e.target.value)} onBlur={handleTitleZhBlur} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "英文标题（自动翻译）" : "Title (English, auto-translated)"}</label>
              <input type="text" value={form.titleEn} onChange={(e) => update("titleEn", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          {/* Summaries */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "中文摘要（SEO优化）" : "Summary (Chinese, SEO-optimized)"}</label>
              <textarea value={form.summaryZh} onChange={(e) => update("summaryZh", e.target.value)} onBlur={handleSummaryZhBlur} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "英文摘要（自动翻译）" : "Summary (English, auto-translated)"}</label>
              <textarea value={form.summaryEn} onChange={(e) => update("summaryEn", e.target.value)} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none resize-none" />
            </div>
          </div>

          {/* Category & Tags */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "分类" : "Category"}</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none">
                <option value="">{isZh ? "选择分类" : "Select category"}</option>
                {categories.map((c) => <option key={c.value} value={c.value}>{isZh ? c.zh : c.en}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">{isZh ? "标签（SEO关键词，逗号分隔）" : "Tags (SEO keywords, comma separated)"}</label>
              <input type="text" value={form.tags.join(", ")} onChange={(e) => update("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" />
              {form.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {form.tags.map((tag, i) => (
                    <span key={i} className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{tag}</span>
                  ))}
                </div>
              )}
              <div className="mt-2">
                <p className="mb-1 text-[10px] text-slate-500">{isZh ? "统一标签池（点击添加）" : "Tag pool (click to add)"}</p>
                <div className="flex flex-wrap gap-1">
                  {TAG_POOL.map((t) => {
                    const label = isZh ? t.zh : t.en;
                    const added = form.tags.includes(t.zh);
                    return (
                      <button
                        key={t.zh}
                        type="button"
                        onClick={() => update("tags", added ? form.tags.filter((x) => x !== t.zh) : [...form.tags, t.zh].slice(0, 10))}
                        className={`rounded-full border px-2 py-0.5 text-xs transition-colors ${added ? "border-blue-500/40 bg-blue-500/20 text-blue-300" : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 hover:text-white"}`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">{isZh ? "文章内容（支持富文本编辑）" : "Article Content (Rich Text Editor)"}</label>
            <ContentEditor
              key={contentVersion}
              valueZh={form.contentZh}
              valueEn={form.contentEn}
              onChangeZh={(v) => update("contentZh", v)}
              onChangeEn={(v) => update("contentEn", v)}
              isZh={isZh}
              onExtract={(data) => {
                if (data.title && !form.titleZh) {
                  update("titleZh", data.title);
                  if (!form.titleEn) {
                    translateField(data.title, "zh", "en").then((t) => { if (t) update("titleEn", t); });
                  }
                }
                if (data.summary) {
                  update("summaryZh", data.summary);
                  if (!form.summaryEn) {
                    translateField(data.summary, "zh", "en").then((t) => { if (t) update("summaryEn", t); });
                  }
                }
                if (data.tags && data.tags.length > 0) {
                  const merged = Array.from(new Set([...form.tags, ...data.tags]));
                  update("tags", merged.slice(0, 10));
                }
              }}
            />
          </div>

          {/* Content Preview */}
          <div>
            <button
              type="button"
              onClick={() => setPreviewExpanded(!previewExpanded)}
              className="mb-2 flex w-full items-center justify-between text-left"
            >
              <span className="text-xs font-medium text-slate-400">{isZh ? "内容预览（即发布后展示效果）" : "Content Preview (as published)"}</span>
              <svg className={`h-4 w-4 text-slate-500 transition-transform ${previewExpanded ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </button>
            {previewExpanded && (
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-5">
                {form.contentZh ? (
                  <div>
                    <div className="mb-3 flex gap-2">
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-400">{isZh ? "中文" : "Chinese"}</span>
                      {form.contentEn && <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400">{isZh ? "英文已翻译" : "English translated"}</span>}
                    </div>
                    <div
                      className="max-w-none text-slate-300 [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-3 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:mb-3 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                      dangerouslySetInnerHTML={{ __html: form.contentZh }}
                    />
                  </div>
                ) : (
                  <p className="text-center text-sm text-slate-500">{isZh ? "暂无内容，请上传 PDF 或在编辑器中输入" : "No content yet. Upload a PDF or type in the editor."}</p>
                )}
              </div>
            )}
          </div>

          {/* PDF Page Thumbnails */}
          {pdfPages.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">{isZh ? `PDF 页面预览（共 ${pdfPages.length} 页）` : `PDF Page Preview (${pdfPages.length} pages)`}</label>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {pdfPages.slice(0, 10).map((page, i) => (
                  <div key={i} className="overflow-hidden rounded-lg border border-slate-700">
                    <img src={page} alt={`Page ${i + 1}`} className="h-20 w-full object-cover" />
                    <span className="block py-0.5 text-center text-[10px] text-slate-500">{isZh ? `第 ${i + 1} 页` : `Page ${i + 1}`}</span>
                  </div>
                ))}
              </div>
              {pdfPages.length > 10 && (
                <p className="mt-2 text-xs text-slate-500">{isZh ? `还有 ${pdfPages.length - 10} 页未显示` : `${pdfPages.length - 10} more pages`}</p>
              )}
            </div>
          )}

          {/* Publish options */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.published} onChange={(e) => update("published", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500" />
              {isZh ? "发布" : "Published"}
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500" />
              {isZh ? "推荐" : "Featured"}
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} disabled={saving} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors disabled:opacity-50">{isZh ? "取消" : "Cancel"}</button>
          <button onClick={() => handleSave()} disabled={saving} className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50">
            {saving && <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {saving ? (saveProgress || (isZh ? "保存中..." : "Saving...")) : (isZh ? "保存" : "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentCoverPicker({ contentZh, contentEn, currentCover, onSelect }: {
  contentZh: string;
  contentEn: string;
  currentCover: string;
  onSelect: (url: string) => void;
}) {
  const images = extractImagesFromHtml(contentZh || contentEn);
  if (images.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="mb-2 text-[10px] text-slate-500">从文章内容中选择封面图片</p>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {images.map((img) => (
          <button
            key={img.index}
            type="button"
            onClick={() => onSelect(img.src)}
            className={`overflow-hidden rounded-lg border-2 transition-colors ${currentCover === img.src ? "border-emerald-500" : "border-transparent hover:border-slate-600"}`}
          >
            <img src={img.src} alt={img.alt || `Image ${img.index + 1}`} className="h-16 w-full object-cover" />
            <span className="block py-0.5 text-[10px] text-slate-400">#{img.index + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
