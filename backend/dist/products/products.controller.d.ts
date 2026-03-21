import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(req: any, createProductDto: CreateProductDto): Promise<import("./schemas/product.schema").Product>;
    findMyProducts(req: any): Promise<import("./schemas/product.schema").Product[]>;
    findAll(): Promise<import("./schemas/product.schema").Product[]>;
    findOne(id: string): Promise<import("./schemas/product.schema").Product>;
    update(req: any, id: string, updateProductDto: any): Promise<import("./schemas/product.schema").Product>;
}
