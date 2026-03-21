import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './schemas/group.schema';

@Injectable()
export class GroupsService {
  constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>) {}

  async create(createGroupDto: any): Promise<Group> {
    const createdGroup = new this.groupModel(createGroupDto);
    return createdGroup.save();
  }

  async findAll(): Promise<Group[]> {
    return this.groupModel.find().sort({ name: 1 }).exec();
  }

  async findOne(id: string): Promise<Group | null> {
    return this.groupModel.findById(id).exec();
  }

  async update(id: string, updateGroupDto: any): Promise<Group | null> {
    return this.groupModel.findByIdAndUpdate(id, updateGroupDto, { new: true }).exec();
  }

  async remove(id: string) {
    return this.groupModel.findByIdAndDelete(id).exec();
  }

  async seedGroups() {
    const count = await this.groupModel.countDocuments();
    if (count > 0) return { message: 'Base de datos de grupos ya poblada' };

    const groupsData = [
      { name: 'ANÁLISIS FUNCIONAL Y ECUACIONES DIFERENCIALES-AFED', categoria: 'A1', leaderName: 'OSMIN FERRER VILLAR', facultad: 'EDUCACIÓN Y CIENCIAS' },
      { name: 'BIOLOGIA EVOLUTIVA', categoria: 'C', leaderName: 'LILIANA SOLANO FLOREZ', facultad: 'EDUCACIÓN Y CIENCIAS' },
      { name: 'SALUD – GINDES', categoria: 'C', leaderName: 'MARA OSORNO NAVARRO', facultad: 'CIENCIAS DE LA SALUD' },
      { name: 'CUIDADO DE LA SALUD', categoria: 'C', leaderName: 'ADRIANA CONTRERAS', facultad: 'CIENCIAS DE LA SALUD' },
      { name: 'FONOCIENCIA', categoria: 'C', leaderName: 'MARIVEL MONTES ROTELA', facultad: 'CIENCIAS DE LA SALUD' },
      { name: 'GRUPO INTERDISCIPLINAR DE FÍSICA TEÓRICA Y APLICADA (GIFTA)', categoria: 'C', leaderName: 'WILSON ROSADO MERCADO', facultad: 'EDUCACIÓN Y CIENCIAS' },
      { name: 'REPRODUCCIÓN Y MEJORAMIENTO GENÉTICO ANIMAL', categoria: 'A', leaderName: 'DONICER EDUARDO MONTES VERGARA', facultad: 'CIENCIAS AGROPECUARIAS' },
      { name: 'BIODIVERSIDAD TROPICAL', categoria: 'C', leaderName: 'ALCIDES CASIMIRO SAMPEDRO MARIN', facultad: 'CIENCIAS AGROPECUARIAS' },
      { name: 'BIOPROSPECCION AGROPECUARIA', categoria: 'A', leaderName: 'ALEXANDER PEREZ CORDERO', facultad: 'CIENCIAS AGROPECUARIAS' },
      { name: 'ESTRATEGIA Y GESTIÓN', categoria: 'A', leaderName: 'CARLOS MIGUEL PACHECO RUIZ', facultad: 'CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS' },
      { name: 'GESTIÓN DE LA PRODUCCIÓN Y LA CALIDAD ORGANIZACIONAL', categoria: 'C', leaderName: 'ALVARO ENRIQUE SANTAMARIA ESCOBAR', facultad: 'CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS' },
      { name: 'OIKOS', categoria: 'A', leaderName: 'LEON JULIO ARANGO BUELVAS', facultad: 'CIENCIAS ECONÓMICAS Y ADMINISTRATIVAS' },
      { name: 'PROCESOS AGROINDUSTRIALES Y DE DESARROLLO SOTENIBLE – PADES', categoria: 'A', leaderName: 'JAIRO GUADALUPE SALCEDO MENDOZA', facultad: 'INGENIERIA' },
      { name: 'DESARROLLO E INNOVACIÓN DE PROCESOS ALIMENTARIOS - DESINPA', categoria: 'C', leaderName: 'MARIA TAVERA QUIROZ', facultad: 'INGENIERIA' },
      { name: 'GESTIÓN INTEGRAL DE PROCESOS, MEDIO AMBIENTE Y CALIDAD - GIMAC', categoria: 'C', leaderName: 'YELITZA AGUAS MENDOZA', facultad: 'INGENIERIA' },
      { name: 'GRESA', categoria: 'C', leaderName: 'ALFREDO FERNANDEZ QUINTERO', facultad: 'INGENIERIA' },
      { name: 'GRUPO DE INVESTIGACION MANGLAR', categoria: 'B', leaderName: 'JAVIER EMILIO SIERRA', facultad: 'INGENIERIA' },
      { name: 'GIGEVIS: GEOTECNIA, VÍAS Y SANITARIA', categoria: 'C', leaderName: 'JHON JAIRO FERIA', facultad: 'INGENIERIA' },
      { name: 'ESTROPTI', categoria: 'C', leaderName: 'CARLOS MILLÁN', facultad: 'INGENIERIA' },
      { name: 'BIOINDUSTRIAS', categoria: 'C', leaderName: 'QUELBIS ROMÁN QUINTERO BERTEL', facultad: 'INGENIERIA' },
      { name: 'ZOOLOGIA Y ECOLOGIA DE LA UNIVERSIDAD DE SUCRE', categoria: 'A', leaderName: 'DEIVYS MOISES ALVAREZ GARCIA', facultad: 'EDUCACIÓN Y CIENCIAS' },
      { name: 'DIDÁCTICA DE LAS CIENCIAS, DIDAK-CIENCIAS', categoria: 'A', leaderName: 'ALBERTO DE JESUS PUPO IRIARTE', facultad: 'EDUCACIÓN Y CIENCIAS' },
      { name: 'CIENCIAS MEDICAS Y FARMACEUTICAS', categoria: 'A', leaderName: 'NERLIS PAOLA PAJARO CASTRO', facultad: 'CIENCIAS DE LA SALUD' },
      { name: 'PENSAMIENTO MATEMÁTICO-PEMA', categoria: 'A', leaderName: 'JAIRO ESCORCIA MERCADO', facultad: 'EDUCACIÓN Y CIENCIAS' },
      { name: 'SODEHUPAZ', categoria: 'A', leaderName: 'OSCAR ANDRÉS DONCEL', facultad: 'EDUCACIÓN Y CIENCIAS' },
      { name: 'INVESTIGACIÓN E INNOVACIÓN EN AMBIENTE Y SALUD', categoria: 'A', leaderName: 'PEDRO JOSÉ BLANCO TUIRAN', facultad: 'EDUCACIÓN Y CIENCIAS' },
      { name: 'GIMAGUAS', categoria: 'A', leaderName: 'GUILLERMO GUTIERREZ RIBBON', facultad: 'INGENIERIA' },
      { name: 'GRUPO DE INVESTIGACIÓN E INNOVACIÓN EN ELECTRÓNICA (GINELECT)', categoria: 'A', leaderName: 'RAMON ANTONIO ALVAREZ LOPEZ', facultad: 'INGENIERIA' },
      { name: 'CLINICA EN MEDICINA-GICLIM', categoria: 'A', leaderName: 'EDGAR VERGARA DAGOBETH', facultad: 'CIENCIAS DE LA SALUD' }
    ];

    return this.groupModel.insertMany(groupsData);
  }
}
