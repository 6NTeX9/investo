import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
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
  findAll(@Query() query: QueryPropertiesDto) {
    return this.properties.findAll(query, query.includeUnpublished);
  }

  @Get("categories")
  findAllCategories() {
    return this.properties.findAllCategories();
  }

  @Get("featured")
  featured() {
    return this.properties.featured();
  }

  @Get(":slug")
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
