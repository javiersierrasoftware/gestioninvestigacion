import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Convocatoria, ConvocatoriaDocument } from './schemas/convocatoria.schema';
import { Project, ProjectDocument } from '../projects/schemas/project.schema';

@Injectable()
export class ConvocatoriasService {
  constructor(
    @InjectModel(Convocatoria.name) private convocatoriaModel: Model<ConvocatoriaDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>
  ) {}

  async create(createConvocatoriaDto: any): Promise<Convocatoria> {
    const created = new this.convocatoriaModel(createConvocatoriaDto);
    return created.save();
  }

  async findAll(): Promise<Convocatoria[]> {
    return this.convocatoriaModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Convocatoria> {
    const convo = await this.convocatoriaModel.findById(id).exec();
    if (!convo) throw new NotFoundException('Convocatoria no encontrada');
    return convo;
  }

  async update(id: string, updateConvocatoriaDto: any): Promise<Convocatoria> {
    const existing = await this.convocatoriaModel.findByIdAndUpdate(id, updateConvocatoriaDto, { new: true }).exec();
    if (!existing) throw new NotFoundException('Convocatoria no encontrada');
    return existing;
  }

  async remove(id: string): Promise<any> {
    const projectsCount = await this.projectModel.countDocuments({ convocatoria: id }).exec();
    
    if (projectsCount > 0) {
      throw new BadRequestException('No se puede eliminar la convocatoria porque ya hay investigadores participando en ella con proyectos radicados.');
    }

    const deleted = await this.convocatoriaModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Convocatoria no encontrada');
    return deleted;
  }
}
