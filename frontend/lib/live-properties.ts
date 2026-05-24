import { normalizeProperty } from "@/lib/utils";

type PropertyQuery = Record<string, string | number | boolean | undefined>;

function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api").replace(/\/$/, "");
}

async function apiFetch<T>(path: string, query?: PropertyQuery): Promise<T> {
  const url = new URL(`${getApiBaseUrl()}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  const response = await fetch(url, {
    cache: "no-store",
    next: { revalidate: 0 }
  });

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
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
