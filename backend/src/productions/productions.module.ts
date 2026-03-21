import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductionsService } from './productions.service';
import { ProductionsController } from './productions.controller';
import { Production, ProductionSchema } from './schemas/production.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Production.name, schema: ProductionSchema }])],
  controllers: [ProductionsController],
  providers: [ProductionsService],
  exports: [ProductionsService],
})
export class ProductionsModule {}
