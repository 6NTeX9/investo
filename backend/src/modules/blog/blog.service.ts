import { Injectable, NotFoundException } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CreateBlogDto } from "./dto/create-blog.dto";

@Injectable()
export class BlogService {
  constructor(private readonly database: DatabaseService) {}

  findPublished() {
    return this.database.blog.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" }
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
}
