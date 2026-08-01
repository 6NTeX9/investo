import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { QueryPropertiesDto } from "./dto/query-properties.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";

function parseAreaSqft(areaStr: string | null | undefined): number {
  if (!areaStr) return 0;
  if (areaStr.toLowerCase().includes("acre")) {
    const val = parseFloat(areaStr);
    return isNaN(val) ? 0 : val * 43560;
  }
  const match = areaStr.match(/\d[\d,\s]*/);
  if (!match) return 0;
  const num = parseInt(match[0].replace(/[\s,]/g, ""), 10);
  return isNaN(num) ? 0 : num;
}

@Injectable()
export class PropertiesService {
  constructor(private readonly database: DatabaseService) {}

  private async resolveCategoryId(categoryIdInput?: string | null): Promise<string | null> {
    if (!categoryIdInput || !categoryIdInput.trim()) return null;
    const cleanInput = categoryIdInput.trim();

    // 1. Try finding by CUID / ID
    const existingById = await this.database.propertyCategory.findUnique({
      where: { id: cleanInput }
    });
    if (existingById) return existingById.id;

    // 2. Try finding by Name (case-insensitive) or Slug
    const slug = cleanInput.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const existingByName = await this.database.propertyCategory.findFirst({
      where: {
        OR: [
          { name: { equals: cleanInput, mode: "insensitive" } },
          { slug: slug }
        ]
      }
    });
    if (existingByName) return existingByName.id;

    // 3. Create Category on the fly if user passed a custom name like "Villas", "Commercial"
    try {
      const created = await this.database.propertyCategory.create({
        data: {
          name: cleanInput,
          slug: slug || `category-${Date.now()}`
        }
      });
      return created.id;
    } catch {
      return null;
    }
  }

  private async resolveAgentId(agentIdInput?: string | null): Promise<string | null> {
    if (!agentIdInput || !agentIdInput.trim()) return null;
    const cleanInput = agentIdInput.trim();
    const existing = await this.database.agent.findUnique({
      where: { id: cleanInput }
    });
    if (existing) return existing.id;

    // Fallback: Return first available agent or null
    const firstAgent = await this.database.agent.findFirst();
    return firstAgent ? firstAgent.id : null;
  }

  async findAll(query: QueryPropertiesDto, includeUnpublished = false) {
    const where: Prisma.PropertyWhereInput = {
      ...(includeUnpublished ? {} : { isPublished: true }),
      ...(query.city ? { city: { equals: query.city, mode: "insensitive" } } : {}),
      ...(query.location ? { location: { contains: query.location, mode: "insensitive" } } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.bedrooms ? { bedrooms: query.bedrooms } : {}),
      ...(query.minPrice || query.maxPrice
        ? { price: { gte: query.minPrice, lte: query.maxPrice } }
        : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" } },
              { description: { contains: query.q, mode: "insensitive" } },
              { builderName: { contains: query.q, mode: "insensitive" } }
            ]
          }
        : {})
    };

    const orderBy: Prisma.PropertyOrderByWithRelationInput =
      query.sort === "price_asc" ? { price: "asc" } : query.sort === "price_desc" ? { price: "desc" } : { createdAt: "desc" };

    if (query.minArea) {
      const minAreaVal = query.minArea;
      const allMatches = await this.database.property.findMany({
        where,
        include: { images: { orderBy: { sortOrder: "asc" } }, agent: true, category: true },
        orderBy
      });

      const filtered = allMatches.filter(item => parseAreaSqft(item.siteArea) >= minAreaVal);
      const total = filtered.length;
      const items = filtered.slice((query.page - 1) * query.limit, query.page * query.limit);

      return {
        items,
        meta: {
          total,
          page: query.page,
          limit: query.limit,
          pageCount: Math.ceil(total / query.limit)
        }
      };
    }

    const [items, total] = await this.database.$transaction([
      this.database.property.findMany({
        where,
        include: { images: { orderBy: { sortOrder: "asc" } }, agent: true, category: true },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy
      }),
      this.database.property.count({ where })
    ]);

    return {
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        pageCount: Math.ceil(total / query.limit)
      }
    };
  }

  async featured() {
    return this.database.property.findMany({
      where: { isPublished: true, isFeatured: true },
      include: { images: { orderBy: { sortOrder: "asc" } }, agent: true, category: true },
      take: 8,
      orderBy: { publishedAt: "desc" }
    });
  }

  findAllCategories() {
    return this.database.propertyCategory.findMany({
      orderBy: { name: "asc" }
    });
  }

  async findBySlug(slug: string) {
    const property = await this.database.property.findUnique({
      where: { slug },
      include: { images: { orderBy: { sortOrder: "asc" } }, agent: true, category: true }
    });
    if (!property || !property.isPublished) throw new NotFoundException("Property not found");
    return property;
  }

  async create(dto: CreatePropertyDto, actorRole: Role) {
    const { images, categoryId, agentId, ...propertyData } = dto;
    const resolvedCategoryId = await this.resolveCategoryId(categoryId);
    const resolvedAgentId = await this.resolveAgentId(agentId);

    return this.database.property.create({
      data: {
        ...propertyData,
        categoryId: resolvedCategoryId,
        agentId: resolvedAgentId,
        amenities: propertyData.amenities ?? [],
        nearbyLandmarks: propertyData.nearbyLandmarks ?? [],
        publishedAt: propertyData.isPublished ? new Date() : undefined,
        images: images ? {
          create: images.map(img => ({
            url: img.url,
            key: img.key,
            alt: img.alt,
            sortOrder: img.sortOrder ?? 0,
            type: img.type
          }))
        } : undefined
      }
    });
  }

  async update(id: string, dto: UpdatePropertyDto) {
    const { images, categoryId, agentId, ...propertyData } = dto;
    const resolvedCategoryId = categoryId !== undefined ? await this.resolveCategoryId(categoryId) : undefined;
    const resolvedAgentId = agentId !== undefined ? await this.resolveAgentId(agentId) : undefined;

    if (images) {
      await this.database.propertyImage.deleteMany({ where: { propertyId: id } });
    }

    return this.database.property.update({
      where: { id },
      data: {
        ...propertyData,
        ...(resolvedCategoryId !== undefined ? { categoryId: resolvedCategoryId } : {}),
        ...(resolvedAgentId !== undefined ? { agentId: resolvedAgentId } : {}),
        publishedAt: propertyData.isPublished ? new Date() : undefined,
        images: images ? {
          create: images.map(img => ({
            url: img.url,
            key: img.key,
            alt: img.alt,
            sortOrder: img.sortOrder ?? 0,
            type: img.type
          }))
        } : undefined
      }
    });
  }

  remove(id: string) {
    return this.database.property.delete({ where: { id } });
  }
}
