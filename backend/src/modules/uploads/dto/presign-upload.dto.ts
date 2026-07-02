import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsNumber, IsOptional, IsString, Max } from "class-validator";

export class PresignUploadDto {
  @ApiProperty()
  @IsString()
  fileName!: string;

  @ApiProperty()
  @IsString()
  contentType!: string;

  @ApiProperty()
  @IsNumber()
  @Max(50 * 1024 * 1024)
  size!: number;

  @ApiPropertyOptional({ enum: ["properties", "projects", "blogs", "brochures"] })
  @IsOptional()
  @IsIn(["properties", "projects", "blogs", "brochures"])
  folder?: string;
}
