import { IsString, IsEmail, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsOptional()
  facultad?: string;

  @IsString()
  @IsOptional()
  programa?: string;

  @IsString()
  @IsOptional()
  identificationNumber?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  mincienciasCategory?: string;

  @IsString()
  @IsOptional()
  researchAreas?: string;

  @IsString()
  @IsOptional()
  biography?: string;

  @IsString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  mesVinculacion?: string;

  @IsString()
  @IsOptional()
  anoVinculacion?: string;

  @IsString()
  @IsOptional()
  tipoContrato?: string;

  @IsString()
  @IsOptional()
  cvlacUrl?: string;

  @IsArray()
  @IsOptional()
  grupos?: string[];
}
