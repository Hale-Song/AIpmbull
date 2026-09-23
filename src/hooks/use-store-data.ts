"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { Article, Product, Agent, Video, ImageItem, PortfolioProject, SiteSettings, Note, Slide, FriendLink, QA, LabTemplate, Message } from "@/lib/admin/store";

export function useStoreData<T>(key: "articles" | "products" | "agents" | "videos" | "images" | "portfolio" | "notes" | "slides" | "links" | "qa" | "labs" | "messages") {
  const [data, setData] = useState<T[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(`aipmbull_${key}`);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiClient.list<T>(key).then((items) => {
      if (!cancelled) {
        setData(items);
        setLoaded(true);
      }
    });
    return () => { cancelled = true; };
  }, [key]);

  return { data, loaded };
}

export function usePublishedArticles() {
  const { data, loaded } = useStoreData<Article>("articles");
  return { articles: data.filter(a => a.published).sort((a, b) => (b.articleNo || "").localeCompare(a.articleNo || "")), loaded };
}

export function usePublishedProducts() {
  const { data, loaded } = useStoreData<Product>("products");
  return { products: data.filter(p => p.published), loaded };
}

export function usePublishedAgents() {
  const { data, loaded } = useStoreData<Agent>("agents");
  return { agents: data.filter(a => a.published), loaded };
}

export function usePublishedVideos() {
  const { data, loaded } = useStoreData<Video>("videos");
  return { videos: data.filter(v => v.published), loaded };
}

export function usePublishedPortfolio() {
  const { data, loaded } = useStoreData<PortfolioProject>("portfolio");
  return { portfolio: data.filter(p => p.published), loaded };
}

export function usePublishedNotes() {
  const { data, loaded } = useStoreData<Note>("notes");
  return { notes: data.filter(n => n.published).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), loaded };
}

export function usePublishedSlides() {
  const { data, loaded } = useStoreData<Slide>("slides");
  return { slides: data.filter(s => s.published).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), loaded };
}

export function usePublishedLinks() {
  const { data, loaded } = useStoreData<FriendLink>("links");
  return { links: data.filter(l => l.published).sort((a, b) => a.order - b.order), loaded };
}

export function usePublishedQA() {
  const { data, loaded } = useStoreData<QA>("qa");
  return { qa: data.filter(q => q.published && q.status === "answered").sort((a, b) => Number(b.featured) - Number(a.featured) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), loaded };
}

/** All published QA (answered + pending), used on frontend Q&A page */
export function useAllPublishedQA() {
  const { data, loaded } = useStoreData<QA>("qa");
  return { qa: data.filter(q => q.published).sort((a, b) => {
    // Pending first, then by featured, then by date
    if (a.status !== b.status) return a.status === "pending" ? -1 : 1;
    return Number(b.featured) - Number(a.featured) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }), loaded };
}

export function usePublishedLabs() {
  const { data, loaded } = useStoreData<LabTemplate>("labs");
  return { labs: data.filter(l => l.published), loaded };
}

export function useMessages() {
  const { data, loaded } = useStoreData<Message>("messages");
  return { messages: data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), loaded };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("aipmbull_settings");
      if (raw) setSettings(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  return { settings, loaded };
}
