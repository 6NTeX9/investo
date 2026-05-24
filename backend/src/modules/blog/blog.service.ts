import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CreateBlogDto } from "./dto/create-blog.dto";
import { UpdateBlogDto } from "./dto/update-blog.dto";

@Injectable()
export class BlogService {
  constructor(private readonly database: DatabaseService) {}

  findPublished() {
    return this.database.blog.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" }
    });
  }

  findAll() {
    return this.database.blog.findMany({
      orderBy: { createdAt: "desc" }
    });
  }

  async findBySlug(slug: string) {
    const article = await this.database.blog.findUnique({ where: { slug } });
    if (!article || !article.isPublished) throw new NotFoundException("Article not found");
    return article;
  }

  create(dto: CreateBlogDto) {
    return this.database.blog.create({
      data: {
        ...dto,
        tags: dto.tags ?? [],
        publishedAt: dto.isPublished ? new Date() : undefined
      }
    });
  }

  async update(id: string, dto: UpdateBlogDto) {
    const existing = await this.database.blog.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Blog post not found");
    return this.database.blog.update({
      where: { id },
      data: {
        ...dto,
        publishedAt: dto.isPublished && !existing.publishedAt ? new Date() : existing.publishedAt
      }
    });
  }

  async remove(id: string) {
    const existing = await this.database.blog.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException("Blog post not found");
    return this.database.blog.delete({ where: { id } });
  }
}
