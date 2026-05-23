import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { AgentsModule } from "./modules/agents/agents.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { AuthModule } from "./modules/auth/auth.module";
import { BlogModule } from "./modules/blog/blog.module";
import { DatabaseModule } from "./modules/database/database.module";
import { EnquiriesModule } from "./modules/enquiries/enquiries.module";
import { PropertiesModule } from "./modules/properties/properties.module";
import { SiteVisitsModule } from "./modules/site-visits/site-visits.module";
import { UploadsModule } from "./modules/uploads/uploads.module";
import { UsersModule } from "./modules/users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    EnquiriesModule,
    SiteVisitsModule,
    AgentsModule,
    BlogModule,
    UploadsModule,
    AnalyticsModule
  ]
})
export class AppModule {}
