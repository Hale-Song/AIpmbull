"use client";

import { useState } from "react";
import Link from "next/link";

interface Product {
  id: number;
  name: string;
  rating: number;
  category: string;
  image: string;
  descriptionZh: string;
  descriptionEn: string;
  websiteUrl: string;
}

const categories = ["all", "llm", "painting", "writing", "coding", "office", "video"] as const;

const products: Product[] = [
  {
    id: 1,
    name: "ChatGPT",
    rating: 4.8,
    category: "llm",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop",
    descriptionZh: "OpenAI推出的对话式AI助手，支持文本生成、代码编写、数据分析等多种任务，是全球最流行的大语言模型应用。",
    descriptionEn: "OpenAI's conversational AI assistant supporting text generation, coding, data analysis and more. The world's most popular LLM application.",
    websiteUrl: "https://chat.openai.com",
  },
  {
    id: 2,
    name: "Claude",
    rating: 4.7,
    category: "llm",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&h=400&fit=crop",
    descriptionZh: "Anthropic推出的AI助手，以长文本处理和安全可靠著称，适合深度分析和专业写作任务。",
    descriptionEn: "Anthropic's AI assistant, known for long-text processing and safety, ideal for deep analysis and professional writing tasks.",
    websiteUrl: "https://claude.ai",
  },
  {
    id: 3,
    name: "Gemini",
    rating: 4.6,
    category: "llm",
    image: "https://images.unsplash.com/photo-1684163761883-8a3e1b3e3b3c?w=600&h=400&fit=crop",
    descriptionZh: "Google推出的多模态AI模型，支持文本、图像、代码等多种输入，与Google生态深度整合。",
    descriptionEn: "Google's multimodal AI model supporting text, image, code inputs, deeply integrated with the Google ecosystem.",
    websiteUrl: "https://gemini.google.com",
  },
  {
    id: 4,
    name: "通义千问",
    rating: 4.5,
    category: "llm",
    image: "https://images.unsplash.com/photo-1673393098653-3b3e1eb1b4a2?w=600&h=400&fit=crop",
    descriptionZh: "阿里巴巴推出的大语言模型，中文理解能力出色，支持多轮对话和专业知识问答。",
    descriptionEn: "Alibaba's LLM with excellent Chinese comprehension, supporting multi-turn dialogue and professional Q&A.",
    websiteUrl: "https://tongyi.aliyun.com",
  },
  {
    id: 5,
    name: "Midjourney",
    rating: 4.7,
    category: "painting",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop",
    descriptionZh: "领先的AI图像生成工具，擅长高质量艺术风格图片创作，适合产品原型和概念设计。",
    descriptionEn: "Leading AI image generation tool, excels at high-quality artistic images, ideal for product prototyping and concept design.",
    websiteUrl: "https://midjourney.com",
  },
  {
    id: 6,
    name: "DALL-E 3",
    rating: 4.5,
    category: "painting",
    image: "https://images.unsplash.com/photo-1686191128892-3b37add4c844?w=600&h=400&fit=crop",
    descriptionZh: "OpenAI的图像生成模型，与ChatGPT深度集成，能通过自然语言描述生成精准图像。",
    descriptionEn: "OpenAI's image generation model, deeply integrated with ChatGPT, generating precise images from natural language descriptions.",
    websiteUrl: "https://openai.com/dall-e-3",
  },
  {
    id: 7,
    name: "Stable Diffusion",
    rating: 4.4,
    category: "painting",
    image: "https://images.unsplash.com/photo-1683009427513-28e163402d16?w=600&h=400&fit=crop",
    descriptionZh: "开源的AI图像生成模型，支持本地部署和自定义训练，拥有庞大的社区和模型生态。",
    descriptionEn: "Open-source AI image generation model supporting local deployment and custom training, with a large community and model ecosystem.",
    websiteUrl: "https://stability.ai",
  },
  {
    id: 8,
    name: "Jasper",
    rating: 4.3,
    category: "writing",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop",
    descriptionZh: "面向营销团队的AI写作平台，支持品牌语调定制，快速生成高质量营销文案和内容。",
    descriptionEn: "AI writing platform for marketing teams, supporting brand voice customization for high-quality marketing copy and content.",
    websiteUrl: "https://jasper.ai",
  },
  {
    id: 9,
    name: "Copy.ai",
    rating: 4.2,
    category: "writing",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop",
    descriptionZh: "AI驱动的文案生成工具，提供多种模板，帮助快速创建广告文案、邮件和社交媒体内容。",
    descriptionEn: "AI-powered copywriting tool with various templates for quickly creating ad copy, emails and social media content.",
    websiteUrl: "https://copy.ai",
  },
  {
    id: 10,
    name: "Cursor",
    rating: 4.9,
    category: "coding",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop",
    descriptionZh: "AI驱动的智能代码编辑器，让非技术背景的产品经理也能快速搭建原型和工具。",
    descriptionEn: "AI-powered intelligent code editor enabling non-technical PMs to quickly build prototypes and tools.",
    websiteUrl: "https://cursor.sh",
  },
  {
    id: 11,
    name: "GitHub Copilot",
    rating: 4.6,
    category: "coding",
    image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&h=400&fit=crop",
    descriptionZh: "GitHub与OpenAI合作的AI编程助手，集成在VS Code中，提供智能代码补全和生成。",
    descriptionEn: "GitHub and OpenAI's AI coding assistant, integrated in VS Code, providing intelligent code completion and generation.",
    websiteUrl: "https://github.com/features/copilot",
  },
  {
    id: 12,
    name: "Notion AI",
    rating: 4.5,
    category: "office",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop",
    descriptionZh: "集成在Notion中的AI助手，帮助产品经理高效管理文档、整理信息和协作。",
    descriptionEn: "AI assistant integrated in Notion, helping PMs efficiently manage documents, organize information and collaborate.",
    websiteUrl: "https://notion.ai",
  },
  {
    id: 13,
    name: "Gamma",
    rating: 4.4,
    category: "office",
    image: "https://images.unsplash.com/photo-1517292987719-0369a794ec0f?w=600&h=400&fit=crop",
    descriptionZh: "AI驱动的演示文稿和文档工具，一键生成精美的PPT、文档和网页，大幅提升工作效率。",
    descriptionEn: "AI-powered presentation and document tool, generating beautiful PPTs, docs and web pages with one click.",
    websiteUrl: "https://gamma.app",
  },
  {
    id: 14,
    name: "Runway",
    rating: 4.4,
    category: "video",
    image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&h=400&fit=crop",
    descriptionZh: "AI视频生成与编辑平台，支持文生视频、图生视频，适合产品演示和营销内容制作。",
    descriptionEn: "AI video generation and editing platform, supporting text-to-video and image-to-video, ideal for product demos and marketing content.",
    websiteUrl: "https://runwayml.com",
  },
  {
    id: 15,
    name: "Pika",
    rating: 4.3,
    category: "video",
    image: "https://images.unsplash.com/photo-1574717024653-61fd1d62e244?w=600&h=400&fit=crop",
    descriptionZh: "创意AI视频生成工具，通过简单文字描述即可生成高质量短视频，适合社交媒体内容创作。",
    descriptionEn: "Creative AI video generation tool, generating high-quality short videos from simple text descriptions, ideal for social media content.",
    websiteUrl: "https://pika.art",
  },
];

