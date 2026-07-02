import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role, VisitStatus } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AdminCreateSiteVisitDto, CreateSiteVisitDto, UpdateSiteVisitStatusDto, UpdateSiteVisitDto } from "./dto/create-site-visit.dto";
import { SiteVisitsService } from "./site-visits.service";

@ApiTags("Site visits")
@Controller("site-visits")
export class SiteVisitsController {
  constructor(private readonly visits: SiteVisitsService) {}

  @Post()
  create(@Body() dto: CreateSiteVisitDto) {
    return this.visits.create(dto);
  }

  @Post("admin")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SALES_AGENT)
  createAdmin(
    @CurrentUser() user: { sub: string; role: Role },
    @Body() dto: AdminCreateSiteVisitDto
  ) {
    return this.visits.createAdmin(user.sub, user.role, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SALES_AGENT)
  findAll(
    @CurrentUser() user: { sub: string; role: Role },
    @Query("status") status?: VisitStatus
  ) {
    return this.visits.findAll(user.sub, user.role, status);
  }

  @Patch(":id/status")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SALES_AGENT)
  updateStatus(
    @CurrentUser() user: { sub: string; role: Role },
    @Param("id") id: string,
    @Body() body: UpdateSiteVisitStatusDto
  ) {
    return this.visits.updateStatus(user.sub, user.role, id, body.status, body.assignedAgentId);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SALES_AGENT)
  update(
    @CurrentUser() user: { sub: string; role: Role },
    @Param("id") id: string,
    @Body() dto: UpdateSiteVisitDto
  ) {
    return this.visits.update(user.sub, user.role, id, dto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER)
  remove(@Param("id") id: string) {
    return this.visits.remove(id);
  }
}
