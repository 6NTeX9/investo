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
      phone: "+919876543210",
      whatsapp: "+919876543210",
      bio: "Luxury residential advisor focused on central Mumbai inventory.",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
    }
  });

  await prisma.agent.upsert({
    where: { email: "sarah.j@aurumestate.com" },
    update: {},
    create: {
      name: "Sarah Jenkins",
      email: "sarah.j@aurumestate.com",
      phone: "+919876543211",
      whatsapp: "+919876543211",
      bio: "Expert in high-end villa communities in South Mumbai and Lutyens Delhi, with over 8 years of luxury advisory experience.",
      avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80"
    }
  });

  await prisma.agent.upsert({
    where: { email: "alexander.w@aurumestate.com" },
    update: {},
    create: {
      name: "Alexander Wright",
      email: "alexander.w@aurumestate.com",
      phone: "+919876543212",
      whatsapp: "+919876543212",
      bio: "Specialized in off-plan investment properties and branded penthouses in Worli and Bandra Kurla Complex.",
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80"
    }
  });

  await prisma.agent.upsert({
    where: { email: "elena.r@aurumestate.com" },
    update: {},
    create: {
      name: "Elena Rossi",
      email: "elena.r@aurumestate.com",
      phone: "+919876543213",
      whatsapp: "+919876543213",
      bio: "Advising international investors on premium commercial office assets and prime residential developments in Bangalore and Gurgaon.",
      avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80"
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
      price: 28000000,
      address: "Senapati Bapat Marg, Lower Parel, Mumbai",
      city: "Mumbai",
      location: "Lower Parel",
      type: PropertyType.APARTMENT,
      bedrooms: 3,
      bathrooms: 4,
      siteArea: "4.8 acres",
      builderName: "Aurum Developments",
      constructionStatus: "60% complete",
      status: ProjectStatus.ONGOING,
      amenities: ["Infinity pool", "Concierge", "Gym", "Valet parking"],
      nearbyLandmarks: ["Palladium Mall - 5 min", "Worli Sea Face - 10 min", "Dadar Station - 12 min"],
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
