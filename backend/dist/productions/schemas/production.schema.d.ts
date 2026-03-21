import { Document, Types } from 'mongoose';
export declare enum ProductionType {
    ARTICULO = "articulo",
    LIBRO = "libro",
    CAPITULO = "capitulo",
    PATENTE = "patente",
    SOFTWARE = "software",
    OTRO = "otro"
}
export declare enum ValidationStatus {
    PENDIENTE = "pendiente",
    APROBADO = "aprobado",
    RECHAZADO = "rechazado"
}
export declare class Production {
    title: string;
    type: ProductionType;
    docente: Types.ObjectId;
    grupo?: Types.ObjectId;
    revistaOEditorial?: string;
    fechaPublicacion?: Date;
    identificador?: string;
    evidencias: string[];
    status: ValidationStatus;
    puntosSalarialesAsignados: number;
    bonificacionAsignada: number;
    comentariosComite?: string;
}
export declare const ProductionSchema: import("mongoose").Schema<Production, import("mongoose").Model<Production, any, any, any, (Document<unknown, any, Production, any, import("mongoose").DefaultSchemaOptions> & Production & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Production, any, import("mongoose").DefaultSchemaOptions> & Production & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Production>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Production, Document<unknown, {}, Production, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    title?: import("mongoose").SchemaDefinitionProperty<string, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    type?: import("mongoose").SchemaDefinitionProperty<ProductionType, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    docente?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    grupo?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId | undefined, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    revistaOEditorial?: import("mongoose").SchemaDefinitionProperty<string | undefined, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    fechaPublicacion?: import("mongoose").SchemaDefinitionProperty<Date | undefined, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    identificador?: import("mongoose").SchemaDefinitionProperty<string | undefined, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    evidencias?: import("mongoose").SchemaDefinitionProperty<string[], Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<ValidationStatus, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    puntosSalarialesAsignados?: import("mongoose").SchemaDefinitionProperty<number, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    bonificacionAsignada?: import("mongoose").SchemaDefinitionProperty<number, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    comentariosComite?: import("mongoose").SchemaDefinitionProperty<string | undefined, Production, Document<unknown, {}, Production, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Production & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Production>;
