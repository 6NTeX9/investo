import { Injectable } from "@nestjs/common";
import { LeadStatus } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { CreateEnquiryDto } from "./dto/create-enquiry.dto";

@Injectable()
export class EnquiriesService {
  constructor(private readonly database: DatabaseService) {}

  create(dto: CreateEnquiryDto) {
    return this.database.enquiry.create({ data: dto });
  }

  findAll(status?: LeadStatus) {
    return this.database.enquiry.findMany({
      where: status ? { status } : undefined,
      include: { property: true, agent: true },
      orderBy: { createdAt: "desc" }
    });
  }

  updateStatus(id: string, status: LeadStatus, agentId?: string) {
    return this.database.enquiry.update({
      where: { id },
      data: { status, agentId }
    });
  }
}
