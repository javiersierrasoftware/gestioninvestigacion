import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CiarpController } from './ciarp.controller';
import { CiarpService } from './ciarp.service';
import { CiarpRequest, CiarpRequestSchema } from './schemas/ciarp.schema';
// @ts-ignore
import { Product, ProductSchema } from '../products/schemas/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CiarpRequest.name, schema: CiarpRequestSchema },
      { name: Product.name, schema: ProductSchema }
    ])
  ],
  controllers: [CiarpController],
  providers: [CiarpService],
})
export class CiarpModule {}
