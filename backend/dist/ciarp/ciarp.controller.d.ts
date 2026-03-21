import type { Response } from 'express';
import { CiarpService } from './ciarp.service';
import { CiarpStatus } from './schemas/ciarp.schema';
export declare class CiarpController {
    private readonly ciarpService;
    constructor(ciarpService: CiarpService);
    createRequest(req: any, files: Array<any>, body: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/ciarp.schema").CiarpRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/ciarp.schema").CiarpRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAllRequests(): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/ciarp.schema").CiarpRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/ciarp.schema").CiarpRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getMyRequests(req: any): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/ciarp.schema").CiarpRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/ciarp.schema").CiarpRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    evaluateRequest(id: string, body: {
        status: CiarpStatus;
        comentariosComite: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("./schemas/ciarp.schema").CiarpRequestDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/ciarp.schema").CiarpRequest & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    downloadEvidence(filename: string, res: Response): void;
}
