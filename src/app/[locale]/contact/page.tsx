"use client";

import { useState } from "react";
import { useSiteSettings } from "@/hooks/use-store-data";
import { apiClient } from "@/lib/api/client";

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
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^1[3-9]\d{9}$/;

  const validateEmail = (v: string) => {
    if (!v.trim()) { setEmailError(""); return false; }
    if (!emailRegex.test(v.trim())) { setEmailError(isZh ? "请输入有效的邮箱地址" : "Please enter a valid email"); return false; }
    setEmailError(""); return true;
  };
  const validatePhone = (v: string) => {
    if (!v.trim()) { setPhoneError(""); return false; }
    if (!phoneRegex.test(v.trim().replace(/[\s-]/g, ""))) { setPhoneError(isZh ? "请输入有效的手机号码" : "Please enter a valid phone number"); return false; }
    setPhoneError(""); return true;
  };

  const formatValid = !emailError && !phoneError && emailRegex.test(from.trim()) && phoneRegex.test(phone.trim().replace(/[\s-]/g, ""));
  const allFilled = name.trim() && from.trim() && phone.trim() && message.trim() && formatValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFilled || submitting) return;
    const emailOk = validateEmail(from);
    const phoneOk = validatePhone(phone);
    if (!emailOk || !phoneOk) return;
    setSubmitting(true);
    try {
      await apiClient.create("messages" as any, { name: name.trim(), email: from.trim(), phone: phone.trim(), content: message.trim() } as any);
      setName("");
      setFrom("");
      setPhone("");
      setMessage("");
      setToast(true);
      setTimeout(() => setToast(false), 3000);
    } catch {
      alert(isZh ? "提交失败，请稍后重试" : "Submission failed, please try again");
    } finally {
      setSubmitting(false);
    }
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
          <h2 className="text-lg font-semibold text-white">{isZh ? "给我留言" : "Leave a Message"}</h2>
          <p className="mt-1 text-sm text-slate-400">
            {isZh ? "填写下方内容并提交，我会尽快回复你。" : "Fill in the form below and submit, I'll get back to you soon."}
          </p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-400">{isZh ? "你的称呼" : "Your name"} <span className="text-red-400">*</span></label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder={isZh ? "如何称呼你" : "How should I address you"} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">{isZh ? "联系邮箱" : "Your email"} <span className="text-red-400">*</span></label>
                <input type="email" required value={from} onChange={(e) => { setFrom(e.target.value); if (emailError) validateEmail(e.target.value); }} onBlur={(e) => validateEmail(e.target.value)} className={`${inputCls} ${emailError ? "border-red-500" : ""}`} placeholder="you@example.com" />
                {emailError && <p className="mt-1 text-xs text-red-400">{emailError}</p>}
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">{isZh ? "联系电话" : "Phone"} <span className="text-red-400">*</span></label>
              <input type="tel" required value={phone} onChange={(e) => { setPhone(e.target.value); if (phoneError) validatePhone(e.target.value); }} onBlur={(e) => validatePhone(e.target.value)} className={`${inputCls} ${phoneError ? "border-red-500" : ""}`} placeholder={isZh ? "你的手机号码" : "Your phone number"} />
              {phoneError && <p className="mt-1 text-xs text-red-400">{phoneError}</p>}
            </div>
            <div>
              <label className="mb-1 block text-xs text-slate-400">{isZh ? "留言内容" : "Message"} <span className="text-red-400">*</span></label>
              <textarea required value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className={inputCls + " resize-none"} placeholder={isZh ? "想聊些什么…" : "What would you like to discuss…"} />
            </div>
            <button type="submit" disabled={!allFilled || submitting} className="btn-primary w-full text-sm disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? (isZh ? "提交中…" : "Submitting…") : (isZh ? "留言" : "Submit")}
            </button>
          </form>
        </div>
      </div>

      {toast && (
        <div className="fixed top-24 left-1/2 z-50 -translate-x-1/2 animate-[fadeIn_0.3s_ease-out]">
          <div className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-lg">
            {isZh ? "成功留言" : "Message sent successfully"}
          </div>
        </div>
      )}
    </div>
  );
}
