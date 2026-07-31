import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: "ok",
      name: "BricksNBeyond API",
      timestamp: new Date().toISOString()
    };
  }
}
