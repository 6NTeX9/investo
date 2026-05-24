import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

// 1. Manually parse .env file to load DATABASE_URL for Supabase
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

const remoteUrl = process.env.DATABASE_URL;

if (!remoteUrl) {
  console.error("Error: DATABASE_URL not found in env configuration!");
  process.exit(1);
}

// 2. Initialize both Prisma Clients
const localPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:postgres@localhost:5432/luxury_estate?schema=public",
    },
  },
});

const remotePrisma = new PrismaClient({
  datasources: {
    db: {
      url: remoteUrl,
    },
  },
});

async function runMigration() {
  console.log("Starting clean database migration from Local (Docker) to Supabase...");
  console.log("Remote URL: " + remoteUrl!.replace(/:[^:@]+@/, ":****@"));

  try {
    // 0. Clean remote database to prevent ID/relationship mismatches
    console.log("\n0. Cleaning remote database tables...");
    
    console.log("Deleting AnalyticsEvents...");
    await remotePrisma.analyticsEvent.deleteMany();
    
    console.log("Deleting AdminActivities...");
    await remotePrisma.adminActivity.deleteMany();
    
    console.log("Deleting PropertyImages...");
    await remotePrisma.propertyImage.deleteMany();
    
    console.log("Deleting Enquiries...");
    await remotePrisma.enquiry.deleteMany();
    
    console.log("Deleting SiteVisits...");
    await remotePrisma.siteVisit.deleteMany();
    
    console.log("Deleting Properties...");
    await remotePrisma.property.deleteMany();
    
    console.log("Deleting PropertyCategories...");
    await remotePrisma.propertyCategory.deleteMany();
    
    console.log("Deleting Agents...");
    await remotePrisma.agent.deleteMany();
    
    console.log("Deleting Users...");
    await remotePrisma.user.deleteMany();
    
    console.log("Deleting Blogs...");
    await remotePrisma.blog.deleteMany();
    
    console.log("Remote database cleaned successfully.");

    // 1. Migrate Users
    console.log("\n1. Migrating Users...");
    const users = await localPrisma.user.findMany();
    console.log(`Found ${users.length} local users.`);
    for (const u of users) {
      await remotePrisma.user.create({
        data: {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          passwordHash: u.passwordHash,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        },
      });
    }
    console.log(`Successfully migrated ${users.length} Users.`);

    // 2. Migrate Agents
    console.log("\n2. Migrating Agents...");
    const agents = await localPrisma.agent.findMany();
    console.log(`Found ${agents.length} local agents.`);
    for (const a of agents) {
      await remotePrisma.agent.create({
        data: {
          id: a.id,
          userId: a.userId,
          name: a.name,
          email: a.email,
          phone: a.phone,
          whatsapp: a.whatsapp,
          avatarUrl: a.avatarUrl,
          bio: a.bio,
          createdAt: a.createdAt,
          updatedAt: a.updatedAt,
        },
      });
    }
    console.log(`Successfully migrated ${agents.length} Agents.`);

    // 3. Migrate Property Categories
    console.log("\n3. Migrating Property Categories...");
    const categories = await localPrisma.propertyCategory.findMany();
    console.log(`Found ${categories.length} local categories.`);
    for (const c of categories) {
      await remotePrisma.propertyCategory.create({
        data: {
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        },
      });
    }
    console.log(`Successfully migrated ${categories.length} Property Categories.`);

    // 4. Migrate Properties
    console.log("\n4. Migrating Properties...");
    const properties = await localPrisma.property.findMany();
    console.log(`Found ${properties.length} local properties.`);
    for (const p of properties) {
      await remotePrisma.property.create({
        data: {
          id: p.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          price: p.price,
          currency: p.currency,
          address: p.address,
          city: p.city,
          location: p.location,
          latitude: p.latitude,
          longitude: p.longitude,
          mapLink: p.mapLink,
          type: p.type,
          bedrooms: p.bedrooms,
          bathrooms: p.bathrooms,
          siteArea: p.siteArea,
          constructionStatus: p.constructionStatus,
          builderName: p.builderName,
          status: p.status,
          amenities: p.amenities,
          nearbyLandmarks: p.nearbyLandmarks,
          isFeatured: p.isFeatured,
          isPublished: p.isPublished,
          publishedAt: p.publishedAt,
          categoryId: p.categoryId,
          agentId: p.agentId,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        },
      });
    }
    console.log(`Successfully migrated ${properties.length} Properties.`);

    // 5. Migrate Property Images
    console.log("\n5. Migrating Property Images...");
    const images = await localPrisma.propertyImage.findMany();
    console.log(`Found ${images.length} local property images.`);
    for (const img of images) {
      await remotePrisma.propertyImage.create({
        data: {
          id: img.id,
          propertyId: img.propertyId,
          url: img.url,
          key: img.key,
          alt: img.alt,
          type: img.type,
          sortOrder: img.sortOrder,
          createdAt: img.createdAt,
        },
      });
    }
    console.log(`Successfully migrated ${images.length} Property Images.`);

    // 6. Migrate Enquiries
    console.log("\n6. Migrating Enquiries...");
    const enquiries = await localPrisma.enquiry.findMany();
    console.log(`Found ${enquiries.length} local enquiries.`);
    for (const eq of enquiries) {
      await remotePrisma.enquiry.create({
        data: {
          id: eq.id,
          name: eq.name,
          phone: eq.phone,
          email: eq.email,
          message: eq.message,
          status: eq.status,
          propertyId: eq.propertyId,
          agentId: eq.agentId,
          createdAt: eq.createdAt,
          updatedAt: eq.updatedAt,
        },
      });
    }
    console.log(`Successfully migrated ${enquiries.length} Enquiries.`);

    // 7. Migrate Site Visits
    console.log("\n7. Migrating Site Visits...");
    const visits = await localPrisma.siteVisit.findMany();
    console.log(`Found ${visits.length} local site visits.`);
    for (const v of visits) {
      await remotePrisma.siteVisit.create({
        data: {
          id: v.id,
          name: v.name,
          phone: v.phone,
          email: v.email,
          message: v.message,
          preferredAt: v.preferredAt,
          status: v.status,
          propertyId: v.propertyId,
          assignedAgentId: v.assignedAgentId,
          createdAt: v.createdAt,
          updatedAt: v.updatedAt,
        },
      });
    }
    console.log(`Successfully migrated ${visits.length} Site Visits.`);

    // 8. Migrate Blogs
    console.log("\n8. Migrating Blogs...");
    const blogs = await localPrisma.blog.findMany();
    console.log(`Found ${blogs.length} local blog posts.`);
    for (const b of blogs) {
      await remotePrisma.blog.create({
        data: {
          id: b.id,
          title: b.title,
          slug: b.slug,
          excerpt: b.excerpt,
          content: b.content,
          coverUrl: b.coverUrl,
          tags: b.tags,
          isPublished: b.isPublished,
          publishedAt: b.publishedAt,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        },
      });
    }
    console.log(`Successfully migrated ${blogs.length} Blogs.`);

    // 9. Migrate Admin Activities
    console.log("\n9. Migrating Admin Activities...");
    const activities = await localPrisma.adminActivity.findMany();
    console.log(`Found ${activities.length} local activities.`);
    for (const ac of activities) {
      await remotePrisma.adminActivity.create({
        data: {
          id: ac.id,
          actorId: ac.actorId,
          action: ac.action,
          entity: ac.entity,
          entityId: ac.entityId,
          metadata: ac.metadata ?? undefined,
          createdAt: ac.createdAt,
        },
      });
    }
    console.log(`Successfully migrated ${activities.length} Admin Activities.`);

    // 10. Migrate Analytics Events
    console.log("\n10. Migrating Analytics Events...");
    const events = await localPrisma.analyticsEvent.findMany();
    console.log(`Found ${events.length} local analytics events.`);
    for (const ev of events) {
      await remotePrisma.analyticsEvent.create({
        data: {
          id: ev.id,
          name: ev.name,
          path: ev.path,
          visitorId: ev.visitorId,
          payload: ev.payload ?? undefined,
          createdAt: ev.createdAt,
        },
      });
    }
    console.log(`Successfully migrated ${events.length} Analytics Events.`);

    console.log("\nClean database migration completed successfully!");
  } catch (error) {
    console.error("Migration failed with error:", error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await remotePrisma.$disconnect();
  }
}

runMigration();
