import { Model } from 'mongoose';
import { Product, ProductDocument } from './schemas/product.schema';
import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductsService {
    private productModel;
    constructor(productModel: Model<ProductDocument>);
    create(userId: string, createProductDto: CreateProductDto): Promise<Product>;
    findMyProducts(userId: string): Promise<Product[]>;
    findAll(): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    update(id: string, userId: string, updateData: any): Promise<Product>;
}
