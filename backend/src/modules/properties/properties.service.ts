import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { QueryPropertiesDto } from "./dto/query-properties.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";

@Injectable()
export class PropertiesService {
  constructor(private readonly database: DatabaseService) {}

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

  create(dto: CreatePropertyDto, actorRole: Role) {
    const { images, ...propertyData } = dto;
    return this.database.property.create({
      data: {
        ...propertyData,
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
    const { images, ...propertyData } = dto;

    if (images) {
      await this.database.propertyImage.deleteMany({ where: { propertyId: id } });
    }

    return this.database.property.update({
      where: { id },
      data: {
        ...propertyData,
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
