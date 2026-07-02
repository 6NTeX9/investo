import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { hash } from "bcryptjs";
import { Role, UserStatus } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { CreateUserDto } from "./dto/create-user.dto";

export { UserStatus };

@Injectable()
export class UsersService {
  private supabaseAdmin?: SupabaseClient;

  constructor(
    private readonly database: DatabaseService,
    private readonly config: ConfigService
  ) {}

  private getSupabaseAdmin() {
    if (this.supabaseAdmin) return this.supabaseAdmin;

    const supabaseUrl = this.config.get<string>("SUPABASE_URL") ?? this.config.get<string>("NEXT_PUBLIC_SUPABASE_URL");
    const serviceRoleKey = this.config.get<string>("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("User management requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    }

    this.supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    return this.supabaseAdmin;
  }

  findAll() {
    return this.database.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.database.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException("A user with this email already exists.");
    const { password, ...userData } = dto;
    const passwordHash = await hash(password, 12);

    const user = await this.database.user.create({
      data: { ...userData, passwordHash },
      select: { id: true, name: true, email: true, role: true, status: true, isActive: true }
    });

    try {
      await this.upsertSupabaseAuthUser({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        password
      });
    } catch (error) {
      await this.database.user.delete({ where: { id: user.id } }).catch(() => undefined);
      throw error;
    }

    return user;
  }

  /** Full edit: name, email, phone, role, status */
  async update(id: string, dto: {
    name?: string;
    email?: string;
    phone?: string | null;
    role?: Role;
    status?: UserStatus;
    password?: string;
  }) {
    const user = await this.database.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");

    if (dto.email && dto.email !== user.email) {
      const conflict = await this.database.user.findUnique({ where: { email: dto.email } });
      if (conflict) throw new ConflictException("Email is already in use by another user.");
    }

    const data: any = {};
    if (dto.name  !== undefined) data.name  = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.phone !== undefined) data.phone = dto.phone || null;
    if (dto.role  !== undefined) data.role  = dto.role;
    if (dto.status !== undefined) {
      data.status   = dto.status;
      data.isActive = dto.status === "ACTIVE";
    }
    if (dto.password && dto.password.length >= 8) {
      data.passwordHash = await hash(dto.password, 12);
    }

    const updated = await this.database.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, isActive: true, createdAt: true }
    });

    await this.upsertSupabaseAuthUser({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      password: dto.password,
      previousEmail: user.email
    });

    return updated;
  }

  async toggleActive(id: string) {
    const user = await this.database.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    const newActive = !user.isActive;
    const updated = await this.database.user.update({
      where: { id },
      data: { isActive: newActive, status: newActive ? UserStatus.ACTIVE : UserStatus.INACTIVE },
      select: { id: true, name: true, email: true, role: true, status: true, isActive: true }
    });

    await this.upsertSupabaseAuthUser({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role
    });

    return updated;
  }

  async remove(id: string) {
    const user = await this.database.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    const deleted = await this.database.user.delete({ where: { id } });
    await this.deleteSupabaseAuthUser(user.email);
    return deleted;
  }

  private async upsertSupabaseAuthUser(input: {
    id: string;
    name: string;
    email: string;
    role: Role;
    password?: string;
    previousEmail?: string;
  }) {
    const existing = await this.findSupabaseUserByEmail(input.previousEmail ?? input.email);
    const metadata = {
      appUserId: input.id,
      name: input.name,
      role: input.role
    };

    if (existing) {
      const { error } = await this.getSupabaseAdmin().auth.admin.updateUserById(existing.id, {
        email: input.email,
        ...(input.password ? { password: input.password } : {}),
        email_confirm: true,
        user_metadata: metadata,
        app_metadata: { role: input.role }
      });
      if (error) throw error;
      return;
    }

    const { error } = await this.getSupabaseAdmin().auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: metadata,
      app_metadata: { role: input.role }
    });
    if (error) throw error;
  }

  private async deleteSupabaseAuthUser(email: string) {
    const existing = await this.findSupabaseUserByEmail(email);
    if (!existing) return;

    const { error } = await this.getSupabaseAdmin().auth.admin.deleteUser(existing.id);
    if (error) throw error;
  }

  private async findSupabaseUserByEmail(email: string) {
    const { data, error } = await this.getSupabaseAdmin().auth.admin.listUsers();
    if (error) throw error;
    return data.users.find((user) => user.email === email);
  }
}
