"use client";

import { useSiteSettings } from "@/hooks/use-store-data";

export default function ContactPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";
  const { settings } = useSiteSettings();
  const email = settings?.email ?? "contact@aipmbull.com";
  const website = settings?.website ?? "aipmbull.com";
  const github = settings?.github ?? "";
  const twitter = settings?.twitter ?? "";

  const channels = [
    { label: isZh ? "邮箱" : "Email", value: email, href: `mailto:${email}` },
    { label: isZh ? "网站" : "Website", value: website, href: `https://${website}` },
    ...(github ? [{ label: "GitHub", value: github, href: `https://github.com/${github}` }] : []),
    ...(twitter ? [{ label: "Twitter / X", value: twitter.replace(/^@/, ""), href: `https://x.com/${twitter.replace(/^@/, "")}` }] : []),
  ];

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
          {channels.map((c) => (
            <a key={c.label} href={c.href} target={c.href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" className="card-dark flex items-center justify-between p-5 transition-colors hover:border-blue-500/50">
              <span className="text-sm text-slate-500">{c.label}</span>
              <span className="font-medium text-white">{c.value}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
