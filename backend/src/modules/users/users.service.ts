import { Injectable } from "@nestjs/common";
import { hash } from "bcryptjs";
import { DatabaseService } from "../database/database.service";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  findAll() {
    return this.database.user.findMany({
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true, createdAt: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async create(dto: CreateUserDto) {
    const { password, ...userData } = dto;
    const passwordHash = await hash(dto.password, 12);
    return this.database.user.create({
      data: { ...userData, passwordHash },
      select: { id: true, name: true, email: true, role: true, isActive: true }
    });
  }
}
