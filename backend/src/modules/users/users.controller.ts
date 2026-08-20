import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService, UserStatus } from "./users.service";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER)
  findAll() {
    return this.users.findAll();
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  /** Edit name, email, phone, role, status - Restricted to SUPER_ADMIN & ADMIN */
  @Patch(":id")
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  update(
    @Param("id") id: string,
    @Body() body: {
      name?: string;
      email?: string;
      phone?: string;
      role?: Role;
      status?: UserStatus;
    }
  ) {
    return this.users.update(id, body);
  }

  @Patch(":id/toggle-active")
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  toggleActive(@Param("id") id: string) {
    return this.users.toggleActive(id);
  }

  @Delete(":id")
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  remove(@Param("id") id: string) {
    return this.users.remove(id);
  }
}
