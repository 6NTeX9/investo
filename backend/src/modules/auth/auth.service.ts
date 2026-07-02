import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class AuthService {
  constructor(private readonly database: DatabaseService) {}

  async me(userId: string) {
    return this.database.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true }
    });
  }
}
