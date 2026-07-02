import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});
async function main() {
  try {
    await prisma.$connect();
    console.log("SUCCESS: Connected to the database!");
  } catch (e: any) {
    console.error("ERROR: ", e.message);
  }
}
main().finally(() => prisma.$disconnect());
