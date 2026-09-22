"use client";

import { useSiteSettings } from "@/hooks/use-store-data";

type Exp = { year: string; title: string; company: string; desc: string };
type Skill = { name: string; level: number };

export default function ResumeCard({
  locale,
  role,
  intro,
  experiences,
  skills,
}: {
  locale: string;
  role: string;
  intro: string;
  experiences: Exp[];
  skills: Skill[];
}) {
  const isZh = locale === "zh";
  const { settings } = useSiteSettings();
  const name = (isZh ? settings?.siteName : settings?.siteNameEn) ?? "AI PM Bull";
  const email = settings?.email ?? "";
  const website = settings?.website ?? "";

  const handleDownload = () => {
    const expHtml = experiences
      .map(
        (e) => `<div class="exp"><div class="exp-head"><strong>${e.title}</strong><span>${e.company}</span><span class="year">${e.year}</span></div><p>${e.desc}</p></div>`
      )
      .join("");
    const skillHtml = skills.map((s) => `<li>${s.name}</li>`).join("");
    const html = `<!DOCTYPE html><html lang="${locale}"><head><meta charset="utf-8"><title>${name} - ${isZh ? "简历" : "Resume"}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; color: #1e293b; margin: 0; padding: 40px; line-height: 1.6; }
  h1 { font-size: 26px; margin: 0; }
  .role { color: #2563eb; font-size: 15px; margin: 4px 0 0; }
  .contact { font-size: 13px; color: #64748b; margin-top: 6px; }
  .intro { margin: 18px 0; font-size: 14px; color: #334155; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: .05em; color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 4px; margin: 24px 0 12px; }
  .exp { margin-bottom: 14px; }
  .exp-head { display: flex; gap: 10px; align-items: baseline; flex-wrap: wrap; font-size: 14px; }
  .exp-head span { color: #7c3aed; }
  .exp-head .year { margin-left: auto; color: #94a3b8; font-size: 12px; }
  .exp p { margin: 4px 0 0; font-size: 13px; color: #475569; }
  ul { margin: 0; padding-left: 18px; columns: 2; font-size: 13px; color: #334155; }
  @media print { body { padding: 24px; } }
</style></head><body>
<h1>${name}</h1>
<p class="role">${role}</p>
<p class="contact">${[email, website].filter(Boolean).join(" · ")}</p>
<p class="intro">${intro}</p>
<h2>${isZh ? "工作经历" : "Experience"}</h2>
${expHtml}
<h2>${isZh ? "核心技能" : "Skills"}</h2>
<ul>${skillHtml}</ul>
</body></html>`;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div className="card overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{name}</h3>
          <p className="text-sm text-blue-400">{role}</p>
          <p className="mt-1 text-xs text-slate-500">{[email, website].filter(Boolean).join(" · ")}</p>
        </div>
        <button onClick={handleDownload} className="btn-primary flex shrink-0 items-center gap-2 text-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          {isZh ? "下载 PDF" : "Download PDF"}
        </button>
      </div>
      <div className="mt-4 space-y-4 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{isZh ? "工作经历" : "Experience"}</p>
          <div className="mt-2 space-y-2">
            {experiences.map((e, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3">
                <span className="text-slate-300">{e.title} · <span className="text-purple-400">{e.company}</span></span>
                <span className="shrink-0 text-xs text-slate-500">{e.year}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{isZh ? "核心技能" : "Skills"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s.name} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-300">{s.name}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        {isZh ? "点击「下载 PDF」后，在打印对话框中选择「另存为 PDF」即可保存简历。" : "After clicking Download PDF, choose “Save as PDF” in the print dialog."}
      </p>
    </div>
  );
}
