import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Converts any Google Maps link (share link, place URL, short URL, or iframe src)
 * into a proper embeddable iframe src URL.
 */
export function convertToMapEmbedUrl(link: string | null | undefined, fallbackAddress?: string): string {
  if (!link && fallbackAddress) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress)}&output=embed`;
  }
  if (!link) return "";

  const trimmed = link.trim();

  // 1. If it's an iframe embed code, extract the src URL
  const iframeMatch = trimmed.match(/src="([^"]+)"/);
  if (iframeMatch) {
    return iframeMatch[1];
  }

  // 2. Already an embed URL — return as-is
  if (trimmed.includes("output=embed") || trimmed.includes("/maps/embed")) {
    return trimmed;
  }

  // 3. Handle /maps/place/... or /maps/search/... URLs — extract coords or query
  const placeMatch = trimmed.match(/google\.com\/maps\/(?:place|search)\/([^/@?]+)(?:\/@([\d.-]+),([\d.-]+))?/);
  if (placeMatch) {
    if (placeMatch[2] && placeMatch[3]) {
      return `https://maps.google.com/maps?q=${placeMatch[2]},${placeMatch[3]}&output=embed`;
    }
    const query = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
  }

  // 4. Handle @lat,lng in URL (e.g. /maps/@28.6139,77.2090,15z)
  const coordMatch = trimmed.match(/@([\d.-]+),([\d.-]+)/);
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&output=embed`;
  }

  // 5. Handle short URLs like maps.app.goo.gl or goo.gl
  if (trimmed.includes("goo.gl") || trimmed.includes("maps.app")) {
    if (fallbackAddress) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress)}&output=embed`;
    }
    return "";
  }

  // 6. Handle q= parameter in URL
  try {
    const url = new URL(trimmed);
    const q = url.searchParams.get("q");
    if (q) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
    }
  } catch {}

  // 7. If it's just plain text (not starting with http), treat it as a direct address search query!
  if (!trimmed.startsWith("http")) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(trimmed)}&output=embed`;
  }

  // 8. Last resort: use the link as-is (might be a custom embed URL)
  if (fallbackAddress) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(fallbackAddress)}&output=embed`;
  }
  return trimmed;
}

export function formatCurrency(value: number) {
  if (value >= 10000000) {
    return `₹ ${(value / 10000000).toFixed(2).replace(/\.00$/, "")} Cr`;
  } else if (value >= 100000) {
    return `₹ ${(value / 100000).toFixed(2).replace(/\.00$/, "")} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function normalizeProperty(property: any) {
  if (!property) return null;
  const dbImages = property.images || [];
  const imageFiles = dbImages.filter((img: any) => !img.type || img.type === "IMAGE");
  const brochureFile = dbImages.find((img: any) => img.type === "BROCHURE");
  const floorPlanFile = dbImages.find((img: any) => img.type === "FLOOR_PLAN");
  const masterPlanFile = dbImages.find((img: any) => img.type === "MASTER_PLAN");

  const heroImage = imageFiles[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85";
  const gallery = imageFiles.length > 0
    ? imageFiles.map((img: any) => img.url)
    : [heroImage];
  
  const price = Number(property.price || 0);
  const priceLabel = property.priceLabel || formatCurrency(price);

  const typeStr = property.type || "APARTMENT";
  const typeLabel = typeStr.charAt(0).toUpperCase() + typeStr.slice(1).toLowerCase();

  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    city: property.city,
    location: property.location,
    address: property.address,
    mapLink: property.mapLink || null,
    mapEmbedUrl: convertToMapEmbedUrl(property.mapLink, property.address),
    priceLabel,
    price,
    type: typeLabel,
    bedrooms: property.bedrooms || 0,
    status: property.status || "ONGOING",
    category: property.category?.name || "Premium Property",
    heroImage,
    gallery,
    brochureUrl: brochureFile?.url || null,
    floorPlanUrl: floorPlanFile?.url || null,
    masterPlanUrl: masterPlanFile?.url || null,
    amenities: property.amenities || [],
    description: property.description || "",
    siteArea: property.siteArea || "N/A",
    builder: property.builderName || "Investo Developments",
    nearby: property.nearbyLandmarks || property.nearby || [],
    agent: {
      name: property.agent?.name || "Investo Advisory",
      phone: property.agent?.phone || "+971 4 000 0000",
      email: property.agent?.email || "info@investoproperties.com",
      avatar: property.agent?.avatarUrl || property.agent?.avatar || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=85"
    }
  };
}

export function parseIndianPrice(input: string): number {
  if (!input) return 0;
  const cleanInput = input.replace(/,/g, "").trim().toLowerCase();
  
  // Extract number and suffix (supports cr, crore, l, lakh, k)
  const match = cleanInput.match(/^([\d.]+)\s*(cr|crore|l|lakh|k)?$/);
  if (!match) {
    const parsed = parseFloat(cleanInput);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  const numValue = parseFloat(match[1]);
  const suffix = match[2];
  
  if (suffix === "cr" || suffix === "crore") {
    return numValue * 10000000;
  } else if (suffix === "l" || suffix === "lakh") {
    return numValue * 100000;
  } else if (suffix === "k") {
    return numValue * 1000;
  }
  
  return numValue;
}
