import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { LeadStatus, Role } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { CreateEnquiryDto } from "./dto/create-enquiry.dto";

@Injectable()
export class EnquiriesService {
  constructor(private readonly database: DatabaseService) {}

  create(dto: CreateEnquiryDto) {
    return this.database.enquiry.create({ data: dto });
  }

  async findAll(userId: string, role: Role, status?: LeadStatus) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    
    if (role === Role.SALES_AGENT) {
      const agent = await this.database.agent.findUnique({
        where: { userId }
      });
      if (agent) {
        where.agentId = agent.id;
      } else {
        return [];
      }
    }
    
    return this.database.enquiry.findMany({
      where,
      include: { property: true, agent: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async updateStatus(
    userId: string,
    role: Role,
    id: string,
    status: LeadStatus,
    agentId?: string
  ) {
    const enquiry = await this.database.enquiry.findUnique({
      where: { id }
    });
    if (!enquiry) {
      throw new NotFoundException("Enquiry not found");
    }

    const targetAgentId = role === Role.SALES_AGENT ? enquiry.agentId : agentId;
    
    if (role === Role.SALES_AGENT) {
      const agent = await this.database.agent.findUnique({
        where: { userId }
      });
      
      if (!agent || enquiry.agentId !== agent.id) {
        throw new BadRequestException("You can only modify enquiries assigned to you.");
      }
      
      if (agentId !== undefined && agentId !== agent.id) {
        throw new BadRequestException("You cannot reassign this enquiry to another agent.");
      }
    }

    // Create audit log entry
    await this.database.adminActivity.create({
      data: {
        actorId: userId,
        action: "UPDATE_ENQUIRY",
        entity: "Enquiry",
        entityId: id,
        metadata: {
          previousStatus: enquiry.status,
          newStatus: status,
          previousAgentId: enquiry.agentId,
          newAgentId: targetAgentId
        }
      }
    });
    
    return this.database.enquiry.update({
      where: { id },
      data: {
        status,
        agentId: targetAgentId
      }
    });
  }
}
