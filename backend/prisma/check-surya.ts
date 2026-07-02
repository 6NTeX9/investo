import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const p = await prisma.property.findUnique({
    where: { slug: 'surya-valencia' },
    include: { agent: true, category: true }
  });
  console.log(p ? `Found in DB! slug: ${p.slug}, isPublished: ${p.isPublished}, agentId: ${p.agentId}, categoryId: ${p.categoryId}` : 'Not found in DB');
}
main().finally(() => prisma.$disconnect());
