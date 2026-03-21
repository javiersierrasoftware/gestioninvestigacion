import { ConvocatoriasService } from './convocatorias.service';
export declare class ConvocatoriasController {
    private readonly convocatoriasService;
    constructor(convocatoriasService: ConvocatoriasService);
    create(createDto: any): Promise<import("./schemas/convocatoria.schema").Convocatoria>;
    findAll(): Promise<import("./schemas/convocatoria.schema").Convocatoria[]>;
    findOne(id: string): Promise<import("./schemas/convocatoria.schema").Convocatoria>;
    update(id: string, updateDto: any): Promise<import("./schemas/convocatoria.schema").Convocatoria>;
    remove(id: string): Promise<any>;
}
