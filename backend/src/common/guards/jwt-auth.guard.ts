import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Role } from "@prisma/client";
import { DatabaseService } from "../../modules/database/database.service";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly supabase: SupabaseClient;

  constructor(
    config: ConfigService,
    private readonly database: DatabaseService
  ) {
    const supabaseUrl = config.get<string>("SUPABASE_URL") ?? config.get<string>("NEXT_PUBLIC_SUPABASE_URL");
    const supabaseKey =
      config.get<string>("SUPABASE_PUBLISHABLE_KEY") ??
      config.get<string>("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase Auth requires SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY");
    }

    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: { sub: string; email: string; role: Role };
    }>();

    const token = request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) throw new UnauthorizedException("Missing bearer token");

    const { data, error } = await this.supabase.auth.getUser(token);
    if (error) throw new UnauthorizedException("Invalid Supabase session");
    const email = data.user.email;

    if (!email) throw new UnauthorizedException("Session does not contain an email");

    const user = await this.database.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new UnauthorizedException("User is not allowed to access admin");

    request.user = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return true;
  }
}
