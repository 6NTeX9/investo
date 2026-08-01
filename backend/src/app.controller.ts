import { Controller, Get, Header } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  @Header("Cache-Control", "public, max-age=60, s-maxage=300")
  getHealth() {
    return {
      status: "ok",
      name: "BricksNBeyond API",
      timestamp: new Date().toISOString()
    };
  }
}
