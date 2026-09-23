"use client";

import { useState } from "react";
import { useAllPublishedQA } from "@/hooks/use-store-data";
import { apiClient } from "@/lib/api/client";
import type { QA } from "@/lib/admin/store";

export default function QAPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const { qa: publishedQA, loaded } = useAllPublishedQA();
  const [pendingQA, setPendingQA] = useState<QA[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  const allQA = [...pendingQA, ...publishedQA];

  const [question, setQuestion] = useState("");
  const [askerName, setAskerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<"idle" | "ok" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setSubmitting(true);
    setResult("idle");
    try {
      const q = question.trim();
      const newQA = await apiClient.create<QA>("qa", {
        questionZh: isZh ? q : "",
        questionEn: isZh ? "" : q,
        askerName: askerName.trim(),
        answerZh: "",
        answerEn: "",
        status: "pending",
        tags: [],
        published: true,
        featured: false,
      });
      setPendingQA((prev) => [newQA, ...prev]);
      setQuestion(""); setAskerName(""); setResult("ok");
    } catch {
      setResult("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "问答" : "Q&A"}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            {isZh ? "AI 产品经理常见问题解答。没找到答案？在下方提交你的问题。" : "Answers to common AI product manager questions. Can't find yours? Submit it below."}
          </p>
        </div>

        <div className="space-y-3">
          {loaded && allQA.length === 0 ? (
            <p className="py-12 text-center text-slate-500">{isZh ? "暂无问答" : "No questions yet"}</p>
          ) : (
            allQA.map((item) => {
              const isOpen = openId === item.id;
              const isPending = item.status === "pending";
              const q = isZh ? item.questionZh : item.questionEn;
              const a = isZh ? item.answerZh : item.answerEn;
              return (
                <div key={item.id} className={`overflow-hidden rounded-xl border ${isPending ? "border-amber-500/30 bg-amber-500/5" : "border-slate-800 bg-slate-900"}`}>
                  <button onClick={() => !isPending && setOpenId(isOpen ? null : item.id)} className="flex w-full items-start gap-3 p-5 text-left hover:bg-slate-800/40">
                    <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isPending ? "bg-amber-500/10 text-amber-400" : "bg-blue-500/10 text-blue-400"}`}>Q</span>
                    <span className="flex-1">
                      <span className="block text-base font-semibold text-white">
                        {q || (isZh ? item.questionEn : item.questionZh)}
                        {isPending && <span className="ml-2 text-xs font-normal text-amber-400">【待回答】</span>}
                      </span>
                      {item.askerName && <span className="mt-0.5 block text-xs text-slate-500">{isZh ? "提问者" : "Asker"}: {item.askerName}</span>}
                    </span>
                    {!isPending && (
                      <svg className={`h-5 w-5 shrink-0 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                    )}
                  </button>
                  {isOpen && !isPending && (
                    <div className="border-t border-slate-800 p-5">
                      <div className="flex gap-3">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-xs font-bold text-emerald-400">A</span>
                        <p className="flex-1 whitespace-pre-line leading-relaxed text-slate-300">{a || (isZh ? item.answerEn : item.answerZh)}</p>
                      </div>
                      {item.tags.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5 pl-9">
                          {item.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">{tag}</span>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-lg font-bold text-white">{isZh ? "提交你的问题" : "Submit your question"}</h2>
          <p className="mt-1 text-sm text-slate-400">{isZh ? "我们会尽快回答，并在发布后展示在这里。" : "We'll answer soon and publish it here."}</p>
          <form onSubmit={submit} className="mt-4 space-y-4">
            <div>
              <label className="mb-1 block text-xs text-slate-400">{isZh ? "问题" : "Question"}</label>
              <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} required className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder={isZh ? "描述你的问题…" : "Describe your question…"} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">{isZh ? "称呼（可选）" : "Name (optional)"}</label>
              <input type="text" value={askerName} onChange={(e) => setAskerName(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none" placeholder={isZh ? "怎么称呼你" : "How should we address you"} />
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={submitting || !question.trim()} className="btn-primary text-sm disabled:opacity-50">
                {submitting ? (isZh ? "提交中…" : "Submitting…") : (isZh ? "提交问题" : "Submit")}
              </button>
              {result === "ok" && <span className="text-sm text-emerald-400">{isZh ? "已提交，感谢！" : "Submitted, thanks!"}</span>}
              {result === "error" && <span className="text-sm text-red-400">{isZh ? "提交失败，请重试" : "Submit failed, try again"}</span>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
