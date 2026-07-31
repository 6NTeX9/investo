import { normalizeProperty } from "@/lib/utils";

type PropertyQuery = Record<string, string | number | boolean | undefined>;

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
}

async function apiFetch<T>(path: string, query?: PropertyQuery, retries = 3): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url.toString(), {
        cache: "no-store",
        next: { revalidate: 0 }
      });

      if (response.ok) {
        return (await response.json()) as T;
      }
    } catch (err) {
      if (attempt === retries) throw err;
    }
    // Delay before retry to allow Render server to wake up from cold-start
    await new Promise((res) => setTimeout(res, 1500));
  }

  throw new Error(`Failed to fetch ${path} after ${retries} attempts.`);
}

export async function getLiveProperties(query?: PropertyQuery) {
  const response = await apiFetch<{ items?: unknown[]; meta?: { total?: number; pageCount?: number } }>("/properties", query);
  return {
    items: (response.items ?? []).map((property) => normalizeProperty(property)).filter(Boolean),
    meta: response.meta ?? { total: 0, pageCount: 1 }
  };
}

export async function getFeaturedProperties() {
  const response = await apiFetch<unknown[]>("/properties/featured");
  return response.map((property) => normalizeProperty(property)).filter(Boolean);
}

export async function getLivePropertyBySlug(slug: string) {
  const response = await apiFetch<unknown>(`/properties/${encodeURIComponent(slug)}`);
  return normalizeProperty(response);
}
