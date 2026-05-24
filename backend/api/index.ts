import { NestFactory } from "@nestjs/core";
import { AppModule } from "../src/app.module";
import { ValidationPipe } from "@nestjs/common";
import helmet from "helmet";
import type { VercelRequest, VercelResponse } from "@vercel/node";

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);
    
    app.use(helmet());
    app.enableCors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:3000"],
      credentials: true
    });
    app.setGlobalPrefix("api");
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true
      })
    );

    await app.init();
    cachedApp = app.getHttpAdapter().getInstance();
  }
  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const app = await bootstrap();
  return app(req, res);
}
