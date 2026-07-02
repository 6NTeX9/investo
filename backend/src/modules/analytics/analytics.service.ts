import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { CreateAnalyticsEventDto } from "./dto/create-analytics-event.dto";

@Injectable()
export class AnalyticsService {
  constructor(private readonly database: DatabaseService) {}

  track(dto: CreateAnalyticsEventDto) {
    return this.database.analyticsEvent.create({
      data: {
        ...dto,
        payload: dto.payload as Prisma.InputJsonValue | undefined
      }
    });
  }

  async dashboard(since?: string) {
    let sinceDate: Date | undefined = undefined;
    if (since) {
      const parsed = new Date(since);
      if (!isNaN(parsed.getTime())) {
        sinceDate = parsed;
      }
    }

    const [properties, enquiries, visits, events, recentEnquiries, recentVisits, newEnquiriesCount, newVisitsCount] =
      await this.database.$transaction([
        this.database.property.count(),
        this.database.enquiry.count({
          where: sinceDate ? { createdAt: { gt: sinceDate } } : undefined,
        }),
        this.database.siteVisit.count({
          where: { status: { in: ["REQUESTED", "CONFIRMED", "RESCHEDULED"] } },
        }),
        this.database.analyticsEvent.groupBy({
          by: ["name"],
          _count: { name: true },
          orderBy: { _count: { name: "desc" } },
          take: 10,
        }),
        // Last 5 enquiries with property name
        this.database.enquiry.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            phone: true,
            status: true,
            createdAt: true,
            property: { select: { title: true } },
          },
        }),
        // Last 5 site visits
        this.database.siteVisit.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            phone: true,
            status: true,
            preferredAt: true,
            createdAt: true,
            property: { select: { title: true } },
          },
        }),
        // Count NEW (unseen) enquiries since sinceDate
        this.database.enquiry.count({
          where: {
            status: "NEW",
            ...(sinceDate ? { createdAt: { gt: sinceDate } } : {}),
          },
        }),
        // Count REQUESTED visits
        this.database.siteVisit.count({
          where: { status: "REQUESTED" },
        }),
      ]);

    return {
      properties,
      enquiries,
      visits,
      events,
      recentEnquiries,
      recentVisits,
      newEnquiriesCount,
      newVisitsCount,
    };
  }
}
