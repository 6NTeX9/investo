import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, Role, VisitStatus } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { AdminCreateSiteVisitDto, CreateSiteVisitDto } from "./dto/create-site-visit.dto";

@Injectable()
export class SiteVisitsService {
  constructor(private readonly database: DatabaseService) {}

  async create(dto: CreateSiteVisitDto) {
    await this.validateVisitRequest(dto);

    return this.database.siteVisit.create({
      data: {
        ...dto,
        status: VisitStatus.REQUESTED
      },
      include: this.includeRelations()
    });
  }

  async createAdmin(userId: string, role: Role, dto: AdminCreateSiteVisitDto) {
    await this.validateVisitRequest(dto);
    
    let assignedAgentId = dto.assignedAgentId;
    
    if (role === Role.SALES_AGENT) {
      const agent = await this.database.agent.findUnique({
        where: { userId }
      });
      if (!agent) {
        throw new BadRequestException("No agent profile linked to your user account.");
      }
      assignedAgentId = agent.id;
    } else {
      await this.validateAgent(assignedAgentId);
    }

    return this.database.siteVisit.create({
      data: {
        ...dto,
        status: dto.status ?? VisitStatus.CONFIRMED,
        assignedAgentId: assignedAgentId || null
      },
      include: this.includeRelations()
    });
  }

  async findAll(userId: string, role: Role, status?: VisitStatus) {
    const where: Prisma.SiteVisitWhereInput = {};
    if (status) {
      where.status = status;
    }
    if (role === Role.SALES_AGENT) {
      const agent = await this.database.agent.findUnique({
        where: { userId }
      });
      if (agent) {
        where.assignedAgentId = agent.id;
      } else {
        return [];
      }
    }
    return this.database.siteVisit.findMany({
      where,
      include: this.includeRelations(),
      orderBy: { preferredAt: "asc" }
    });
  }

  async updateStatus(
    userId: string,
    role: Role,
    id: string,
    status: VisitStatus,
    assignedAgentId?: string | null
  ) {
    const visit = await this.ensureVisit(id);

    if (role === Role.SALES_AGENT) {
      const agent = await this.database.agent.findUnique({
        where: { userId }
      });
      
      if (!agent || visit.assignedAgentId !== agent.id) {
        throw new BadRequestException("You can only modify your own assigned site visits.");
      }
      
      if (assignedAgentId !== undefined && assignedAgentId !== agent.id) {
        throw new BadRequestException("You cannot reassign this site visit to another agent.");
      }
    } else {
      await this.validateAgent(assignedAgentId);
    }

    const data: Prisma.SiteVisitUpdateInput = { status };
    if (assignedAgentId !== undefined) {
      data.assignedAgent = assignedAgentId
        ? { connect: { id: assignedAgentId } }
        : { disconnect: true };
    }

    return this.database.siteVisit.update({
      where: { id },
      data,
      include: this.includeRelations()
    });
  }

  remove(id: string) {
    return this.database.siteVisit.delete({ where: { id } });
  }

  private includeRelations() {
    return {
      property: { select: { id: true, title: true, slug: true, location: true, city: true } },
      assignedAgent: { select: { id: true, name: true, email: true, phone: true, whatsapp: true } }
    } satisfies Prisma.SiteVisitInclude;
  }

  private async validateVisitRequest(dto: CreateSiteVisitDto) {
    if (dto.preferredAt.getTime() < Date.now() - 5 * 60 * 1000) {
      throw new BadRequestException("Preferred visit date/time cannot be in the past.");
    }

    if (!dto.propertyId) return;

    const property = await this.database.property.findUnique({
      where: { id: dto.propertyId },
      select: { id: true }
    });
    if (!property) throw new NotFoundException("Selected property was not found.");
  }

  private async validateAgent(agentId?: string | null) {
    if (!agentId) return;

    const agent = await this.database.agent.findUnique({
      where: { id: agentId },
      select: { id: true }
    });
    if (!agent) throw new NotFoundException("Selected sales person was not found.");
  }

  private async ensureVisit(id: string) {
    const visit = await this.database.siteVisit.findUnique({
      where: { id },
      select: { id: true, assignedAgentId: true }
    });
    if (!visit) throw new NotFoundException("Site visit was not found.");
    return visit;
  }
}
