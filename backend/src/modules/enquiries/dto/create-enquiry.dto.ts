import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateEnquiryDto {
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
