import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { BlogService } from "./blog.service";
import { CreateBlogDto } from "./dto/create-blog.dto";

@ApiTags("Blog")
@Controller("blog")
export class BlogController {
  constructor(private readonly blog: BlogService) {}

  @Get()
  findPublished() {
    return this.blog.findPublished();
  }

  @Get(":slug")
  findBySlug(@Param("slug") slug: string) {
    return this.blog.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  create(@Body() dto: CreateBlogDto) {
    return this.blog.create(dto);
  }
}
