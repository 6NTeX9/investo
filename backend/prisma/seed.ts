import { PrismaClient, ProjectStatus, PropertyType, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await hash("Admin@12345", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@aurumestate.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@aurumestate.com",
      passwordHash,
      role: Role.SUPER_ADMIN
    }
  });

  const agent = await prisma.agent.upsert({
    where: { email: "maya@aurumestate.com" },
    update: {},
    create: {
      name: "Maya Kapoor",
      email: "maya@aurumestate.com",
      phone: "+971552107788",
      whatsapp: "+971552107788",
      bio: "Luxury residential advisor focused on central Dubai inventory."
    }
  });

  const category = await prisma.propertyCategory.upsert({
    where: { slug: "luxury-properties" },
    update: {},
    create: {
      name: "Luxury properties",
      slug: "luxury-properties",
      description: "Premium residential properties and branded residences."
    }
  });

  await prisma.property.upsert({
    where: { slug: "altus-residences-skyline-district" },
    update: {},
    create: {
      title: "Altus Residences",
      slug: "altus-residences-skyline-district",
      description: "High-floor residences with panoramic city views and a private residents' club.",
      price: 2800000,
      address: "Sheikh Mohammed Bin Rashid Boulevard, Dubai",
      city: "Dubai",
      location: "Downtown Skyline District",
      type: PropertyType.APARTMENT,
      bedrooms: 3,
      bathrooms: 4,
      siteArea: "4.8 acres",
      builderName: "Aurum Developments",
      constructionStatus: "60% complete",
      status: ProjectStatus.ONGOING,
      amenities: ["Infinity pool", "Concierge", "Gym", "Valet parking"],
      nearbyLandmarks: ["Dubai Mall - 6 min", "Business Bay - 8 min", "DIFC - 12 min"],
      isFeatured: true,
      isPublished: true,
      publishedAt: new Date(),
      categoryId: category.id,
      agentId: agent.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
            key: "seed/altus/hero.jpg",
            alt: "Altus Residences hero",
            sortOrder: 0
          }
        ]
      }
    }
  });

  await prisma.adminActivity.create({
    data: {
      actorId: admin.id,
      action: "SEED_DATABASE",
      entity: "System"
    }
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
