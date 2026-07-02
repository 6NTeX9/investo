import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const prop = await prisma.property.findFirst({
    where: { title: { contains: 'Surya Valencia', mode: 'insensitive' } }
  });
  
  if (prop) {
    await prisma.property.update({
      where: { id: prop.id },
      data: { slug: 'surya-valencia', isPublished: true, publishedAt: new Date() }
    });
    console.log("SUCCESS: Updated property ID " + prop.id + " to slug 'surya-valencia' and marked as published.");
  } else {
    console.log("ERROR: Property 'Surya Valencia' not found in the database.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