const categoryColors: Record<string, string> = {
  llm: "from-violet-500/20 to-purple-500/20 text-violet-300 border-violet-500/30",
  painting: "from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30",
  writing: "from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30",
  coding: "from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30",
  office: "from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30",
  video: "from-red-500/20 to-orange-500/20 text-red-300 border-red-500/30",
};

export default function ProductGrid({ locale, messages }: { locale: string; messages: Record<string, string> }) {
  const isZh = locale === "zh";
  const [active, setActive] = useState("all");

  const filtered = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <section className="container-site py-12">
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => {
          const isActive = active === cat;
          const label = cat === "all" ? messages.allCategories : messages[cat];
          return (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "border border-slate-700 text-slate-400 hover:border-slate-500 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-slate-500">
        {isZh ? `共 ${filtered.length} 个产品` : `${filtered.length} products`}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/50 py-20 text-center">
          <p className="text-slate-500">{isZh ? "该分类暂无产品" : "No products in this category yet"}</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => {
            const colorClass = categoryColors[product.category] || "from-slate-500/20 to-slate-500/20 text-slate-300 border-slate-500/30";
            return (
              <article
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-blue-500/5"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-800">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className={`inline-flex items-center rounded-full border bg-gradient-to-r px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
                      {messages[product.category]}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-white transition-colors group-hover:text-blue-400">
                      {product.name}
                    </h3>
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {product.rating}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400 line-clamp-2">
                    {isZh ? product.descriptionZh : product.descriptionEn}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <Link
                      href={product.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600/10 px-3 py-1.5 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-600/20"
                    >
                      {isZh ? "立即体验" : "Try Now"}
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
