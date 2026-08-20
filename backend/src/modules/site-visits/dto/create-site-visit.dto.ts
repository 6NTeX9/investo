import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsEmail, IsEnum, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { VisitStatus } from "@prisma/client";

export class CreateSiteVisitDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^[\d\+\-\s\(\)]{8,20}$/, { message: "Invalid phone number format" })
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  preferredAt!: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  propertyId?: string;
}

export class AdminCreateSiteVisitDto extends CreateSiteVisitDto {
  @ApiPropertyOptional({ enum: VisitStatus, default: VisitStatus.CONFIRMED })
  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedAgentId?: string | null;
}

export class UpdateSiteVisitStatusDto {
  @ApiProperty({ enum: VisitStatus })
  @IsEnum(VisitStatus)
  status!: VisitStatus;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  assignedAgentId?: string | null;
}

export class UpdateSiteVisitDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  preferredAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ enum: VisitStatus })
  @IsOptional()
  @IsEnum(VisitStatus)
  status?: VisitStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  assignedAgentId?: string | null;
}
