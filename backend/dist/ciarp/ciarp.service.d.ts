import { Model, Types } from 'mongoose';
import { CiarpRequest, CiarpRequestDocument, CiarpStatus } from './schemas/ciarp.schema';
import { ProductDocument } from '../products/schemas/product.schema';
export declare class CiarpService {
    private ciarpModel;
    private productModel;
    constructor(ciarpModel: Model<CiarpRequestDocument>, productModel: Model<ProductDocument>);
    createRequest(docenteId: string, productId: string, tipoReconocimiento: string, puntosSolicitados: number, evidencias: {
        fileUrl: string;
        originalName: string;
        description: string;
    }[]): Promise<import("mongoose").Document<unknown, {}, CiarpRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & CiarpRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAllRequests(): Promise<(import("mongoose").Document<unknown, {}, CiarpRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & CiarpRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMyRequests(docenteId: string): Promise<(import("mongoose").Document<unknown, {}, CiarpRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & CiarpRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    evaluateRequest(requestId: string, status: CiarpStatus, comentariosComite: string): Promise<import("mongoose").Document<unknown, {}, CiarpRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & CiarpRequest & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
}
