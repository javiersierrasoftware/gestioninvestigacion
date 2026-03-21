import { ProductCategory, ProductStatus } from '../schemas/product.schema';
declare class AuthorDto {
    user?: string;
    name: string;
    isExternal: boolean;
}
export declare class CreateProductDto {
    title: string;
    category: ProductCategory;
    type: string;
    uniqueId?: string;
    authors: AuthorDto[];
    metadata?: Record<string, any>;
    status?: ProductStatus;
}
export {};
