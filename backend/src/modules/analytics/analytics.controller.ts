import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { AnalyticsService } from "./analytics.service";
import { CreateAnalyticsEventDto } from "./dto/create-analytics-event.dto";

@ApiTags("Analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Post("events")
  track(@Body() dto: CreateAnalyticsEventDto) {
    return this.analytics.track(dto);
  }

  @Get("dashboard")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER)
  dashboard(@Query("since") since?: string) {
    return this.analytics.dashboard(since);
  }
}
