import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { hash } from "bcryptjs";
import { Role, UserStatus } from "@prisma/client";
import { DatabaseService } from "../database/database.service";
import { CreateUserDto } from "./dto/create-user.dto";

export { UserStatus };

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

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
    return this.database.user.create({
      data: { ...userData, passwordHash },
      select: { id: true, name: true, email: true, role: true, status: true, isActive: true }
    });
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

    return this.database.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, phone: true, role: true, status: true, isActive: true, createdAt: true }
    });
  }

  async toggleActive(id: string) {
    const user = await this.database.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    const newActive = !user.isActive;
    return this.database.user.update({
      where: { id },
      data: { isActive: newActive, status: newActive ? UserStatus.ACTIVE : UserStatus.INACTIVE },
      select: { id: true, name: true, email: true, role: true, status: true, isActive: true }
    });
  }

  async remove(id: string) {
    const user = await this.database.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return this.database.user.delete({ where: { id } });
  }
}
