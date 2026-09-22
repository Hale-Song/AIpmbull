"use client";

import { useState } from "react";
import { useSiteSettings } from "@/hooks/use-store-data";

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const { settings } = useSiteSettings();
  const email = settings?.email ?? "contact@aipmbull.com";
  const website = settings?.website ?? "aipmbull.com";
  const github = settings?.github ?? "";
  const twitter = settings?.twitter ?? "";
  const wechat = settings?.wechat ?? "";

  const channels = [
    { label: isZh ? "邮箱" : "Email", value: email, href: `mailto:${email}` },
    { label: isZh ? "网站" : "Website", value: website, href: `https://${website}` },
    ...(github ? [{ label: "GitHub", value: github, href: `https://github.com/${github}` }] : []),
    ...(twitter ? [{ label: "Twitter / X", value: twitter.replace(/^@/, ""), href: `https://x.com/${twitter.replace(/^@/, "")}` }] : []),
    ...(wechat ? [{ label: isZh ? "微信" : "WeChat", value: wechat, href: "" }] : []),
  ];

  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(isZh ? `【留言】来自 ${name || "访客"} 的消息` : `[Message] from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n---\n${isZh ? "姓名" : "Name"}: ${name}\n${isZh ? "邮箱" : "Email"}: ${from}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  };

  const inputCls = "w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none";

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site max-w-2xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "联系我" : "Contact Me"}</h1>
          <p className="mt-3 text-slate-400">
            {isZh
              ? "欢迎就 AI 产品合作、内容交流或咨询与我联系，我会尽快回复。"
              : "Feel free to reach out for AI product collaboration, content exchange or consulting. I'll reply as soon as possible."}
          </p>
        </div>
        <div className="space-y-3">
          {channels.map((c) =>
            c.href ? (
              <a key={c.label} href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="card-dark flex items-center justify-between p-5 transition-colors hover:border-blue-500/50">
                <span className="text-sm text-slate-500">{c.label}</span>
                <span className="font-medium text-white">{c.value}</span>
              </a>
            ) : (
              <div key={c.label} className="card-dark flex items-center justify-between p-5">
                <span className="text-sm text-slate-500">{c.label}</span>
                <span className="font-medium text-white">{c.value}</span>
              </div>
            )
          )}
        </div>

        <div className="card-dark mt-10 p-6">
          <h2 className="text-lg font-semibold text-white">{isZh ? "给我留言" : "Send a Message"}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {isZh ? "填写下方内容，点击发送将通过你的邮件客户端把消息发给我。" : "Fill in the form below; clicking send will open your email client with the message addressed to me."}
          </p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">{isZh ? "你的称呼" : "Your name"}</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder={isZh ? "如何称呼你" : "How should I address you"} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">{isZh ? "联系邮箱" : "Your email"}</label>
                <input type="email" required value={from} onChange={(e) => setFrom(e.target.value)} className={inputCls} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">{isZh ? "留言内容" : "Message"}</label>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className={inputCls + " resize-none"} placeholder={isZh ? "想聊些什么…" : "What would you like to discuss…"} />
            </div>
            <button type="submit" className="btn-primary w-full text-sm">{isZh ? "通过邮件发送" : "Send via Email"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
