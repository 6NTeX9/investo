import { Body, Controller, Delete, Get, Header, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CreatePropertyDto } from "./dto/create-property.dto";
import { QueryPropertiesDto } from "./dto/query-properties.dto";
import { UpdatePropertyDto } from "./dto/update-property.dto";
import { PropertiesService } from "./properties.service";

@ApiTags("Properties")
@Controller("properties")
export class PropertiesController {
  constructor(private readonly properties: PropertiesService) {}

  @Get()
  @Header("Cache-Control", "public, max-age=30, s-maxage=120, stale-while-revalidate=300")
  findAll(@Query() query: QueryPropertiesDto) {
    return this.properties.findAll(query, false);
  }

  @Get("admin/all")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER)
  findAllAdmin(@Query() query: QueryPropertiesDto) {
    return this.properties.findAll(query, true);
  }

  @Get("categories")
  @Header("Cache-Control", "public, max-age=60, s-maxage=300, stale-while-revalidate=600")
  findAllCategories() {
    return this.properties.findAllCategories();
  }

  @Get("featured")
  @Header("Cache-Control", "public, max-age=30, s-maxage=120, stale-while-revalidate=300")
  featured() {
    return this.properties.featured();
  }

  @Get(":slug")
  @Header("Cache-Control", "public, max-age=30, s-maxage=120, stale-while-revalidate=300")
  findBySlug(@Param("slug") slug: string) {
    return this.properties.findBySlug(slug);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  create(@Body() dto: CreatePropertyDto) {
    return this.properties.create(dto, Role.ADMIN);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: UpdatePropertyDto) {
    return this.properties.update(id, dto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.properties.remove(id);
  }
}
