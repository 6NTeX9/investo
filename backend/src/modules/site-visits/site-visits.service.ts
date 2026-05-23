import { Injectable } from "@nestjs/common";
import { VisitStatus } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { CreateSiteVisitDto } from "./dto/create-site-visit.dto";

@Injectable()
export class SiteVisitsService {
  constructor(private readonly database: DatabaseService) {}

  create(dto: CreateSiteVisitDto) {
    return this.database.siteVisit.create({ data: dto });
  }

  findAll(status?: VisitStatus) {
    return this.database.siteVisit.findMany({
      where: status ? { status } : undefined,
      include: { property: true, assignedAgent: true },
      orderBy: { preferredAt: "asc" }
    });
  }

  updateStatus(id: string, status: VisitStatus, assignedAgentId?: string) {
    return this.database.siteVisit.update({
      where: { id },
      data: { status, assignedAgentId }
    });
  }
}
