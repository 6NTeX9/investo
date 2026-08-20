import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsObject, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateAnalyticsEventDto {
  @ApiProperty()
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  visitorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;
}
