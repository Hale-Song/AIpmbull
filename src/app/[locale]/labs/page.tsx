"use client";

import { useMemo, useState } from "react";
import { usePublishedLabs } from "@/hooks/use-store-data";

const categories: Record<string, { zh: string; en: string }> = {
  prompt: { zh: "Prompt", en: "Prompt" },
  rag: { zh: "RAG", en: "RAG" },
  prd: { zh: "需求", en: "PRD" },
  eval: { zh: "评测", en: "Eval" },
};

function extractVars(template: string): string[] {
  const found = new Set<string>();
  const re = /{{\s*([\w\u4e00-\u9fa5]+)\s*}}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template))) found.add(m[1]);
  return Array.from(found);
}

export default function LabsPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const { labs, loaded } = usePublishedLabs();
  const [activeId, setActiveId] = useState<string>("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const active = labs.find((l) => l.id === activeId) || labs[0];
  const vars = useMemo(() => (active ? Array.from(new Set([...(active.variables ? active.variables.split(/[,，]/).map((v) => v.trim()).filter(Boolean) : []), ...extractVars(active.template)])) : []), [active]);

  const output = useMemo(() => {
    if (!active) return "";
    return active.template.replace(/{{\s*([\w\u4e00-\u9fa5]+)\s*}}/g, (_, k) => values[k]?.trim() || `{{${k}}}`);
  }, [active, values]);

  const selectTemplate = (id: string) => { setActiveId(id); setValues({}); setCopied(false); };

  const copy = async () => {
    try { await navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "AI 实验室" : "AI Lab"}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {isZh ? "在线 Prompt 调试台：选择模板、填充变量，实时生成可复制的结构化提示词。" : "Online prompt debugger: pick a template, fill the variables and get a copy-ready structured prompt."}
          </p>
        </div>

        {loaded && labs.length === 0 ? (
          <p className="py-20 text-center text-slate-500">{isZh ? "暂无模板" : "No templates yet"}</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-2">
              {labs.map((lab) => {
                const isActive = active?.id === lab.id;
                return (
                  <button
                    key={lab.id}
                    onClick={() => selectTemplate(lab.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${isActive ? "border-blue-500/50 bg-blue-500/5" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${isActive ? "text-blue-400" : "text-white"}`}>{isZh ? lab.nameZh : lab.nameEn}</h3>
                      {lab.category && <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{categories[lab.category]?.[isZh ? "zh" : "en"] || lab.category}</span>}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{isZh ? lab.descriptionZh : lab.descriptionEn}</p>
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-2">
              {active ? (
                <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-5">
                  <div>
                    <h2 className="text-lg font-bold text-white">{isZh ? active.nameZh : active.nameEn}</h2>
                    <p className="mt-1 text-sm text-slate-400">{isZh ? active.descriptionZh : active.descriptionEn}</p>
                  </div>

                  {vars.length > 0 && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-slate-400">{isZh ? "填充变量" : "Variables"}</p>
                      {vars.map((v) => (
                        <div key={v}>
                          <label className="mb-1 block text-xs text-slate-500">{"{{" + v + "}}"}</label>
                          <textarea
                            value={values[v] || ""}
                            onChange={(e) => setValues((p) => ({ ...p, [v]: e.target.value }))}
                            rows={2}
                            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                            placeholder={isZh ? `输入 ${v}…` : `Enter ${v}…`}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-400">{isZh ? "生成结果" : "Output"}</p>
                      <button onClick={copy} className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700">
                        {copied ? (isZh ? "已复制 ✓" : "Copied ✓") : (isZh ? "复制" : "Copy")}
                      </button>
                    </div>
                    <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg border border-slate-800 bg-slate-950 p-4 text-sm leading-relaxed text-slate-200">{output}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center rounded-xl border border-slate-800 bg-slate-900 py-20">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
