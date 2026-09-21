"use client";

import Link from "next/link";
import { usePublishedAgents, usePublishedVideos } from "@/hooks/use-store-data";

export function ProjectContent({ locale, translations }: {
  locale: string;
  translations: {
    allAgents: string;
    allVideos: string;
    usersTried: string;
    tryNow: string;
  };
}) {
  const isZh = locale === "zh";
  const { agents } = usePublishedAgents();
  const { videos } = usePublishedVideos();

  return (
    <>
      <section className="container-site py-12">
        <h2 className="text-xl font-bold text-white">{translations.allAgents}</h2>
        <div className="mt-6 space-y-8">
          {agents.map((agent) => (
            <div key={agent.id} className="card-dark overflow-hidden p-0">
              <div className="aspect-video w-full overflow-hidden bg-slate-800">
                <img
                  src={agent.imageUrl}
                  alt={isZh ? agent.nameZh : agent.nameEn}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <span className="badge-category">
                  {agent.category}
                </span>
                <h3 className="mt-3 text-xl font-bold text-white">
                  {isZh ? agent.nameZh : agent.nameEn}
                </h3>
                <p className="mt-2 text-slate-400">
                  {isZh ? agent.descriptionZh : agent.descriptionEn}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-slate-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {agent.userCount.toLocaleString()} {translations.usersTried}
                  </span>
                  <Link href={agent.agentUrl} className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300">
                    {translations.tryNow}
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-800/50 py-12">
        <div className="container-site">
          <h2 className="text-xl font-bold text-white">{translations.allVideos}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video) => (
              <div key={video.id} className="card group overflow-hidden p-0">
                <div className="relative aspect-video bg-slate-800">
                  {video.thumbnail && (
                    <img src={video.thumbnail} alt={isZh ? video.titleZh : video.titleEn} className="h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600/90 shadow-lg">
                      <svg className="h-5 w-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white group-hover:text-blue-400">
                    {isZh ? video.titleZh : video.titleEn}
                  </h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {isZh ? video.descriptionZh : video.descriptionEn}
                  </p>
                  {video.duration && (
                    <span className="mt-2 text-xs text-slate-500">{video.duration}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
