"use client";

export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  const isZh = locale === "zh";

  const sections = isZh
    ? [
        { h: "信息收集", p: "本站为个人作品与知识分享网站，默认不收集访客的个人身份信息。管理后台的内容数据仅存储于站长本地浏览器与站点自有的存储服务中。" },
        { h: "本地存储", p: "为提供管理功能，本站会在你的浏览器 localStorage 中保存必要的登录状态与内容草稿，这些数据不会上传至第三方。" },
        { h: "第三方服务", p: "站点部署于 Cloudflare Pages，部分内容（如封面图片、在线智能体体验）可能引用第三方服务，其隐私政策以对应服务商为准。" },
        { h: "Cookie", p: "本站不使用广告追踪类 Cookie。如未来引入访问统计，将在本页更新说明。" },
        { h: "联系方式", p: "如对隐私事宜有疑问，请通过「联系我」页面提供的邮箱与我们联系。" },
      ]
    : [
        { h: "Information Collection", p: "This is a personal portfolio and knowledge-sharing site. By default we do not collect visitors' personally identifiable information. Admin content is stored only in the owner's local browser and the site's own storage service." },
        { h: "Local Storage", p: "To provide admin features, the site stores necessary login state and content drafts in your browser's localStorage. This data is never sent to third parties." },
        { h: "Third-party Services", p: "The site is deployed on Cloudflare Pages. Some content (cover images, online agent demos) may reference third-party services, whose privacy policies apply." },
        { h: "Cookies", p: "This site does not use advertising or tracking cookies. If analytics are introduced later, this page will be updated." },
        { h: "Contact", p: "For any privacy questions, contact us via the email on the Contact page." },
      ];

  return (
    <div className="bg-slate-900 py-16">
      <div className="container-site max-w-3xl">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{isZh ? "隐私声明" : "Privacy Policy"}</h1>
        <p className="mt-2 text-sm text-slate-500">{isZh ? "最后更新：2026-09-22" : "Last updated: 2026-09-22"}</p>
        <div className="mt-10 space-y-8">
          {sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-lg font-semibold text-white">{s.h}</h2>
              <p className="mt-2 leading-7 text-slate-400">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
