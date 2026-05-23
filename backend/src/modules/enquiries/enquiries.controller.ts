import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { LeadStatus, Role } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CreateEnquiryDto } from "./dto/create-enquiry.dto";
import { EnquiriesService } from "./enquiries.service";

@ApiTags("Enquiries")
@Controller("enquiries")
export class EnquiriesController {
  constructor(private readonly enquiries: EnquiriesService) {}

  @Post()
  create(@Body() dto: CreateEnquiryDto) {
    return this.enquiries.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SALES_AGENT)
  findAll(@Query("status") status?: LeadStatus) {
    return this.enquiries.findAll(status);
  }

  @Patch(":id/status")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER, Role.SALES_AGENT)
  updateStatus(@Param("id") id: string, @Body() body: { status: LeadStatus; agentId?: string }) {
    return this.enquiries.updateStatus(id, body.status, body.agentId);
  }
}
