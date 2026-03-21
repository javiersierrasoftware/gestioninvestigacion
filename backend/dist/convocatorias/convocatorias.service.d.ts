import { Model } from 'mongoose';
import { Convocatoria, ConvocatoriaDocument } from './schemas/convocatoria.schema';
import { ProjectDocument } from '../projects/schemas/project.schema';
export declare class ConvocatoriasService {
    private convocatoriaModel;
    private projectModel;
    constructor(convocatoriaModel: Model<ConvocatoriaDocument>, projectModel: Model<ProjectDocument>);
    create(createConvocatoriaDto: any): Promise<Convocatoria>;
    findAll(): Promise<Convocatoria[]>;
    findOne(id: string): Promise<Convocatoria>;
    update(id: string, updateConvocatoriaDto: any): Promise<Convocatoria>;
    remove(id: string): Promise<any>;
}
