import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? requiredEnv("SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const defaultPassword = process.env.SUPABASE_MIGRATION_DEFAULT_PASSWORD ?? "Admin@12345";

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true, role: true }
  });

  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) throw listError;

  const existingUsersByEmail = new Map(existingUsers.users.map((authUser) => [authUser.email, authUser]));

  for (const user of users) {
    const existing = existingUsersByEmail.get(user.email);
    const metadata = {
      appUserId: user.id,
      name: user.name,
      role: user.role
    };

    if (existing) {
      const { error } = await supabase.auth.admin.updateUserById(existing.id, {
        email: user.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: metadata,
        app_metadata: { role: user.role }
      });
      if (error) throw error;
      console.log(`Updated Supabase Auth user: ${user.email}`);
    } else {
      const { error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: metadata,
        app_metadata: { role: user.role }
      });
      if (error) throw error;
      console.log(`Created Supabase Auth user: ${user.email}`);
    }
  }

  console.log(`Synced ${users.length} users to Supabase Auth.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
