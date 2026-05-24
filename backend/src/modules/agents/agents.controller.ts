import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { AgentsService } from "./agents.service";
import { CreateAgentDto } from "./dto/create-agent.dto";

@ApiTags("Agents")
@Controller("agents")
export class AgentsController {
  constructor(private readonly agents: AgentsService) {}

  @Get()
  findAll() {
    return this.agents.findAll();
  }

  // ── Report: my own progress (sales agent) ────────────────────────────────
  @Get("report/me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SALES_AGENT)
  getMyStats(@CurrentUser() user: { sub: string }) {
    return this.agents.getMyStats(user.sub);
  }

  // ── Report: all agents summary (admin / manager) ─────────────────────────
  @Get("report/all")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER)
  getAllAgentsReport() {
    return this.agents.getAllAgentsReport();
  }

  // ── Report: one agent detailed rows (admin / manager) ────────────────────
  @Get(":id/report")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER)
  getAgentDetailedReport(@Param("id") id: string) {
    return this.agents.getAgentDetailedReport(id);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  create(@Body() dto: CreateAgentDto) {
    return this.agents.create(dto);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  update(@Param("id") id: string, @Body() dto: Partial<CreateAgentDto>) {
    return this.agents.update(id, dto);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.agents.remove(id);
  }
}
