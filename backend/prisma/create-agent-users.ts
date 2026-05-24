import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

// Load .env
const envPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, "utf8");
  for (const line of envConfig.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      else if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("DATABASE_URL not found!");
  process.exit(1);
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

async function main() {
  const defaultPassword = "Agent@12345";
  const passwordHash = await hash(defaultPassword, 12);
  
  console.log("Fetching agents from database...");
  const agents = await prisma.agent.findMany();
  console.log(`Found ${agents.length} agents.`);
  
  for (const agent of agents) {
    console.log(`\nProcessing agent: ${agent.name} (${agent.email})...`);
    
    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: agent.email }
    });
    
    if (!user) {
      console.log(`User not found for ${agent.email}. Creating new User account...`);
      user = await prisma.user.create({
        data: {
          name: agent.name,
          email: agent.email,
          phone: agent.phone,
          passwordHash,
          role: Role.SALES_AGENT,
          isActive: true
        }
      });
      console.log(`User created with ID ${user.id}`);
    } else {
      console.log(`User already exists for ${agent.email} with ID ${user.id}`);
    }
    
    // Link Agent to User if not linked
    if (agent.userId !== user.id) {
      await prisma.agent.update({
        where: { id: agent.id },
        data: { userId: user.id }
      });
      console.log(`Linked agent ${agent.name} to user ${user.id}`);
    } else {
      console.log(`Agent ${agent.name} already linked to user ${user.id}`);
    }
  }
  
  console.log("\nAgent login credentials generated successfully!");
  console.log(`Default credentials for all agents:`);
  console.log(`Password: ${defaultPassword}`);
  console.log(`Emails:`);
  agents.forEach(a => console.log(` - ${a.email}`));
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
