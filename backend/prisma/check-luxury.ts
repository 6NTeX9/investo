import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.property.findUnique({
    where: { slug: 'luxury-in-your-reach' },
  });
  console.log(p ? `Found luxury-in-your-reach! isPublished=${p.isPublished}` : 'luxury-in-your-reach not found in DB');
}
main().finally(() => prisma.$disconnect());
