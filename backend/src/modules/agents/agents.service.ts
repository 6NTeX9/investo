import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { CreateAgentDto } from "./dto/create-agent.dto";

@Injectable()
export class AgentsService {
  constructor(private readonly database: DatabaseService) {}

  findAll() {
    return this.database.agent.findMany({
      include: {
        properties: { select: { id: true, title: true, slug: true, status: true } },
        user: { select: { role: true } }
      },
      orderBy: { createdAt: "desc" }
    });
  }

  create(dto: CreateAgentDto) {
    return this.database.agent.create({ data: dto });
  }

  update(id: string, dto: Partial<CreateAgentDto>) {
    return this.database.agent.update({ where: { id }, data: dto });
  }

  remove(id: string) {
    return this.database.agent.delete({ where: { id } });
  }

  /** Returns stats for the agent linked to a given userId (used by the agent themselves). */
  async getMyStats(userId: string) {
    const agent = await this.database.agent.findUnique({ where: { userId } });
    if (!agent) return null;
    return this._buildAgentStats(agent);
  }

  /** Returns summary stats for every agent (Admin / Manager view). */
  async getAllAgentsReport() {
    const agents = await this.database.agent.findMany({ orderBy: { name: "asc" } });
    return Promise.all(agents.map((a) => this._buildAgentStats(a)));
  }

  /** Returns full enquiry + site-visit rows for one agent (for detailed per-agent CSV). */
  async getAgentDetailedReport(agentId: string) {
    const agent = await this.database.agent.findUnique({ where: { id: agentId } });
    if (!agent) return null;

    const [enquiries, visits, activities] = await Promise.all([
      this.database.enquiry.findMany({
        where: { agentId },
        include: { property: { select: { title: true } } },
        orderBy: { createdAt: "asc" }
      }),
      this.database.siteVisit.findMany({
        where: { assignedAgentId: agentId },
        include: { property: { select: { title: true } } },
        orderBy: { preferredAt: "asc" }
      }),
      this.database.adminActivity.findMany({
        where: {
          actor: { agent: { id: agentId } },
          entity: "Enquiry"
        },
        include: { actor: { select: { name: true, email: true } } },
        orderBy: { createdAt: "asc" }
      })
    ]);

    return { agent, enquiries, visits, activities };
  }

  // ── Private helper ────────────────────────────────────────────────────────

  private async _buildAgentStats(agent: { id: string; name: string; email: string; phone: string; avatarUrl: string | null; createdAt: Date }) {
    const [enquiries, visits, lastActivity] = await Promise.all([
      this.database.enquiry.findMany({
        where: { agentId: agent.id },
        select: { id: true, status: true, createdAt: true, updatedAt: true, name: true, property: { select: { title: true } } }
      }),
      this.database.siteVisit.findMany({
        where: { assignedAgentId: agent.id },
        select: { id: true, status: true, preferredAt: true, createdAt: true, name: true, property: { select: { title: true } } }
      }),
      this.database.adminActivity.findFirst({
        where: { actor: { agent: { id: agent.id } } },
        orderBy: { createdAt: "desc" },
        select: { createdAt: true }
      })
    ]);

    const enquiryStats = {
      total: enquiries.length,
      NEW: enquiries.filter((e) => e.status === "NEW").length,
      CONTACTED: enquiries.filter((e) => e.status === "CONTACTED").length,
      QUALIFIED: enquiries.filter((e) => e.status === "QUALIFIED").length,
      CLOSED: enquiries.filter((e) => e.status === "CLOSED").length,
      LOST: enquiries.filter((e) => e.status === "LOST").length
    };

    const visitStats = {
      total: visits.length,
      REQUESTED: visits.filter((v) => v.status === "REQUESTED").length,
      CONFIRMED: visits.filter((v) => v.status === "CONFIRMED").length,
      RESCHEDULED: visits.filter((v) => v.status === "RESCHEDULED").length,
      COMPLETED: visits.filter((v) => v.status === "COMPLETED").length,
      CANCELLED: visits.filter((v) => v.status === "CANCELLED").length
    };

    const conversionRate =
      enquiries.length > 0
        ? Math.round((enquiryStats.CLOSED / enquiries.length) * 100)
        : 0;

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        email: agent.email,
        phone: agent.phone,
        avatarUrl: agent.avatarUrl,
        memberSince: agent.createdAt
      },
      enquiryStats,
      visitStats,
      conversionRate,
      lastActivityAt: lastActivity?.createdAt ?? null,
      recentEnquiries: enquiries
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10),
      recentVisits: visits
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
    };
  }
}
