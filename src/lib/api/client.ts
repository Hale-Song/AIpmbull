type StoreKey = "articles" | "products" | "agents" | "videos" | "images" | "portfolio" | "notes" | "slides" | "links" | "qa" | "labs" | "messages";

const SYNC_KEYS = ["articles", "products", "agents", "videos", "images", "portfolio", "notes", "slides", "links", "qa", "labs", "messages"] as const;

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const apiClient = {
  async list<T>(key: StoreKey): Promise<T[]> {
    try {
      return await fetchApi<T[]>(key);
    } catch {
      return [];
    }
  },

  async getById<T extends { id: string }>(key: StoreKey, id: string): Promise<T | undefined> {
    const items = await this.list<T>(key);
    return items.find((item) => item.id === id);
  },

  async create<T extends { id?: string; createdAt?: string; updatedAt?: string }>(
    key: StoreKey,
    data: Omit<T, "id" | "createdAt" | "updatedAt">
  ): Promise<T> {
    return fetchApi<T>(key, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update<T extends { id: string }>(
    key: StoreKey,
    id: string,
    data: Partial<T>
  ): Promise<T | undefined> {
    return fetchApi<T>(`${key}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(key: StoreKey, id: string): Promise<boolean> {
    try {
      await fetchApi(`${key}/${id}`, { method: "DELETE" });
      return true;
    } catch {
      return false;
    }
  },
};

export async function syncFromApi(): Promise<void> {
  if (typeof window === "undefined") return;

  for (const key of SYNC_KEYS) {
    try {
      const items = await apiClient.list(key);
      if (items.length > 0) {
        localStorage.setItem(`aipmbull_${key}`, JSON.stringify(items));
      }
    } catch {}
  }
}

export async function syncAllToApi(): Promise<void> {
  if (typeof window === "undefined") return;

  const data: Record<string, unknown> = {};
  for (const key of SYNC_KEYS) {
    const raw = localStorage.getItem(`aipmbull_${key}`);
    if (raw) {
      try {
        data[key] = JSON.parse(raw);
      } catch {}
    }
  }

  if (Object.keys(data).length === 0) return;

  try {
    await fetch("/api/sync-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {}
}
