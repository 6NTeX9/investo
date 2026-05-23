import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { compare } from "bcryptjs";
import { DatabaseService } from "../database/database.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly database: DatabaseService,
    private readonly jwt: JwtService
  ) {}

  async login(dto: LoginDto) {
    const user = await this.database.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.isActive) throw new UnauthorizedException("Invalid credentials");

    const isValid = await compare(dto.password, user.passwordHash);
    if (!isValid) throw new UnauthorizedException("Invalid credentials");

    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  async me(userId: string) {
    return this.database.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true }
    });
  }
}
