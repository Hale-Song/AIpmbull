"use client";

import { useLocale } from "next-intl";
import { useEffect, useState, useCallback, useRef, forwardRef } from "react";
import { store, seedDemoData, type Article } from "@/lib/admin/store";
import { parsePdf, buildContentHtml, type PdfParseResult } from "@/lib/admin/pdf-parser";
import { parseMarkdown } from "@/lib/admin/md-parser";
import { syncAllToApi } from "@/lib/api/client";
import { TAG_POOL } from "@/lib/tags";

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

function exportArticlesData(articles: Article[]) {
  const published = articles.filter(a => a.published);
  const json = JSON.stringify(published, null, 2);
  navigator.clipboard.writeText(json).then(() => {
    alert(published.length > 0
      ? `已复制 ${published.length} 篇已发布文章的 JSON 数据到剪贴板。请粘贴到 data/articles.json 文件中，然后重新构建部署。`
      : "没有已发布的文章可导出。");
  }).catch(() => {
    // Fallback: open in new window
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(`<pre style="white-space:pre-wrap;font-family:monospace;">${json}</pre>`);
    }
  });
}

export default function AdminArticlesPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const lang = isZh ? "zh" : "en";
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const load = useCallback(() => {
    seedDemoData();
    setArticles(store.list<Article>("articles"));
  }, []);

  useEffect(() => { load(); syncAllToApi(); }, [load]);

  const filtered = articles.filter((a) => {
    if (filter === "published" && !a.published) return false;
    if (filter === "draft" && a.published) return false;
    if (search && !a.titleZh.includes(search) && !a.titleEn.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => (b.articleNo || "").localeCompare(a.articleNo || ""));

  const handleSave = (data: Omit<Article, "id" | "articleNo" | "createdAt" | "updatedAt">) => {
    if (editing) {
      store.update<Article>("articles", editing.id, data);
    } else {
      store.create<Article>("articles", data);
    }
    setShowForm(false);
    setEditing(null);
    load();
    syncAllToApi();
  };

  const handleDelete = (id: string) => {
    store.delete("articles", id);
    setDeleteConfirm(null);
    load();
    syncAllToApi();
  };

  const handleTogglePublish = (id: string, published: boolean) => {
    store.update<Article>("articles", id, { published: !published });
    load();
    syncAllToApi();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-slate-700 bg-slate-800 p-0.5">
            {(["all", "published", "draft"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${filter === f ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                {f === "all" ? (isZh ? "全部" : "All") : f === "published" ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
              </button>
            ))}
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
            <input type="text" placeholder={isZh ? "搜索文章..." : "Search..."} value={search} onChange={(e) => setSearch(e.target.value)} className="rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none" />
          </div>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          {isZh ? "新建文章" : "New Article"}
        </button>
        <button onClick={() => exportArticlesData(articles)} className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-slate-600 hover:text-white">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          {isZh ? "导出数据" : "Export"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6V7.5Z" /></svg>
          <p className="mt-3 text-sm text-slate-500">{isZh ? "暂无文章" : "No articles yet"}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs font-medium uppercase text-slate-500">
                <th className="px-5 py-3">{isZh ? "编号" : "No."}</th>
                <th className="px-5 py-3">{isZh ? "标题" : "Title"}</th>
                <th className="px-5 py-3 hidden sm:table-cell">{isZh ? "分类" : "Category"}</th>
                <th className="px-5 py-3 hidden md:table-cell">{isZh ? "日期" : "Date"}</th>
                <th className="px-5 py-3">{isZh ? "状态" : "Status"}</th>
                <th className="px-5 py-3 text-right">{isZh ? "操作" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-xs text-blue-400">{article.articleNo || "—"}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {article.coverImage && <img src={article.coverImage} alt={article.titleZh} className="h-10 w-10 rounded-lg object-cover" />}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{isZh ? article.titleZh : article.titleEn}</p>
                        <p className="truncate text-xs text-slate-500 sm:hidden">{categories.find(c => c.value === article.category)?.[lang]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">{categories.find(c => c.value === article.category)?.[lang] || article.category}</span>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-400 hidden md:table-cell">{new Date(article.createdAt).toLocaleDateString(isZh ? "zh-CN" : "en-US")}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleTogglePublish(article.id, article.published)} className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${article.published ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20" : "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"}`}>
                      {article.published ? (isZh ? "已发布" : "Published") : (isZh ? "草稿" : "Draft")}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setEditing(article); setShowForm(true); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors" title={isZh ? "编辑" : "Edit"}>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
                      </button>
                      {deleteConfirm === article.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(article.id)} className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700">{isZh ? "确认" : "Yes"}</button>
                          <button onClick={() => setDeleteConfirm(null)} className="rounded-lg bg-slate-700 px-2 py-1 text-xs text-white hover:bg-slate-600">{isZh ? "取消" : "No"}</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(article.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-600/10 hover:text-red-400 transition-colors" title={isZh ? "删除" : "Delete"}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <ArticleForm
          article={editing}
          isZh={isZh}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function ContentEditor({ valueZh, valueEn, onChangeZh, onChangeEn, isZh, onExtract }: {
  valueZh: string;
  valueEn: string;
  onChangeZh: (v: string) => void;
  onChangeEn: (v: string) => void;
  isZh: boolean;
  onExtract?: (data: { title?: string; summary?: string; tags?: string[] }) => void;
}) {
  const [activeLang, setActiveLang] = useState<"zh" | "en">("zh");
  const [translating, setTranslating] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const lastLangRef = useRef<string>("");
  const contentVersionRef = useRef(0);
  const lastSetContentRef = useRef("");
  const onChangeZhRef = useRef(onChangeZh);
  onChangeZhRef.current = onChangeZh;
  const onChangeEnRef = useRef(onChangeEn);
  onChangeEnRef.current = onChangeEn;
  const onExtractRef = useRef(onExtract);
  onExtractRef.current = onExtract;
  const valueZhRef = useRef(valueZh);
  valueZhRef.current = valueZh;
  const valueEnRef = useRef(valueEn);
  valueEnRef.current = valueEn;
  const zhContentBuf = useRef(valueZh);
  const enContentBuf = useRef(valueEn);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    if (lastLangRef.current && activeLang !== lastLangRef.current) {
      const prevContent = el.innerHTML;
      if (lastLangRef.current === "zh") {
        zhContentBuf.current = prevContent;
        onChangeZhRef.current(prevContent);
      } else {
        enContentBuf.current = prevContent;
        onChangeEnRef.current(prevContent);
      }
    }
    lastLangRef.current = activeLang;

    const currentContent = activeLang === "zh" ? zhContentBuf.current : enContentBuf.current;
    if (currentContent !== lastSetContentRef.current) {
      el.innerHTML = currentContent;
      lastSetContentRef.current = currentContent;
    }
  }, [activeLang]);

  useEffect(() => {
    zhContentBuf.current = valueZh;
    if (activeLang === "zh") {
      const el = editorRef.current;
      if (!el) return;
      if (valueZh !== lastSetContentRef.current) {
        el.innerHTML = valueZh;
        lastSetContentRef.current = valueZh;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueZh]);

  useEffect(() => {
    enContentBuf.current = valueEn;
    if (activeLang === "en") {
      const el = editorRef.current;
      if (!el) return;
      if (valueEn !== lastSetContentRef.current) {
        el.innerHTML = valueEn;
        lastSetContentRef.current = valueEn;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueEn]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;

    const handleMarkdownInsert = (e: Event) => {
      const customEvent = e as CustomEvent;
      const mdText = customEvent.detail?.text;
      if (!mdText || typeof mdText !== "string") return;
      e.preventDefault();
      processMarkdownContent(el, mdText);
      const plainForMeta = mdText
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`]/g, "")
        .replace(/^>\s*/gm, "")
        .replace(/^\|.*\|$/gm, "")
        .replace(/^[-]{3,}\s*$/gm, "");
      if (plainForMeta.trim().length > 20) {
        setTimeout(() => extractMetadataFromText(plainForMeta), 100);
      }
    };

    el.addEventListener("aipmbull-insert-markdown", handleMarkdownInsert);
    return () => el.removeEventListener("aipmbull-insert-markdown", handleMarkdownInsert);
  }, []);

  const handleInput = () => {
    const el = editorRef.current;
    if (!el) return;
    lastSetContentRef.current = el.innerHTML;
    if (activeLang === "zh") {
      zhContentBuf.current = el.innerHTML;
      onChangeZhRef.current(el.innerHTML);
    } else {
      enContentBuf.current = el.innerHTML;
      onChangeEnRef.current(el.innerHTML);
    }
  };

  const handleLangSwitch = (lang: "zh" | "en") => {
    if (lang === activeLang) return;
    const el = editorRef.current;
    if (el) {
      if (activeLang === "zh") {
        zhContentBuf.current = el.innerHTML;
        onChangeZhRef.current(el.innerHTML);
      } else {
        enContentBuf.current = el.innerHTML;
        onChangeEnRef.current(el.innerHTML);
      }
    }
    setActiveLang(lang);
    const newContent = lang === "zh" ? zhContentBuf.current : enContentBuf.current;
    requestAnimationFrame(() => {
      const el2 = editorRef.current;
      if (el2) {
        el2.innerHTML = newContent;
        lastSetContentRef.current = newContent;
      }
    });
  };

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    handleInput();
  };

  const insertImage = () => {
    const url = prompt(isZh ? "请输入图片 URL：" : "Enter image URL:");
    if (url) {
      execCmd("insertImage", url);
    }
  };

  const translateText = async (text: string, from: string, to: string): Promise<string> => {
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

  const translateContent = async () => {
    if (translating) return;
    const zhHtml = zhContentBuf.current;
    if (!zhHtml.trim()) return;
    setTranslating(true);
    try {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = zhHtml;

      const textNodes: Text[] = [];
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && node.textContent.trim()) textNodes.push(node as Text);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const tag = (node as Element).tagName.toLowerCase();
          if (tag === "img" || tag === "br" || tag === "hr") return;
          node.childNodes.forEach(walk);
        }
      };
      walk(tempDiv);

      const texts = textNodes.map((tn) => tn.textContent || "");
      const maxChunkLen = 1800;
      const batches: { start: number; end: number; text: string }[] = [];
      let batchStart = 0;
      let batchText = "";
      for (let i = 0; i < texts.length; i++) {
        const t = texts[i];
        if (batchText && (batchText.length + t.length) > maxChunkLen) {
          batches.push({ start: batchStart, end: i, text: batchText });
          batchStart = i;
          batchText = t;
        } else {
          batchText += t;
        }
      }
      if (batchText) batches.push({ start: batchStart, end: texts.length, text: batchText });

      const translatedBatches: string[] = [];
      for (const batch of batches) {
        const translated = await translateText(batch.text, "zh", "en");
        translatedBatches.push(translated);
      }

      const translatedTexts: string[] = [];
      for (let bi = 0; bi < batches.length; bi++) {
        const batch = batches[bi];
        const translated = translatedBatches[bi];
        if (batch.end - batch.start === 1) {
          translatedTexts.push(translated);
        } else {
          const origTexts = texts.slice(batch.start, batch.end);
          const origJoined = origTexts.join("");
          if (translated.length >= origJoined.length) {
            let pos = 0;
            for (let j = 0; j < origTexts.length; j++) {
              const ratio = origTexts[j].length / origJoined.length;
              const takeLen = Math.round(translated.length * ratio);
              const endPos = j === origTexts.length - 1 ? translated.length : Math.min(pos + takeLen, translated.length);
              translatedTexts.push(translated.substring(pos, endPos));
              pos = endPos;
            }
          } else {
            for (let j = 0; j < origTexts.length; j++) {
              translatedTexts.push(j === 0 ? translated : "");
            }
          }
        }
      }

      for (let i = 0; i < textNodes.length; i++) {
        const tn = textNodes[i];
        const translated = translatedTexts[i] || tn.textContent || "";
        const span = document.createElement("span");
        span.innerHTML = translated.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (tn.parentNode) tn.parentNode.replaceChild(span, tn);
      }

      const resultHtml = tempDiv.innerHTML;
      enContentBuf.current = resultHtml;
      onChangeEnRef.current(resultHtml);
      if (activeLang === "en") {
        const el = editorRef.current;
        if (el) {
          el.innerHTML = resultHtml;
          lastSetContentRef.current = resultHtml;
        }
      }
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setTranslating(false);
    }
  };

  const extractMetadataFromText = (text: string) => {
    if (!onExtractRef.current) return;
    const rawLines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (rawLines.length === 0) return;

    const lines = rawLines.map((l) => {
      const hMatch = /^#{1,6}\s+(.*)/.exec(l);
      if (hMatch) return hMatch[1].trim();
      const bqMatch = /^>\s*(.*)/.exec(l);
      if (bqMatch) return bqMatch[1].trim();
      return l.replace(/[*_`]/g, "").replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    });

    const headingPatterns = [
      /^第[一二三四五六七八九十\d]+[章节部分]/,
      /^[一二三四五六七八九十]+[、.．]\s*/,
      /^\d+[、.．]\s*/,
      /^(引言|前言|目录|总结|参考文献|附录|结语)/,
    ];
    const isHeadingLine = (t: string) => {
      if (!t || t.length > 80) return false;
      if (/[，。！？；;]$/.test(t)) return false;
      return headingPatterns.some((p) => p.test(t));
    };

    const titlePatterns = [
      /^(?:标题|title|文章标题)[：:\s]*(.+)$/i,
      /^(?:摘要|summary|简介|概述)[：:\s]*(.+)$/i,
      /^(?:关键词|关键字|keywords?|tags?)[：:\s]*(.+)$/i,
    ];

    let title = "";
    let summary = "";
    const tags: string[] = [];
    const bodyLines: string[] = [];
    let foundTitle = false;

    for (const line of lines) {
      if (!foundTitle && line.length > 3 && line.length < 100 && !isHeadingLine(line)) {
        let matched = false;
        for (const pattern of titlePatterns) {
          const m = pattern.exec(line);
          if (m) {
            if (pattern.source.includes("标题|title")) { title = m[1].trim(); foundTitle = true; matched = true; break; }
            if (pattern.source.includes("摘要|summary|简介|概述")) { summary = m[1].trim(); matched = true; break; }
            if (pattern.source.includes("关键词|关键字|keywords?|tags?")) {
              const extractedTags = m[1].split(/[,;，；、\s]+/).map((t) => t.trim()).filter((t) => t.length > 1 && t.length < 30);
              tags.push(...extractedTags);
              matched = true;
              break;
            }
          }
        }
        if (matched) continue;
      }

      if (!foundTitle && !title && line.length > 3 && line.length < 100) {
        title = line;
        foundTitle = true;
        continue;
      }

      if (!summary && line.length > 20 && line.length < 300 && !isHeadingLine(line)) {
        summary = line;
        continue;
      }

      bodyLines.push(line);
    }

    const techTerms = [
      "AI", "LLM", "GPT", "ChatGPT", "Claude", "Gemini", "Midjourney", "Copilot",
      "机器学习", "深度学习", "自然语言处理", "计算机视觉", "大模型", "人工智能",
      "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "AGI",
      "Prompt", "RAG", "Agent", "Multi-modal", "Python", "API", "SaaS",
      "产品设计", "用户体验", "数据驱动", "产品经理", "B2B", "B2C",
      "AI Agent", "大语言模型", "多模态", "AIGC", "生成式AI",
      "数字化转型", "智能制造", "数据分析", "用户增长",
      "需求分析", "PRD", "竞品分析", "用户画像", "A/B测试",
      "区块链", "Web3", "元宇宙", "IoT", "云计算", "边缘计算",
      "低代码", "无代码", "中台", "微服务", "DevOps",
      "人工智能", "自动驾驶", "机器人", "语音识别", "图像识别",
    ];
    const bodyText = bodyLines.join(" ");
    for (const term of techTerms) {
      if (bodyText.toLowerCase().includes(term.toLowerCase()) && !tags.includes(term)) {
        tags.push(term);
      }
    }

    const allText = [title, summary, ...bodyLines].join(" ");
    const seoKeywordPatterns = [
      /(?:如何|怎么|怎样|方法|技巧|指南|攻略)[：:\s]*(.+)/g,
      /(?:最佳|顶级|优秀|主流|热门|常见)[的]?(.{2,15})/g,
      /(?:对比|VS|比较|区别|差异)[：:\s]*(.+)/g,
      /(?:趋势|未来|发展|前景|展望)[：:\s]*(.+)/g,
    ];
    for (const pattern of seoKeywordPatterns) {
      let m;
      while ((m = pattern.exec(allText)) !== null) {
        const kw = m[1]?.trim().substring(0, 25);
        if (kw && kw.length > 2 && !tags.includes(kw)) {
          tags.push(kw);
        }
      }
    }

    let seoSummary = "";
    if (title && bodyLines.length > 0) {
      const firstBody = bodyLines.find((l) => l.length > 20 && l.length < 200) || bodyLines[0] || "";
      if (firstBody) {
        const trimmedBody = firstBody.length > 120 ? firstBody.substring(0, 117) + "..." : firstBody;
        seoSummary = `${title}：${trimmedBody}`;
        if (seoSummary.length > 160) {
          seoSummary = seoSummary.substring(0, 157) + "...";
        }
      }
    }

    const result: { title?: string; summary?: string; tags?: string[] } = {};
    if (title) result.title = title;
    if (seoSummary || summary) result.summary = seoSummary || summary;
    if (tags.length > 0) result.tags = tags.slice(0, 10);

    if (Object.keys(result).length > 0) {
      onExtractRef.current(result);
    }
  };

  const isMarkdownText = (text: string): boolean => {
    const t = text.trim();
    if (!t) return false;
    const lines = t.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) return false;
    let score = 0;
    for (const line of lines) {
      if (/^#{1,6}\s+/.test(line)) score += 2;
      else if (/^\|.*\|$/.test(line)) score += 3;
      else if (/^>\s/.test(line)) score += 2;
      else if (/^[-*+]\s+/.test(line)) score += 1;
      else if (/^\d+[.、）)]\s+/.test(line)) score += 1;
      else if (/!\[.*\]\(.*\)/.test(line)) score += 2;
      else if (/\[.*\]\(.*\)/.test(line)) score += 1;
      else if (/^\*\*[^*]+\*\*/.test(line)) score += 1;
      else if (/^```/.test(line)) score += 2;
      else if (/^[-]{3,}\s*$/.test(line) || /^[*]{3,}\s*$/.test(line)) score += 2;
    }
    return score >= 3;
  };

  const processMarkdownContent = (el: HTMLDivElement, mdText: string) => {
    const lines = mdText.split("\n");
    const frag = document.createDocumentFragment();
    let textBuf: string[] = [];
    let listItems: string[] = [];
    let listOrdered = false;
    let inTable = false;
    let tableRows: string[][] = [];
    let inCodeBlock = false;
    let codeLines: string[] = [];

    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;

    const applyInlineFormat = (text: string): string => {
      let result = text;
      result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;vertical-align:middle;margin:0 4px;" />');
      result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#60a5fa;text-decoration:underline;">$1</a>');
      result = result.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:700;color:#f1f5f9;">$1</strong>');
      result = result.replace(/\*([^*]+)\*/g, '<em style="font-style:italic;">$1</em>');
      result = result.replace(/`([^`]+)`/g, '<code style="font-family:Consolas,monospace;font-size:13px;background:#1e293b;padding:2px 6px;border-radius:3px;color:#e2e8f0;">$1</code>');
      return result;
    };

    const commitImage = (alt: string, src: string) => {
      const wrapper = document.createElement("div");
      wrapper.style.margin = "16px 0";
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "8px";
      img.style.display = "block";
      wrapper.appendChild(img);
      frag.appendChild(wrapper);
    };

    const commitText = () => {
      if (textBuf.length === 0) return;
      const p = document.createElement("p");
      p.style.lineHeight = "1.8";
      p.style.color = "#e2e8f0";
      p.style.textAlign = "justify";
      p.style.marginBottom = "12px";
      p.style.fontSize = "15px";
      p.innerHTML = applyInlineFormat(textBuf.join(" "));
      frag.appendChild(p);
      textBuf = [];
    };

    const commitList = () => {
      if (listItems.length === 0) return;
      const list = document.createElement(listOrdered ? "ol" : "ul");
      list.style.margin = "8px 0";
      list.style.paddingLeft = "24px";
      list.style.lineHeight = "1.8";
      list.style.color = "#e2e8f0";
      list.style.listStyleType = listOrdered ? "decimal" : "disc";
      listItems.forEach((t) => {
        const li = document.createElement("li");
        li.style.marginBottom = "4px";
        li.style.fontSize = "15px";
        li.innerHTML = applyInlineFormat(t);
        list.appendChild(li);
      });
      frag.appendChild(list);
      listItems = [];
    };

    const commitTable = () => {
      if (tableRows.length === 0) return;
      const wrapper = document.createElement("div");
      wrapper.style.overflowX = "auto";
      wrapper.style.margin = "16px 0";
      wrapper.style.borderRadius = "6px";
      wrapper.style.border = "1px solid #334155";
      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";
      table.style.fontSize = "14px";
      table.style.color = "#e2e8f0";
      tableRows.forEach((row, ri) => {
        const tr = document.createElement("tr");
        if (ri > 0) tr.style.borderTop = "1px solid #334155";
        row.forEach((cell, ci) => {
          const td = document.createElement(ri === 0 ? "th" : "td");
          td.style.padding = "10px 14px";
          td.style.textAlign = "left";
          if (ri === 0) {
            td.style.backgroundColor = "#1e293b";
            td.style.fontWeight = "600";
            td.style.color = "#f1f5f9";
            td.style.borderBottom = "2px solid #475569";
          } else {
            td.style.backgroundColor = ri % 2 === 0 ? "#0f172a" : "#1e293b";
          }
          if (ci < row.length - 1) td.style.borderRight = "1px solid #334155";
          td.innerHTML = applyInlineFormat(cell.trim());
          tr.appendChild(td);
        });
        table.appendChild(tr);
      });
      wrapper.appendChild(table);
      frag.appendChild(wrapper);
      tableRows = [];
      inTable = false;
    };

    const commitCodeBlock = () => {
      if (codeLines.length === 0) return;
      const pre = document.createElement("pre");
      pre.style.background = "#1e293b";
      pre.style.padding = "16px";
      pre.style.borderRadius = "6px";
      pre.style.overflowX = "auto";
      pre.style.margin = "12px 0";
      pre.style.border = "1px solid #334155";
      const code = document.createElement("code");
      code.style.fontFamily = "Consolas, Monaco, monospace";
      code.style.fontSize = "13px";
      code.style.color = "#e2e8f0";
      code.style.lineHeight = "1.6";
      code.textContent = codeLines.join("\n");
      pre.appendChild(code);
      frag.appendChild(pre);
      codeLines = [];
      inCodeBlock = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      const imgMatch = imageRegex.exec(trimmed);
      if (imgMatch && trimmed.startsWith("![")) {
        commitText(); commitList(); commitTable(); commitCodeBlock();
        commitImage(imgMatch[1], imgMatch[2]);
        continue;
      }

      if (trimmed.startsWith("```")) {
        if (inCodeBlock) { commitCodeBlock(); }
        else { commitText(); commitList(); commitTable(); inCodeBlock = true; }
        continue;
      }

      if (inCodeBlock) { codeLines.push(line); continue; }

      if (!trimmed) { commitText(); continue; }

      if (/^[-]{3,}\s*$/.test(trimmed) || /^[*]{3,}\s*$/.test(trimmed)) {
        commitText(); commitList(); commitTable();
        const hr = document.createElement("hr");
        hr.style.border = "none";
        hr.style.borderTop = "1px solid #334155";
        hr.style.margin = "24px 0";
        frag.appendChild(hr);
        continue;
      }

      const headingMatch = /^(#{1,3})\s+(.*)/.exec(trimmed);
      if (headingMatch) {
        commitText(); commitList(); commitTable();
        const level = headingMatch[1].length;
        const h = document.createElement("h3");
        h.style.margin = level === 1 ? "28px 0 14px 0" : "22px 0 12px 0";
        h.style.fontSize = level === 1 ? "22px" : level === 2 ? "19px" : "17px";
        h.style.fontWeight = "700";
        h.style.color = "#f1f5f9";
        h.style.letterSpacing = "0.02em";
        if (level <= 2) {
          h.style.borderBottom = level === 1 ? "2px solid #475569" : "1px solid #334155";
          h.style.paddingBottom = "8px";
        }
        h.textContent = headingMatch[2];
        frag.appendChild(h);
        continue;
      }

      if (/^\|.*\|$/.test(trimmed)) {
        if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue;
        commitText(); commitList();
        const cells = trimmed.split("|").filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        tableRows.push(cells);
        inTable = true;
        continue;
      } else if (inTable) { commitTable(); }

      if (/^>\s*/.test(trimmed)) {
        commitText(); commitList(); commitTable();
        const bqText = trimmed.replace(/^>\s*/, "");
        const bq = document.createElement("blockquote");
        bq.style.borderLeft = "4px solid #475569";
        bq.style.paddingLeft = "16px";
        bq.style.margin = "14px 0";
        bq.style.color = "#94a3b8";
        bq.style.fontStyle = "italic";
        bq.style.lineHeight = "1.8";
        bq.style.fontSize = "15px";
        bq.innerHTML = applyInlineFormat(bqText);
        frag.appendChild(bq);
        continue;
      }

      const numberedMatch = /^(\d+[.、）)]\s*)(.*)/.exec(trimmed);
      const bulletMatch = /^([-•·]\s*)(.*)/.exec(trimmed);

      if (numberedMatch || bulletMatch) {
        commitText(); commitTable();
        const itemText = numberedMatch ? numberedMatch[2] : bulletMatch![2];
        const isOrdered = !!numberedMatch;
        if (listItems.length > 0 && listOrdered !== isOrdered) { commitList(); }
        listOrdered = isOrdered;
        listItems.push(itemText);
        continue;
      }

      if (listItems.length > 0) commitList();

      textBuf.push(trimmed);
    }

    commitText(); commitList(); commitTable(); commitCodeBlock();

    el.innerHTML = "";
    el.appendChild(frag);
    handleInput();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const rawHtml = e.clipboardData.getData("text/html");
    const rawText = e.clipboardData.getData("text/plain");
    const html = rawHtml ? rawHtml.replace(/\r\n/g, "\n").replace(/\r/g, "\n") : "";
    const text = rawText ? rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n") : "";

    const el = editorRef.current;

    // 优先检查纯文本是否为 Markdown，无论是否有 HTML 内容
    if (text && el && isMarkdownText(text)) {
      processMarkdownContent(el, text);
      const plainForMeta = text
        .replace(/^#{1,6}\s+/gm, "")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/[*_`]/g, "")
        .replace(/^>\s*/gm, "")
        .replace(/^\|.*\|$/gm, "")
        .replace(/^[-]{3,}\s*$/gm, "");
      if (plainForMeta.trim().length > 20) {
        setTimeout(() => extractMetadataFromText(plainForMeta), 100);
      }
      return;
    }

    if (html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const body = doc.body;

      const images: { src: string; alt: string }[] = [];
      const walkImgs = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName.toLowerCase() === "img") {
            const img = el as HTMLImageElement;
            const src = img.src || img.getAttribute("src") || "";
            if (src && !src.startsWith("data:")) images.push({ src, alt: img.alt || "" });
          }
        }
        node.childNodes.forEach(walkImgs);
      };
      walkImgs(body);

      const parts: string[] = [];
      const walk = (node: Node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          const t = node.textContent || "";
          if (t.trim()) parts.push(t.trim());
          return;
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (tag === "img" || tag === "script" || tag === "style" || tag === "noscript") return;

        // Preserve inline formatting as markdown markers
        if (tag === "strong" || tag === "b") {
          parts.push("**");
          el.childNodes.forEach(walk);
          parts.push("**");
          return;
        }
        if (tag === "em" || tag === "i") {
          parts.push("*");
          el.childNodes.forEach(walk);
          parts.push("*");
          return;
        }
        if (tag === "code") {
          parts.push("`");
          el.childNodes.forEach(walk);
          parts.push("`");
          return;
        }

        let prefix = "";
        let suffix = "";
        let block = false;

        if (/^h[1-6]$/.test(tag)) {
          const level = parseInt(tag[1]);
          prefix = "#".repeat(Math.min(level, 3)) + " ";
          block = true;
        } else if (tag === "p" || tag === "div") {
          block = true;
        } else if (tag === "li") {
          prefix = "- ";
          block = true;
        } else if (tag === "br") {
          parts.push("\n");
          return;
        } else if (tag === "blockquote") {
          prefix = "> ";
          block = true;
        } else if (tag === "tr") {
          block = true;
        } else if (tag === "td" || tag === "th") {
          prefix = "| ";
          suffix = " ";
        }

        if (block) parts.push("\n");
        parts.push(prefix);
        el.childNodes.forEach(walk);
        if (suffix) parts.push(suffix);
        if (block) parts.push("\n");
      };
      body.childNodes.forEach(walk);

      let convertedText = parts.join("").replace(/\n{3,}/g, "\n\n").trim();

      // Fallback: if converted text has no line breaks but raw HTML text has markdown, use raw text
      if (!convertedText.includes("\n") && convertedText.length > 0) {
        const rawHtmlText = body.textContent || body.innerText || "";
        if (rawHtmlText.includes("\n") || /#{1,3}\s/.test(rawHtmlText)) {
          convertedText = rawHtmlText.trim();
        }
      }

      if (images.length > 0) {
        const imgLines = images.map(i => `![${i.alt}](${i.src})`).join("\n");
        convertedText = imgLines + "\n\n" + convertedText;
      }

      if (!convertedText && el) {
        // No structured content extracted, fall back to raw text
        const rawText = body.textContent || body.innerText || "";
        if (rawText.trim()) {
          document.execCommand("insertText", false, rawText.trim());
          handleInput();
          if (rawText.trim().length > 20) {
            setTimeout(() => extractMetadataFromText(rawText.trim()), 100);
          }
        }
        return;
      }

      if (convertedText && el) {
        // If the converted text looks like markdown, process it as markdown
        if (isMarkdownText(convertedText)) {
          processMarkdownContent(el, convertedText);
        } else if (text && isMarkdownText(text)) {
          // HTML conversion lost the markdown structure — use original plain text
          processMarkdownContent(el, text);
        } else {
          // Plain text — wrap in paragraphs with inline formatting preserved
          const lines = convertedText.split("\n\n").filter(l => l.trim());
          const frag = document.createDocumentFragment();
          lines.forEach(line => {
            const p = document.createElement("p");
            p.style.lineHeight = "1.8";
            p.style.color = "#e2e8f0";
            p.style.textAlign = "justify";
            p.style.marginBottom = "12px";
            p.style.fontSize = "15px";
            // Apply basic inline formatting
            let formatted = line.trim()
              .replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:700;color:#f1f5f9;">$1</strong>')
              .replace(/\*([^*]+)\*/g, '<em style="font-style:italic;">$1</em>')
              .replace(/`([^`]+)`/g, '<code style="font-family:Consolas,monospace;font-size:13px;background:#1e293b;padding:2px 6px;border-radius:3px;color:#e2e8f0;">$1</code>');
            p.innerHTML = formatted;
            frag.appendChild(p);
          });
          el.innerHTML = "";
          el.appendChild(frag);
          handleInput();
        }
        if (convertedText.trim().length > 20) {
          setTimeout(() => extractMetadataFromText(convertedText), 100);
        }
      }
    } else if (text) {
      if (el && isMarkdownText(text)) {
        processMarkdownContent(el, text);
      } else {
        document.execCommand("insertText", false, text);
      }
    }

    handleInput();

    const pasteText = text || (html ? new DOMParser().parseFromString(html, "text/html").body.textContent || "" : "");
    if (pasteText.trim().length > 20) {
      setTimeout(() => extractMetadataFromText(pasteText), 100);
    }
  };

  const optimizeContent = () => {
    const el = editorRef.current;
    if (!el || !el.innerHTML.trim()) return;

    const rawHtml = el.innerHTML;
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = rawHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || "";

    const isMarkdown = /(^|\n)\s*(#{1,3}\s|---|\|.*\||>\s|```|\*\*|`)/.test(plainText);

    if (isMarkdown) {
      const htmlImages: { src: string; alt: string; parentText: string }[] = [];
      const walkForImages = (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.tagName.toLowerCase() === "img") {
            const img = el as HTMLImageElement;
            htmlImages.push({
              src: img.src || img.getAttribute("src") || "",
              alt: img.alt || img.getAttribute("alt") || "",
              parentText: (el.parentElement?.textContent || "").trim().substring(0, 60),
            });
          }
        }
        node.childNodes.forEach(walkForImages);
      };
      walkForImages(tempDiv);

      const lines = plainText.split("\n");
      const frag = document.createDocumentFragment();
      let textBuf: string[] = [];
      let listItems: string[] = [];
      let listOrdered = false;
      let inTable = false;
      let tableRows: string[][] = [];
      let inCodeBlock = false;
      let codeLines: string[] = [];

      const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/;

      const applyInlineFormat = (text: string): string => {
        let result = text;
        result = result.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:700;color:#f1f5f9;">$1</strong>');
        result = result.replace(/\*([^*]+)\*/g, '<em style="font-style:italic;">$1</em>');
        result = result.replace(/`([^`]+)`/g, '<code style="font-family:Consolas,monospace;font-size:13px;background:#1e293b;padding:2px 6px;border-radius:3px;color:#e2e8f0;">$1</code>');
        result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:8px;vertical-align:middle;margin:0 4px;" />');
        return result;
      };

      const commitImage = (alt: string, src: string) => {
        const wrapper = document.createElement("div");
        wrapper.style.margin = "16px 0";
        const img = document.createElement("img");
        img.src = src;
        img.alt = alt;
        img.style.maxWidth = "100%";
        img.style.borderRadius = "8px";
        img.style.display = "block";
        wrapper.appendChild(img);
        frag.appendChild(wrapper);
      };

      const commitText = () => {
        if (textBuf.length === 0) return;
        const p = document.createElement("p");
        p.style.lineHeight = "1.8";
        p.style.color = "#e2e8f0";
        p.style.textAlign = "justify";
        p.style.marginBottom = "12px";
        p.style.fontSize = "15px";
        p.innerHTML = applyInlineFormat(textBuf.join(" "));
        frag.appendChild(p);
        textBuf = [];
      };

      const commitList = () => {
        if (listItems.length === 0) return;
        const list = document.createElement(listOrdered ? "ol" : "ul");
        list.style.margin = "8px 0";
        list.style.paddingLeft = "24px";
        list.style.lineHeight = "1.8";
        list.style.color = "#e2e8f0";
        list.style.listStyleType = listOrdered ? "decimal" : "disc";
        listItems.forEach((t) => {
          const li = document.createElement("li");
          li.style.marginBottom = "4px";
          li.style.fontSize = "15px";
          li.innerHTML = applyInlineFormat(t);
          list.appendChild(li);
        });
        frag.appendChild(list);
        listItems = [];
      };

      const commitTable = () => {
        if (tableRows.length === 0) return;
        const wrapper = document.createElement("div");
        wrapper.style.overflowX = "auto";
        wrapper.style.margin = "16px 0";
        wrapper.style.borderRadius = "6px";
        wrapper.style.border = "1px solid #334155";
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.fontSize = "14px";
        table.style.color = "#e2e8f0";
        tableRows.forEach((row, ri) => {
          const tr = document.createElement("tr");
          if (ri > 0) {
            tr.style.borderTop = "1px solid #334155";
          }
          row.forEach((cell, ci) => {
            const td = document.createElement(ri === 0 ? "th" : "td");
            td.style.padding = "10px 14px";
            td.style.textAlign = "left";
            if (ri === 0) {
              td.style.backgroundColor = "#1e293b";
              td.style.fontWeight = "600";
              td.style.color = "#f1f5f9";
              td.style.borderBottom = "2px solid #475569";
            } else {
              td.style.backgroundColor = ri % 2 === 0 ? "#0f172a" : "#1e293b";
            }
            if (ci < row.length - 1) {
              td.style.borderRight = "1px solid #334155";
            }
            td.innerHTML = applyInlineFormat(cell.trim());
            tr.appendChild(td);
          });
          table.appendChild(tr);
        });
        wrapper.appendChild(table);
        frag.appendChild(wrapper);
        tableRows = [];
        inTable = false;
      };

      const commitCodeBlock = () => {
        if (codeLines.length === 0) return;
        const pre = document.createElement("pre");
        pre.style.background = "#1e293b";
        pre.style.padding = "16px";
        pre.style.borderRadius = "6px";
        pre.style.overflowX = "auto";
        pre.style.margin = "12px 0";
        pre.style.border = "1px solid #334155";
        const code = document.createElement("code");
        code.style.fontFamily = "Consolas, Monaco, monospace";
        code.style.fontSize = "13px";
        code.style.color = "#e2e8f0";
        code.style.lineHeight = "1.6";
        code.textContent = codeLines.join("\n");
        pre.appendChild(code);
        frag.appendChild(pre);
        codeLines = [];
        inCodeBlock = false;
      };

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        const imgMatch = imageRegex.exec(trimmed);
        if (imgMatch && trimmed.startsWith("![")) {
          commitText();
          commitList();
          commitTable();
          commitCodeBlock();
          commitImage(imgMatch[1], imgMatch[2]);
          continue;
        }

        if (trimmed.startsWith("```")) {
          if (inCodeBlock) {
            commitCodeBlock();
          } else {
            commitText();
            commitList();
            commitTable();
            inCodeBlock = true;
          }
          continue;
        }

        if (inCodeBlock) {
          codeLines.push(line);
          continue;
        }

        if (!trimmed) {
          commitText();
          continue;
        }

        if (/^[-]{3,}\s*$/.test(trimmed) || /^[*]{3,}\s*$/.test(trimmed)) {
          commitText();
          commitList();
          commitTable();
          const hr = document.createElement("hr");
          hr.style.border = "none";
          hr.style.borderTop = "1px solid #334155";
          hr.style.margin = "24px 0";
          frag.appendChild(hr);
          continue;
        }

        const headingMatch = /^(#{1,3})\s+(.*)/.exec(trimmed);
        if (headingMatch) {
          commitText();
          commitList();
          commitTable();
          const level = headingMatch[1].length;
          const h = document.createElement("h3");
          h.style.margin = level === 1 ? "28px 0 14px 0" : "22px 0 12px 0";
          h.style.fontSize = level === 1 ? "22px" : level === 2 ? "19px" : "17px";
          h.style.fontWeight = "700";
          h.style.color = "#f1f5f9";
          h.style.letterSpacing = "0.02em";
          if (level <= 2) {
            h.style.borderBottom = level === 1 ? "2px solid #475569" : "1px solid #334155";
            h.style.paddingBottom = "8px";
          }
          h.textContent = headingMatch[2];
          frag.appendChild(h);
          continue;
        }

        if (/^\|.*\|$/.test(trimmed)) {
          if (/^\|[\s\-:|]+\|$/.test(trimmed)) continue;
          commitText();
          commitList();
          const cells = trimmed.split("|").filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          tableRows.push(cells);
          inTable = true;
          continue;
        } else if (inTable) {
          commitTable();
        }

        if (/^>\s*/.test(trimmed)) {
          commitText();
          commitList();
          commitTable();
          const bqText = trimmed.replace(/^>\s*/, "");
          const bq = document.createElement("blockquote");
          bq.style.borderLeft = "4px solid #475569";
          bq.style.paddingLeft = "16px";
          bq.style.margin = "14px 0";
          bq.style.color = "#94a3b8";
          bq.style.fontStyle = "italic";
          bq.style.lineHeight = "1.8";
          bq.style.fontSize = "15px";
          bq.innerHTML = applyInlineFormat(bqText);
          frag.appendChild(bq);
          continue;
        }

        const numberedMatch = /^(\d+[.、）)]\s*)(.*)/.exec(trimmed);
        const bulletMatch = /^([-•·]\s*)(.*)/.exec(trimmed);

        if (numberedMatch || bulletMatch) {
          commitText();
          commitTable();
          const itemText = numberedMatch ? numberedMatch[2] : bulletMatch![2];
          const isOrdered = !!numberedMatch;
          if (listItems.length > 0 && listOrdered !== isOrdered) {
            commitList();
          }
          listOrdered = isOrdered;
          listItems.push(itemText);
          continue;
        }

        if (listItems.length > 0) commitList();

        textBuf.push(trimmed);
      }

      commitText();
      commitList();
      commitTable();
      commitCodeBlock();

      htmlImages.forEach((imgInfo) => {
        if (imgInfo.src) {
          const wrapper = document.createElement("div");
          wrapper.style.margin = "16px 0";
          const img = document.createElement("img");
          img.src = imgInfo.src;
          img.alt = imgInfo.alt;
          img.style.maxWidth = "100%";
          img.style.borderRadius = "8px";
          img.style.display = "block";
          wrapper.appendChild(img);
          frag.appendChild(wrapper);
        }
      });

      el.innerHTML = "";
      el.appendChild(frag);
      handleInput();
      return;
    }

    const root = document.createElement("div");
    root.innerHTML = rawHtml;

    const headingPatterns = [
      /^第[一二三四五六七八九十\d]+[章节部分]/,
      /^[一二三四五六七八九十]+[、.．]\s*/,
      /^\d+[、.．]\s*/,
      /^(引言|前言|目录|总结|参考文献|附录|结语)/,
    ];
    const isHeading = (text: string) => {
      const t = text.trim();
      if (!t || t.length > 80) return false;
      if (/[，。！？；;]$/.test(t)) return false;
      return headingPatterns.some((p) => p.test(t));
    };

    interface ImageInfo {
      src: string;
      alt: string;
      order: number;
    }
    const allImages: ImageInfo[] = [];
    let imgOrder = 0;
    const walkImages = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName.toLowerCase() === "img") {
          const img = el as HTMLImageElement;
          allImages.push({
            src: img.src || img.getAttribute("src") || "",
            alt: img.alt || img.getAttribute("alt") || "",
            order: imgOrder++,
          });
        }
      }
      node.childNodes.forEach(walkImages);
    };
    walkImages(root);

    const frag = document.createDocumentFragment();

    const makeHeading = (text: string, level: number) => {
      const h = document.createElement("h3");
      h.style.margin = level === 1 ? "28px 0 14px 0" : "22px 0 12px 0";
      h.style.fontSize = level === 1 ? "22px" : level === 2 ? "19px" : "17px";
      h.style.fontWeight = "700";
      h.style.color = "#f1f5f9";
      h.style.letterSpacing = "0.02em";
      if (level <= 2) {
        h.style.borderBottom = level === 1 ? "2px solid #475569" : "1px solid #334155";
        h.style.paddingBottom = "8px";
      }
      h.textContent = text;
      frag.appendChild(h);
    };

    const makeParagraph = (text: string) => {
      const p = document.createElement("p");
      p.style.lineHeight = "1.8";
      p.style.color = "#e2e8f0";
      p.style.textAlign = "justify";
      p.style.marginBottom = "12px";
      p.style.fontSize = "15px";
      p.textContent = text;
      frag.appendChild(p);
    };

    const makeImage = (src: string, alt: string) => {
      if (!src) return;
      const wrapper = document.createElement("div");
      wrapper.style.margin = "16px 0";
      const img = document.createElement("img");
      img.src = src;
      img.alt = alt;
      img.style.maxWidth = "100%";
      img.style.borderRadius = "8px";
      img.style.display = "block";
      wrapper.appendChild(img);
      frag.appendChild(wrapper);
    };

    const makeList = (items: string[], ordered: boolean) => {
      if (items.length === 0) return;
      const list = document.createElement(ordered ? "ol" : "ul");
      list.style.margin = "8px 0";
      list.style.paddingLeft = "24px";
      list.style.lineHeight = "1.8";
      list.style.color = "#e2e8f0";
      list.style.listStyleType = ordered ? "decimal" : "disc";
      items.forEach((text) => {
        const li = document.createElement("li");
        li.style.marginBottom = "4px";
        li.style.fontSize = "15px";
        li.textContent = text;
        list.appendChild(li);
      });
      frag.appendChild(list);
    };

    const makeHr = () => {
      const hr = document.createElement("hr");
      hr.style.border = "none";
      hr.style.borderTop = "1px solid #334155";
      hr.style.margin = "24px 0";
      frag.appendChild(hr);
    };

    const processNode = (node: Node, textBuf: string[], listBuf: string[], listOrderedRef: { current: boolean }) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim() || "";
        if (text) textBuf.push(text);
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();

      if (tag === "img") {
        if (textBuf.length > 0) {
          makeParagraph(textBuf.join(" "));
          textBuf.length = 0;
        }
        if (listBuf.length > 0) {
          makeList(listBuf, listOrderedRef.current);
          listBuf.length = 0;
        }
        const img = el as HTMLImageElement;
        makeImage(img.src || img.getAttribute("src") || "", img.alt || img.getAttribute("alt") || "");
        return;
      }

      if (tag === "br") return;

      if (tag === "hr") {
        if (textBuf.length > 0) { makeParagraph(textBuf.join(" ")); textBuf.length = 0; }
        if (listBuf.length > 0) { makeList(listBuf, listOrderedRef.current); listBuf.length = 0; }
        makeHr();
        return;
      }

      if (tag === "h1" || tag === "h2" || tag === "h3") {
        if (textBuf.length > 0) { makeParagraph(textBuf.join(" ")); textBuf.length = 0; }
        if (listBuf.length > 0) { makeList(listBuf, listOrderedRef.current); listBuf.length = 0; }
        const text = (el.textContent || "").trim();
        if (text) makeHeading(text, tag === "h1" ? 1 : tag === "h2" ? 2 : 3);
        return;
      }

      if (tag === "ul" || tag === "ol") {
        if (textBuf.length > 0) { makeParagraph(textBuf.join(" ")); textBuf.length = 0; }
        if (listBuf.length > 0) { makeList(listBuf, listOrderedRef.current); listBuf.length = 0; }
        const ordered = tag === "ol";
        const items: string[] = [];
        el.querySelectorAll("li").forEach((li) => {
          const t = li.textContent?.trim();
          if (t) items.push(t);
        });
        if (items.length > 0) makeList(items, ordered);
        return;
      }

      if (tag === "table") {
        if (textBuf.length > 0) { makeParagraph(textBuf.join(" ")); textBuf.length = 0; }
        if (listBuf.length > 0) { makeList(listBuf, listOrderedRef.current); listBuf.length = 0; }
        const wrapper = document.createElement("div");
        wrapper.style.overflowX = "auto";
        wrapper.style.margin = "16px 0";
        wrapper.style.borderRadius = "6px";
        wrapper.style.border = "1px solid #334155";
        const table = document.createElement("table");
        table.style.width = "100%";
        table.style.borderCollapse = "collapse";
        table.style.fontSize = "14px";
        table.style.color = "#e2e8f0";
        const rows = el.querySelectorAll("tr");
        rows.forEach((tr, ri) => {
          const trEl = document.createElement("tr");
          if (ri > 0) trEl.style.borderTop = "1px solid #334155";
          const cells = tr.querySelectorAll("th, td");
          cells.forEach((cell, ci) => {
            const td = document.createElement(ri === 0 ? "th" : "td");
            td.style.padding = "10px 14px";
            td.style.textAlign = "left";
            if (ri === 0) {
              td.style.backgroundColor = "#1e293b";
              td.style.fontWeight = "600";
              td.style.color = "#f1f5f9";
              td.style.borderBottom = "2px solid #475569";
            } else {
              td.style.backgroundColor = ri % 2 === 0 ? "#0f172a" : "#1e293b";
            }
            if (ci < cells.length - 1) td.style.borderRight = "1px solid #334155";
            td.textContent = cell.textContent?.trim() || "";
            trEl.appendChild(td);
          });
          table.appendChild(trEl);
        });
        wrapper.appendChild(table);
        frag.appendChild(wrapper);
        return;
      }

      if (tag === "blockquote") {
        if (textBuf.length > 0) { makeParagraph(textBuf.join(" ")); textBuf.length = 0; }
        if (listBuf.length > 0) { makeList(listBuf, listOrderedRef.current); listBuf.length = 0; }
        const text = (el.textContent || "").trim();
        if (text) {
          const bq = document.createElement("blockquote");
          bq.style.borderLeft = "4px solid #475569";
          bq.style.paddingLeft = "16px";
          bq.style.margin = "14px 0";
          bq.style.color = "#94a3b8";
          bq.style.fontStyle = "italic";
          bq.style.lineHeight = "1.8";
          bq.style.fontSize = "15px";
          bq.textContent = text;
          frag.appendChild(bq);
        }
        return;
      }

      if (tag === "pre" || tag === "code") {
        if (textBuf.length > 0) { makeParagraph(textBuf.join(" ")); textBuf.length = 0; }
        if (listBuf.length > 0) { makeList(listBuf, listOrderedRef.current); listBuf.length = 0; }
        const text = el.textContent || "";
        if (text.trim()) {
          const pre = document.createElement("pre");
          pre.style.background = "#1e293b";
          pre.style.padding = "16px";
          pre.style.borderRadius = "6px";
          pre.style.overflowX = "auto";
          pre.style.margin = "12px 0";
          pre.style.border = "1px solid #334155";
          const code = document.createElement("code");
          code.style.fontFamily = "Consolas, Monaco, monospace";
          code.style.fontSize = "13px";
          code.style.color = "#e2e8f0";
          code.style.lineHeight = "1.6";
          code.textContent = text.trim();
          pre.appendChild(code);
          frag.appendChild(pre);
        }
        return;
      }

      const text = (el.textContent || "").trim();
      if (!text && tag !== "div" && tag !== "span" && tag !== "p") return;

      if (isHeading(text) && (tag === "p" || tag === "div" || tag === "span")) {
        if (textBuf.length > 0) { makeParagraph(textBuf.join(" ")); textBuf.length = 0; }
        if (listBuf.length > 0) { makeList(listBuf, listOrderedRef.current); listBuf.length = 0; }
        makeHeading(text, 3);
        return;
      }

      const numberedItem = /^(\d+[.、）)]\s*)(.*)/.exec(text);
      const bulletItem = /^([-•·]\s*)(.*)/.exec(text);

      if (numberedItem || bulletItem) {
        if (textBuf.length > 0) { makeParagraph(textBuf.join(" ")); textBuf.length = 0; }
        const itemText = numberedItem ? numberedItem[2] : bulletItem![2];
        const isOrdered = !!numberedItem;
        if (listBuf.length > 0 && listOrderedRef.current !== isOrdered) {
          makeList(listBuf, listOrderedRef.current);
          listBuf.length = 0;
        }
        listOrderedRef.current = isOrdered;
        listBuf.push(itemText);
        return;
      }

      if (listBuf.length > 0) {
        makeList(listBuf, listOrderedRef.current);
        listBuf.length = 0;
      }

      if (tag === "p" || tag === "div" || tag === "span" || tag === "section" || tag === "article" || tag === "main") {
        const childTextNodes: string[] = [];
        let hasOnlyText = true;
        el.childNodes.forEach((child) => {
          if (child.nodeType === Node.TEXT_NODE) {
            const t = child.textContent?.trim();
            if (t) childTextNodes.push(t);
          } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childTag = (child as HTMLElement).tagName.toLowerCase();
            if (childTag === "img") {
              hasOnlyText = false;
            } else if (childTag === "br") {
              // skip
            } else if (childTag === "strong" || childTag === "b" || childTag === "em" || childTag === "i" || childTag === "u" || childTag === "span" || childTag === "font" || childTag === "a") {
              const ct = (child as HTMLElement).textContent?.trim();
              if (ct) childTextNodes.push(ct);
            } else {
              hasOnlyText = false;
            }
          }
        });

        if (hasOnlyText && childTextNodes.length > 0) {
          textBuf.push(childTextNodes.join(" "));
        } else {
          if (childTextNodes.length > 0) {
            textBuf.push(childTextNodes.join(" "));
          }
          el.childNodes.forEach((child) => {
            if (child.nodeType === Node.ELEMENT_NODE) {
              const childTag = (child as HTMLElement).tagName.toLowerCase();
              if (childTag === "img" || childTag === "table" || childTag === "ul" || childTag === "ol" || childTag === "blockquote" || childTag === "pre" || childTag === "h1" || childTag === "h2" || childTag === "h3" || childTag === "h4" || childTag === "hr") {
                if (textBuf.length > 0) { makeParagraph(textBuf.join(" ")); textBuf.length = 0; }
                if (listBuf.length > 0) { makeList(listBuf, listOrderedRef.current); listBuf.length = 0; }
                processNode(child, textBuf, listBuf, listOrderedRef);
              }
            }
          });
        }
      } else {
        if (text) textBuf.push(text);
      }
    };

    const textBuf: string[] = [];
    const listBuf: string[] = [];
    const listOrderedRef = { current: false };

    root.childNodes.forEach((node) => {
      processNode(node, textBuf, listBuf, listOrderedRef);
    });

    if (textBuf.length > 0) makeParagraph(textBuf.join(" "));
    if (listBuf.length > 0) makeList(listBuf, listOrderedRef.current);

    el.innerHTML = "";
    el.appendChild(frag);
    handleInput();
  };

  const btnClass = "rounded px-2 py-1 text-xs text-slate-400 hover:bg-slate-700 hover:text-white transition-colors";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex rounded-lg border border-slate-700 bg-slate-800 p-0.5">
          <button
            type="button"
            onClick={() => handleLangSwitch("zh")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${activeLang === "zh" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            {isZh ? "中文内容" : "Chinese"}
          </button>
          <button
            type="button"
            onClick={() => handleLangSwitch("en")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${activeLang === "en" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
          >
            {isZh ? "英文内容" : "English"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800">
        <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-700 px-2 py-1.5">
          <button type="button" onClick={() => execCmd("bold")} className={btnClass} title="Bold"><b>B</b></button>
          <button type="button" onClick={() => execCmd("italic")} className={btnClass} title="Italic"><i>I</i></button>
          <button type="button" onClick={() => execCmd("underline")} className={btnClass} title="Underline"><u>U</u></button>
          <span className="mx-1 h-4 w-px bg-slate-700" />
          <button type="button" onClick={() => execCmd("formatBlock", "H2")} className={btnClass} title="Heading">H2</button>
          <button type="button" onClick={() => execCmd("formatBlock", "H3")} className={btnClass} title="Subheading">H3</button>
          <button type="button" onClick={() => execCmd("formatBlock", "P")} className={btnClass} title="Paragraph">P</button>
          <span className="mx-1 h-4 w-px bg-slate-700" />
          <button type="button" onClick={() => execCmd("insertUnorderedList")} className={btnClass} title="Bullet List">• List</button>
          <button type="button" onClick={() => execCmd("insertOrderedList")} className={btnClass} title="Numbered List">1. List</button>
          <span className="mx-1 h-4 w-px bg-slate-700" />
          <button type="button" onClick={insertImage} className={btnClass} title="Insert Image">
            {isZh ? "插入图片" : "Image"}
          </button>
          <span className="mx-1 h-4 w-px bg-slate-700" />
          <button type="button" onClick={translateContent} disabled={translating} className="rounded px-2 py-1 text-xs text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 transition-colors disabled:opacity-50" title={isZh ? "翻译为英文" : "Translate to English"}>
            {translating ? (isZh ? "翻译中..." : "Translating...") : (isZh ? "🌐 翻译为英文" : "🌐 Translate")}
          </button>
          <span className="mx-1 h-4 w-px bg-slate-700" />
          <button type="button" onClick={optimizeContent} className="rounded px-2 py-1 text-xs text-amber-400 hover:bg-amber-500/10 hover:text-amber-300 transition-colors" title={isZh ? "一键优化排版" : "Optimize layout"}>
            {isZh ? "✨ 优化排版" : "✨ Optimize"}
          </button>
        </div>
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          onPaste={handlePaste}
          className="prose prose-invert prose-sm max-w-none min-h-[240px] max-h-[400px] overflow-y-auto px-4 py-3 text-slate-200 outline-none [&_img]:max-w-full [&_img]:rounded-lg [&_img]:my-2 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-white [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-white [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:mb-2 [&_p]:leading-relaxed"
          data-placeholder={isZh ? "在此编辑内容，或使用工具栏插入图片..." : "Edit content here, or use toolbar to insert images..."}
        />
      </div>
    </div>
  );
}

function ArticleForm({ article, isZh, onSave, onCancel }: { article: Article | null; isZh: boolean; onSave: (data: Omit<Article, "id" | "articleNo" | "createdAt" | "updatedAt">) => void; onCancel: () => void }) {
  const [form, setForm] = useState(article ? { titleZh: article.titleZh, titleEn: article.titleEn, summaryZh: article.summaryZh, summaryEn: article.summaryEn, contentZh: article.contentZh, contentEn: article.contentEn, coverImage: article.coverImage, category: article.category, tags: article.tags, published: article.published, featured: article.featured } : { ...emptyArticle });

  const [pdfParsing, setPdfParsing] = useState(false);
  const [pdfProgress, setPdfProgress] = useState("");
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [pdfError, setPdfError] = useState("");
  const [mdParsing, setMdParsing] = useState(false);
  const [mdError, setMdError] = useState("");
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [contentVersion, setContentVersion] = useState(0);
  const [previewExpanded, setPreviewExpanded] = useState(false);
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

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-10" onClick={onCancel}>
      <div className="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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

          {/* Cover Image with picker */}
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
                {pdfPages.length > 0 && (
                  <button type="button" onClick={() => setShowCoverPicker(!showCoverPicker)} className="text-xs text-blue-400 hover:text-blue-300">
                    {isZh ? "从 PDF 页面选择封面" : "Choose cover from PDF pages"}
                  </button>
                )}
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
          <button onClick={onCancel} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors">{isZh ? "取消" : "Cancel"}</button>
          <button onClick={() => onSave(form)} className="btn-primary text-sm">{isZh ? "保存" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
