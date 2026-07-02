import { Controller, Delete, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Role } from "@prisma/client";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { UploadsService } from "./uploads.service";

@ApiTags("Uploads")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Delete()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_MANAGER)
  remove(@Query("key") key: string) {
    return this.uploads.remove(key);
  }
}
