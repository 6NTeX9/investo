import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.enableCors({
    origin: config.get<string>("CORS_ORIGIN")?.split(",") ?? ["http://localhost:3000"],
    credentials: true
  });
  app.setGlobalPrefix("api", { exclude: ["/"] });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );

  const documentConfig = new DocumentBuilder()
    .setTitle("BricksNBeyond API")
    .setDescription("REST API for properties, CMS, leads, site visits, media, and analytics.")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, documentConfig));

  await app.listen(config.get<number>("PORT") ?? 4000);
}

void bootstrap();
