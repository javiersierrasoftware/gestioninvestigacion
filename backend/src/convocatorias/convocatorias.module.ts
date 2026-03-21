import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConvocatoriasService } from './convocatorias.service';
import { ConvocatoriasController } from './convocatorias.controller';
import { Convocatoria, ConvocatoriaSchema } from './schemas/convocatoria.schema';
import { Project, ProjectSchema } from '../projects/schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Convocatoria.name, schema: ConvocatoriaSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [ConvocatoriasController],
  providers: [ConvocatoriasService],
  exports: [ConvocatoriasService],
})
export class ConvocatoriasModule {}
