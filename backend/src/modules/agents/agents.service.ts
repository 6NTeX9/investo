import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CreateAgentDto } from "./dto/create-agent.dto";

@Injectable()
export class AgentsService {
  constructor(private readonly database: DatabaseService) {}

  findAll() {
    return this.database.agent.findMany({
      include: { properties: { select: { id: true, title: true, slug: true, status: true } } },
      orderBy: { createdAt: "desc" }
    });
  }

  create(dto: CreateAgentDto) {
    return this.database.agent.create({ data: dto });
  }

  update(id: string, dto: Partial<CreateAgentDto>) {
    return this.database.agent.update({ where: { id }, data: dto });
  }
}
