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

  async dashboard() {
    const [properties, enquiries, visits, events] = await this.database.$transaction([
      this.database.property.count(),
      this.database.enquiry.count(),
      this.database.siteVisit.count(),
      this.database.analyticsEvent.groupBy({
        by: ["name"],
        _count: { name: true },
        orderBy: { _count: { name: "desc" } },
        take: 10
      })
    ]);

    return { properties, enquiries, visits, events };
  }
}
