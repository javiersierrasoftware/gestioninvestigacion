import { IsString, IsNotEmpty, IsEnum, IsOptional, ValidateNested, IsArray, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductCategory, ProductStatus } from '../schemas/product.schema';

class AuthorDto {
  @IsOptional()
  @IsString()
  user?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  isExternal: boolean;
}

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  uniqueId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorDto)
  authors: AuthorDto[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
