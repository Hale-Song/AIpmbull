"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import type { Article, Product, Agent, Video, ImageItem, PortfolioProject, SiteSettings } from "@/lib/admin/store";

export function useStoreData<T>(key: "articles" | "products" | "agents" | "videos" | "images" | "portfolio") {
  const [data, setData] = useState<T[]>([]);
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
