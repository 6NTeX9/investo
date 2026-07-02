import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const properties = await prisma.property.findMany({
    where: { images: { some: {} } },
    select: { title: true, images: true }
  });
  for (const p of properties) {
    if (p.title.includes("nothing")) {
      console.log(`Property: ${p.title}`);
      for (const img of p.images) {
        console.log(`  - Image: ${(img as any).url}`);
      }
    }
  }
}
main().finally(() => prisma.$disconnect());
