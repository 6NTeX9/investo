import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ProjectStatus, PropertyType } from "@prisma/client";
import { IsArray, IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreatePropertyDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  slug!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty()
  @IsString()
  address!: string;

  @ApiProperty()
  @IsString()
  city!: string;

  @ApiProperty()
  @IsString()
  location!: string;

  @ApiProperty({ enum: PropertyType })
  @IsEnum(PropertyType)
  type!: PropertyType;

  @ApiProperty({ enum: ProjectStatus })
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nearbyLandmarks?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
