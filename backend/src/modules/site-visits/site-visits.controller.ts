import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role, VisitStatus } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CreateSiteVisitDto } from "./dto/create-site-visit.dto";
import { SiteVisitsService } from "./site-visits.service";

@ApiTags("Site visits")
@Controller("site-visits")
export class SiteVisitsController {
  constructor(private readonly visits: SiteVisitsService) {}

  @Post()
  create(@Body() dto: CreateSiteVisitDto) {
    return this.visits.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SALES_AGENT)
  findAll(@Query("status") status?: VisitStatus) {
    return this.visits.findAll(status);
  }

  @Patch(":id/status")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SALES_AGENT)
  updateStatus(@Param("id") id: string, @Body() body: { status: VisitStatus; assignedAgentId?: string }) {
    return this.visits.updateStatus(id, body.status, body.assignedAgentId);
  }
}
