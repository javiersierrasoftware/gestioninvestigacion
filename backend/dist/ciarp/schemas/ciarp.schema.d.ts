import { Document, Types } from 'mongoose';
export type CiarpRequestDocument = CiarpRequest & Document;
export declare enum CiarpStatus {
    EN_ESTUDIO = "En Estudio CIARP",
    APROBADO = "Aprobado",
    RECHAZADO = "Rechazado",
    REQUIERE_AJUSTES = "Requiere Ajustes"
}
export declare class CiarpRequest {
    docenteId: Types.ObjectId;
    productId: Types.ObjectId;
    tipoReconocimiento: string;
    puntosSolicitados: number;
    evidencias: {
        fileUrl: string;
        originalName: string;
        description: string;
    }[];
    status: CiarpStatus;
    comentariosComite?: string;
}
export declare const CiarpRequestSchema: import("mongoose").Schema<CiarpRequest, import("mongoose").Model<CiarpRequest, any, any, any, (Document<unknown, any, CiarpRequest, any, import("mongoose").DefaultSchemaOptions> & CiarpRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CiarpRequest, any, import("mongoose").DefaultSchemaOptions> & CiarpRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, CiarpRequest>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CiarpRequest, Document<unknown, {}, CiarpRequest, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<CiarpRequest & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    docenteId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CiarpRequest, Document<unknown, {}, CiarpRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CiarpRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    productId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, CiarpRequest, Document<unknown, {}, CiarpRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CiarpRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tipoReconocimiento?: import("mongoose").SchemaDefinitionProperty<string, CiarpRequest, Document<unknown, {}, CiarpRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CiarpRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    puntosSolicitados?: import("mongoose").SchemaDefinitionProperty<number, CiarpRequest, Document<unknown, {}, CiarpRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CiarpRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    evidencias?: import("mongoose").SchemaDefinitionProperty<{
        fileUrl: string;
        originalName: string;
        description: string;
    }[], CiarpRequest, Document<unknown, {}, CiarpRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CiarpRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<CiarpStatus, CiarpRequest, Document<unknown, {}, CiarpRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CiarpRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    comentariosComite?: import("mongoose").SchemaDefinitionProperty<string | undefined, CiarpRequest, Document<unknown, {}, CiarpRequest, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<CiarpRequest & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CiarpRequest>;
